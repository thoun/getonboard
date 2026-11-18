<?php
declare(strict_types=1);

namespace Bga\Games\GetOnBoardParisRome\States;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\States\PossibleAction;
use Bga\GameFramework\UserException;
use Bga\GameFramework\VisibleSystemException;
use Bga\Games\GetOnBoardParisRome\Game;

class PlaceDeparturePawn extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: \ST_MULTIPLAYER_PLACE_DEPARTURE_PAWN,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            name: 'placeDeparturePawn',
            description: clienttranslate('Players must place Departure pawn'),
            descriptionMyTurn: clienttranslate('${you} must place Departure pawn'),
        );
    }

    public function onEnteringState(): void {
        $this->game->gamestate->setAllPlayersMultiactive();
    }

    public function getArgs(): array {
        $privateArgs = [];
        $playersIds = $this->game->getPlayersIds();

        $mapPositions = $this->game->MAP_POSITIONS[$this->game->getMap()];

        foreach($playersIds as $playerId) {
            $ticketsCards = $this->game->getCardsFromDb($this->game->tickets->getCardsInLocation('hand', $playerId));
            $ticketsNumbers = array_map(fn($ticket) => $ticket->type, $ticketsCards);
            $positions = array_map(fn($ticketNumber) => \array_find_key($mapPositions, fn($mapPosition) => \array_any($mapPosition, fn($element) => $element == $ticketNumber)), $ticketsNumbers);
            $privateArgs[$playerId] = [
                'tickets' => $ticketsNumbers,
                'positions' => $positions,
            ];
        }

        return [
            '_private' => $privateArgs,
        ];
    }

    #[PossibleAction]
    public function actPlaceDeparturePawn(#[IntParam(min: 0)] int $position, int $currentPlayerId) {
        $tickets = $this->game->getCardsFromDb($this->game->tickets->getCardsInLocation('hand', $currentPlayerId));

        $mapElements = $this->game->MAP_POSITIONS[$this->game->getMap()][$position];
        $ticketNumber = \array_find($mapElements, fn($element) => $element >= 1 && $element <= 12);

        if ($ticketNumber === null || !\array_any($tickets, fn($ticket) => $ticket->type == $ticketNumber)) {
            throw new UserException("Invalid departure");
        }

        $this->game->DbQuery("UPDATE player SET `player_departure_position` = $position WHERE `player_id` = $currentPlayerId");

        $this->game->bga->notify->all('log', clienttranslate('${player_name} has chosen the position for its departure pawn'), [
            'playerId' => (string) $currentPlayerId,
            'player_name' => $this->game->getPlayerNameById($currentPlayerId),
        ]);

        $this->game->gamestate->setPlayerNonMultiactive($currentPlayerId, StartGame::class);
    }

    public function zombie(int $playerId, array $args): void {
        $choices = array_values($args['_private'][$playerId]['positions']);
        if ($choices === []) {
            throw new VisibleSystemException('No legal departure position is available for the zombie player.');
        }

        $position = (int) $this->getRandomZombieChoice($choices);
        $this->actPlaceDeparturePawn($position, $playerId);
    }

}
