<?php

namespace Bga\Games\GetOnBoardParisRome;

use Bga\Games\GetOnBoardParisRome\Objects\PlacedRoute;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\UserException;

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
    */

    public function actPlaceDeparturePawn(#[IntParam(min: 0)] int $position, int $currentPlayerId) {
        $tickets = $this->getCardsFromDb($this->tickets->getCardsInLocation('hand', $currentPlayerId));

        $mapElements = $this->MAP_POSITIONS[$this->getMap()][$position];
        $ticketNumber = \array_find($mapElements, fn($element) => $element >= 1 && $element <= 12);

        if ($ticketNumber === null || !\array_any($tickets, fn($ticket) => $ticket->type == $ticketNumber)) {
            throw new UserException("Invalid departure");
        }

        $this->DbQuery("UPDATE player SET `player_departure_position` = $position WHERE `player_id` = $currentPlayerId");
        
        $this->bga->notify->all('log', clienttranslate('${player_name} has chose the position for its departure pawn'), [
            'playerId' => (string) $currentPlayerId,
            'player_name' => $this->getPlayerName($currentPlayerId),
        ]);

        $this->gamestate->setPlayerNonMultiactive($currentPlayerId, 'next');
    }
        
  	
    public function actPlaceRoute(
        #[IntParam(name: 'from', min: 0)] int $routeFrom,
        #[IntParam(name: 'to', min: 0)] int $routeTo,
        int $activePlayerId,
    ) {
        $allPlacedRoutes = $this->getPlacedRoutes();
        $playerPlacedRoutes = array_filter($allPlacedRoutes, fn($placedRoute) => $placedRoute->playerId === $activePlayerId);
        $currentPosition = $this->getCurrentPosition($activePlayerId, $playerPlacedRoutes);
        $from = $currentPosition == $routeFrom ? $routeFrom : $routeTo;
        $to = $currentPosition == $routeFrom ? $routeTo : $routeFrom;
        $turnShape = $this->getPlayerTurnShape($activePlayerId);
        $possibleRoutes = $this->getPossibleRoutes($activePlayerId, $this->getMap(), $turnShape, $currentPosition, $allPlacedRoutes);
        $possibleRoute = \array_find($possibleRoutes, fn($route) => $this->isSameRoute($route, $from, $to));

        if ($possibleRoute == null) {
            throw new UserException("Invalid route");
        }

        $round = $this->getRoundNumber();
        $useTurnZone = $possibleRoute->useTurnZone ? 1 : 0;
        $this->DbQuery("INSERT INTO placed_routes(`player_id`, `from`, `to`, `round`, `use_turn_zone`, `traffic_jam`) VALUES ($activePlayerId, $from, $to, $round, $useTurnZone, $possibleRoute->trafficJam)");

        $mapElements = $this->MAP_POSITIONS[$this->getMap()][$to];
        $zones = array_map(fn($element) => floor($element / 10), $mapElements);
        $zones = array_unique(array_filter($zones, fn($zone) => $zone >=2 && $zone <= 5));
        if ($useTurnZone) {            
            $zones[] = 6;
        }
        if ($possibleRoute->trafficJam > 0) {            
            $zones[] = 7;
        }

        $logElements = array_values(array_filter($mapElements, fn($element) => in_array($element, [0, 20, 30, 32, 40, 41, 42, 50, 51, 52])));
        
        $this->bga->notify->all('placedRoute', clienttranslate('${player_name} places a route marker to ${elements}'), [
            'playerId' => $activePlayerId,
            'player_name' => $this->getPlayerName($activePlayerId),
            'marker' => PlacedRoute::forNotif($from, $to, false),
            'zones' => $zones,
            'position' => $to,
            'elements' => $logElements,
        ]);

        if ($possibleRoute->isElimination) {
            $this->setGameStateValue(ELIMINATE_PLAYER, $activePlayerId);
            $this->applyConfirmTurn($activePlayerId);
        }

        $this->notifUpdateScoreSheet($activePlayerId);

        //$this->bga->tableStats->inc('placedRoutes', 1);
        //$this->bga->playerStats->inc('placedRoutes', 1, $activePlayerId);

        $this->gamestate->nextState('placeNext');
    }

    private function applyCancel(int $activePlayerId, array $routes, string $message) {
        $routesIds = array_map(fn($route) => $route->id, $routes);

        $this->DbQuery("DELETE FROM placed_routes WHERE `id` IN (".implode(',', $routesIds).")");

        $this->bga->notify->all('removeMarkers', $message, [
            'playerId' => $activePlayerId,
            'player_name' => $this->getPlayerNameById($activePlayerId),
            'markers' => array_map(fn($route) => PlacedRoute::forNotif($route->from, $route->to, false), $routes),
        ]);

        $this->notifUpdateScoreSheet($activePlayerId);

        $this->gamestate->nextState('placeNext');
    }
  	
    public function actCancelLast(int $activePlayerId) {
        $placedRoutes = $this->getPlacedRoutes($activePlayerId);
        $canCancel = count($placedRoutes) > 0 && !end($placedRoutes)->validated;

        if (!$canCancel) {
            throw new UserException("No move to cancel");
        }

        $routesToCancel = [end($placedRoutes)];
        $this->applyCancel($activePlayerId, $routesToCancel, clienttranslate('${player_name} cancels the last marker'));
    }
  	
    public function actResetTurn(int $activePlayerId) {
        $placedRoutes = $this->getPlacedRoutes($activePlayerId);
        $unvalidatedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => !$placedRoute->validated));

        if (count($unvalidatedRoutes) == 0) {
            throw new UserException("No move to cancel");
        }

        $this->applyCancel($activePlayerId, $unvalidatedRoutes, clienttranslate('${player_name} resets its turn'));
    }

    private function applyConfirmTurn(int $playerId) {
        $placedRoutes = $this->getPlacedRoutes($playerId);
        $unvalidatedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => !$placedRoute->validated));
        $unvalidatedRoutesIds = array_map(fn($placedRoute) => $placedRoute->id, $unvalidatedRoutes);

        $this->DbQuery("UPDATE placed_routes SET `validated` = 1 WHERE `id` IN (".implode(',', $unvalidatedRoutesIds).")");

        $this->bga->notify->all('confirmTurn', '', [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerNameById($playerId),
            'markers' => array_map(fn($route) => PlacedRoute::forNotif($route->from, $route->to, true), $unvalidatedRoutes),
        ]);
        
        $markersPlaced = count($unvalidatedRoutesIds);
        $this->bga->tableStats->inc('markersPlaced', $markersPlaced);
        $this->bga->playerStats->inc('markersPlaced', $markersPlaced, $playerId);
        $stationsUsed = $markersPlaced - count($this->getPlayerTurnShape($playerId));
        if ($stationsUsed > 0) {
            $this->bga->tableStats->inc('stationsUsed', $stationsUsed);
            $this->bga->playerStats->inc('stationsUsed', $stationsUsed, $playerId);
        }
        $turnZoneUsed = count(array_filter($unvalidatedRoutes, fn($route) => $route->useTurnZone));
        if ($turnZoneUsed > 0) {
            $this->bga->tableStats->inc('turnZoneUsed', $turnZoneUsed);
            $this->bga->playerStats->inc('turnZoneUsed', $turnZoneUsed, $playerId);
        }
        $trafficJamUsed = array_reduce(array_map(fn($route) => $route->trafficJam, $unvalidatedRoutes), fn($a, $b) => $a + $b, 0);
        if ($trafficJamUsed > 0) {
            $this->bga->tableStats->inc('trafficJamUsed', $trafficJamUsed);
            $this->bga->playerStats->inc('trafficJamUsed', $trafficJamUsed, $playerId);
        }
        
        $scoreSheets = $this->notifUpdateScoreSheet($playerId);
        $score = $scoreSheets->validated->total;
        $this->bga->playerScore->set($playerId, $score, null);

        $this->gamestate->nextState('nextPlayer');
    }
  	
    public function actConfirmTurn(int $activePlayerId) {
        $this->applyConfirmTurn($activePlayerId);
    }
}
