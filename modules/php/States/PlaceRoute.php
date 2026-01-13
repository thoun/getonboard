<?php
declare(strict_types=1);

namespace Bga\Games\GetOnBoardParisRome\States;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\UserException;
use Bga\Games\GetOnBoardParisRome\Game;
use Bga\Games\GetOnBoardParisRome\Objects\PlacedRoute;

class PlaceRoute extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: \ST_PLAYER_PLACE_ROUTE,
            type: StateType::ACTIVE_PLAYER,
            name: 'placeRoute',
            description: clienttranslate('${actplayer} must place a route ${shape}'),
            descriptionMyTurn: clienttranslate('${you} must place a route ${shape}'),
            transitions: [
                'placeNext' => self::class,
                'nextPlayer' => NextPlayer::class,
            ],
        );
    }

    public function getArgs(int $activePlayerId): array {
        $playerId = $activePlayerId;

        $mapSize = $this->game->getMap();
        $allPlacedRoutes = $this->game->getPlacedRoutes();
        $playerPlacedRoutes = array_filter($allPlacedRoutes, fn($placedRoute) => $placedRoute->playerId === $playerId);
        $currentPosition = $this->game->getCurrentPosition($playerId, $playerPlacedRoutes);
        $turnShape = $this->game->getPlayerTurnShape($playerId);
        $possibleRoutes = $this->game->getPossibleRoutes($playerId, $mapSize, $turnShape, $currentPosition, $allPlacedRoutes);
        $canConfirm = count($possibleRoutes) === 0;
        $canCancel = count($playerPlacedRoutes) > 0 && !end($playerPlacedRoutes)->validated;

        $stepNumber = count(array_filter($playerPlacedRoutes, fn($placedRoute) => !$placedRoute->validated)) + 1;
        $shapeLength = count($turnShape);
        $stepNumber = $canConfirm ? 0 : min($stepNumber, $shapeLength + 1);

        if ($canConfirm) {
            $scoreSheets = $this->game->getScoreSheets($playerId, $this->game->getPlacedRoutes($playerId), $this->game->getCommonObjectives(), false);
            if ($scoreSheets->current->stations->encircled > $scoreSheets->current->stations->checked) {
                $unvalidatedRoutes = array_filter($playerPlacedRoutes, fn($placedRoute) => !$placedRoute->validated);
                if (!\array_any($unvalidatedRoutes, fn($unvalidatedRoute) => $unvalidatedRoute->useStation)) {
                    $possibleRoutes = $this->getBonusPossibleRoutes($mapSize, $currentPosition, $allPlacedRoutes, $playerPlacedRoutes);
                }
            }
        }
    
        return [
            'currentPosition' => $currentPosition,
            'possibleRoutes' => $possibleRoutes,
            'canConfirm' => $canConfirm,
            'canCancel' => $canCancel,
            'shape' => $turnShape,
            'step' => $stepNumber,
        ];
    }

    #[PossibleAction]
    public function actPlaceRoute(
        #[IntParam(name: 'from', min: 0)] int $routeFrom,
        #[IntParam(name: 'to', min: 0)] int $routeTo,
        int $activePlayerId,
    ) {
        $args = $this->getArgs($activePlayerId);

        $allPlacedRoutes = $this->game->getPlacedRoutes();
        $playerPlacedRoutes = array_filter($allPlacedRoutes, fn($placedRoute) => $placedRoute->playerId === $activePlayerId);
        $currentPosition = $this->game->getCurrentPosition($activePlayerId, $playerPlacedRoutes);
        $from = $currentPosition == $routeFrom ? $routeFrom : $routeTo;
        $to = $currentPosition == $routeFrom ? $routeTo : $routeFrom;
        $possibleRoutes = $args['possibleRoutes'];
        $possibleRoute = \array_find($possibleRoutes, fn($route) => $this->game->isSameRoute($route, $from, $to));

        if ($possibleRoute == null) {
            throw new UserException("Invalid route");
        }

        $map = $this->game->getMap();
        $mapElements = $this->game->MAP_POSITIONS[$map][$to];
        $round = $this->game->getRoundNumber();
        $useTurnZone = $possibleRoute->useTurnZone ? 1 : 0;
        $useStation = $possibleRoute->useStation ? 1 : 0;
        $this->game->DbQuery("INSERT INTO placed_routes(`player_id`, `from`, `to`, `round`, `use_turn_zone`, `connections`, `use_station`) VALUES ($activePlayerId, $from, $to, $round, $useTurnZone, $possibleRoute->connections, $useStation)");

        $zones = array_map(fn($element) => floor($element / 10), $mapElements);
        $zones = array_unique(array_filter($zones, fn($zone) => $zone >=2 && $zone <= 5));
        if ($useTurnZone) {
            $zones[] = 6;
        }
        if ($possibleRoute->connections > 0) {
            $zones[] = 7;
        }
        if ($useStation && !in_array(0, $zones)) {
            $zones[] = 0;
        }

        $logElements = array_values(array_filter($mapElements, fn($element) => in_array($element, [0, 20, 30, 32, 40, 41, 42, 50, 51, 52])));
        
        $this->game->bga->notify->all('placedRoute', clienttranslate('${player_name} places a route marker to ${elements}'), [
            'playerId' => $activePlayerId,
            'player_name' => $this->game->getPlayerName($activePlayerId),
            'marker' => PlacedRoute::forNotif($from, $to, false),
            'zones' => $zones,
            'position' => $to,
            'elements' => $logElements,
        ]);

        if ($possibleRoute->isElimination) {
            $this->game->setGameStateValue(ELIMINATE_PLAYER, $activePlayerId);
            $this->applyConfirmTurn($activePlayerId);
        }

        $this->game->notifUpdateScoreSheet($activePlayerId);

        //$this->game->bga->tableStats->inc('placedRoutes', 1);
        //$this->game->bga->playerStats->inc('placedRoutes', 1, $activePlayerId);

        $this->game->gamestate->nextState('placeNext');
    }

    private function applyCancel(int $activePlayerId, array $routes, string $message) {
        $routesIds = array_map(fn($route) => $route->id, $routes);

        $this->game->DbQuery("DELETE FROM placed_routes WHERE `id` IN (".implode(',', $routesIds).")");

        $this->game->bga->notify->all('removeMarkers', $message, [
            'playerId' => $activePlayerId,
            'player_name' => $this->game->getPlayerNameById($activePlayerId),
            'markers' => array_map(fn($route) => PlacedRoute::forNotif($route->from, $route->to, false), $routes),
        ]);

        $this->game->notifUpdateScoreSheet($activePlayerId);

        $this->game->gamestate->nextState('placeNext');
    }

    #[PossibleAction]
    public function actCancelLast(int $activePlayerId) {
        $placedRoutes = $this->game->getPlacedRoutes($activePlayerId);
        $canCancel = count($placedRoutes) > 0 && !end($placedRoutes)->validated;

        if (!$canCancel) {
            throw new UserException("No move to cancel");
        }

        $routesToCancel = [end($placedRoutes)];
        $this->applyCancel($activePlayerId, $routesToCancel, clienttranslate('${player_name} cancels the last marker'));
    }

    #[PossibleAction]
    public function actResetTurn(int $activePlayerId) {
        $placedRoutes = $this->game->getPlacedRoutes($activePlayerId);
        $unvalidatedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => !$placedRoute->validated));

        if (count($unvalidatedRoutes) == 0) {
            throw new UserException("No move to cancel");
        }

        $this->applyCancel($activePlayerId, $unvalidatedRoutes, clienttranslate('${player_name} resets its turn'));
    }

    private function applyConfirmTurn(int $playerId) {
        $placedRoutes = $this->game->getPlacedRoutes($playerId);
        $unvalidatedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => !$placedRoute->validated));
        $unvalidatedRoutesIds = array_map(fn($placedRoute) => $placedRoute->id, $unvalidatedRoutes);

        $this->game->DbQuery("UPDATE placed_routes SET `validated` = 1 WHERE `id` IN (".implode(',', $unvalidatedRoutesIds).")");

        $this->game->bga->notify->all('confirmTurn', '', [
            'playerId' => $playerId,
            'player_name' => $this->game->getPlayerNameById($playerId),
            'markers' => array_map(fn($route) => PlacedRoute::forNotif($route->from, $route->to, true), $unvalidatedRoutes),
        ]);
        
        $markersPlaced = count($unvalidatedRoutesIds);
        $this->game->bga->tableStats->inc('markersPlaced', $markersPlaced);
        $this->game->bga->playerStats->inc('markersPlaced', $markersPlaced, $playerId);
        $stationsUsed = $markersPlaced - count($this->game->getPlayerTurnShape($playerId));
        if ($stationsUsed > 0) {
            $this->game->bga->tableStats->inc('stationsUsed', $stationsUsed);
            $this->game->bga->playerStats->inc('stationsUsed', $stationsUsed, $playerId);
        }
        $turnZoneUsed = count(array_filter($unvalidatedRoutes, fn($route) => $route->useTurnZone));
        if ($turnZoneUsed > 0) {
            $this->game->bga->tableStats->inc('turnZoneUsed', $turnZoneUsed);
            $this->game->bga->playerStats->inc('turnZoneUsed', $turnZoneUsed, $playerId);
        }
        $connectionsUsed = array_reduce(array_map(fn($route) => $route->connections, $unvalidatedRoutes), fn($a, $b) => $a + $b, 0);
        if ($connectionsUsed > 0) {
            $this->game->bga->tableStats->inc('connectionsUsed', $connectionsUsed);
            $this->game->bga->playerStats->inc('connectionsUsed', $connectionsUsed, $playerId);
        }
        
        $scoreSheets = $this->game->notifUpdateScoreSheet($playerId);
        $score = $scoreSheets->validated->total;
        $this->game->bga->playerScore->set($playerId, $score, null);

        $this->game->gamestate->nextState('nextPlayer');
    }

    #[PossibleAction]
    public function actConfirmTurn(int $activePlayerId) {
        $this->applyConfirmTurn($activePlayerId);
    }

    public function zombie(int $playerId, array $args): ?string {
        $choices = array_values($args['possibleRoutes']);
        if ($choices !== []) {
            $route = $this->getRandomZombieChoice($choices);
            $this->actPlaceRoute($route->from, $route->to, $playerId);
            return null;
        }

        if ($args['canCancel']) {
            $this->actConfirmTurn($playerId);
            return null;
        }

        return NextPlayer::class;
    }

    private function getBonusPossibleRoutes(string $mapSize, int $position, array $allPlacedRoutes, array $playerPlacedRoutes) {
        $connectionRoutes = $mapSize == 'small' ? $this->game->CONNECTION_COLORS[$mapSize][intval($this->game->getGameStateValue(CONNECTION_COLOR))] : [];

        $possibleDestinations = array_values(array_filter(
            $this->game->getDestinations($mapSize, $position), 
            fn($destination) => !\array_any($playerPlacedRoutes, fn($placedRoute) => $this->game->isSameRoute($placedRoute, $position, $destination))
        ));

        $possibleRoutes = array_map(fn($destination) => $this->game->createPossibleRoute($position, $destination, $allPlacedRoutes, $playerPlacedRoutes, [], [0, 0, 0, 0], $connectionRoutes, true), $possibleDestinations);
        return $possibleRoutes;
    }
}
