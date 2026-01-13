<?php
declare(strict_types=1);

namespace Bga\Games\GetOnBoardParisRome\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\GetOnBoardParisRome\Game;

class EndRound extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: \ST_END_ROUND,
            type: StateType::GAME,
            name: 'endRound',
        );
    }

    public function onEnteringState(): int|string {
        $this->markCompletedCommonObjectives();

        $this->game->tickets->moveAllCardsInLocation('turn', 'discard');

        $startNewRound = intval($this->game->tickets->countCardInLocation('discard')) < ROUND_NUMBER;

        if ($startNewRound) {

            $this->game->activeNextPlayer();

            $playerId = intval($this->game->getActivePlayerId());
            if ($this->game->isEliminated($playerId)) {
                return $this->onEnteringState();
            }

            $this->game->setGameStateValue(FIRST_PLAYER, $playerId);

            $this->game->tickets->pickCardForLocation('deck', 'turn');
            $this->game->notifCurrentRound();

            $this->game->bga->notify->all('newFirstPlayer', clienttranslate('${player_name} is the new first player'), [
                'playerId' => $playerId,
                'player_name' => $this->game->getActivePlayerName(),
            ]);
        } else {
            $this->game->notifCurrentRound();
        }

        return $startNewRound ? PlaceRoute::class : EndScore::class;
    }

    private function markCompletedCommonObjectives(): void {
        $objectives = $this->game->getCommonObjectives();
        if (count(array_filter($objectives, fn($objective) => !$objective->completed)) === 0) {
            return;
        }

        $playersIds = $this->game->getPlayersIds();
        $allPlacedRoutes = $this->game->getPlacedRoutes();
        $scoreSheets = array_map(fn($playerId) => $this->game->getScoreSheets(
            $playerId,
            array_filter($allPlacedRoutes, fn($placedRoute) => $placedRoute->playerId === $playerId),
            $objectives
        ), $playersIds);

        foreach ($objectives as $objective) {
            if (!$objective->completed && \array_any($scoreSheets, fn($scoreSheet) => $scoreSheet->validated->commonObjectives->subTotals[$objective->number - 1] != null)) {
                $round = $this->game->getRoundNumber();
                $this->game->DbQuery("UPDATE common_objectives SET `completed_at_round` = $round WHERE `id` = $objective->id");

                $this->game->bga->notify->all('flipObjective', clienttranslate('A common objective have been completed'), [
                    'objective' => $objective,
                ]);
            }
        }
    }
}
