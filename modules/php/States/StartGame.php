<?php
declare(strict_types=1);

namespace Bga\Games\GetOnBoardParisRome\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\GetOnBoardParisRome\Game;

class StartGame extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: \ST_START_GAME,
            type: StateType::GAME,
            name: 'startGame',
        );
    }

    public function onEnteringState(): string {
        $sql = "SELECT `player_id`, `player_departure_position` FROM `player` ORDER BY `player_no`";
        $dbResult = $this->game->getCollectionFromDb($sql);

        $mapPositions = $this->game->MAP_POSITIONS[$this->game->getMap()];

        foreach ($dbResult as $dbLine) {
            $playerId = intval($dbLine['player_id']);
            $position = intval($dbLine['player_departure_position']);

            $number = \array_find($mapPositions[$position], fn($element) => $element >= 1 && $element <= 12);

            $this->game->bga->notify->all('placedDeparturePawn', clienttranslate('${player_name} places departure pawn to number ${number}'), [
                'playerId' => $playerId,
                'player_name' => $this->game->getPlayerNameById($playerId),
                'position' => $position,
                'number' => $number,
            ]);
        }

        $this->game->tickets->moveAllCardsInLocation(null, 'deck');
        $this->game->tickets->shuffle('deck');

        $ticket = $this->game->getCardFromDb($this->game->tickets->pickCardForLocation('deck', 'turn'));

        $playersIds = $this->game->getPlayersIds();
        if (in_array(count($playersIds), [2, 3])) {
            $this->game->setGameStateValue(CONNECTION_COLOR, $ticket->type % 2 == 0 ? 1 : 2);
            foreach ($playersIds as $playerId) {
                $this->game->notifUpdateScoreSheet($playerId); // update for the connection color
            }
        }

        $this->game->notifCurrentRound();

        return PlaceRoute::class;
    }
}
