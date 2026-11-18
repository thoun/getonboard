<?php
declare(strict_types=1);

namespace Bga\Games\GetOnBoard\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\GetOnBoard\Game;

class NextPlayer extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: \ST_NEXT_PLAYER,
            type: StateType::GAME,
            name: 'nextPlayer',
            updateGameProgression: true,
        );
    }

    public function onEnteringState(): int|string {
        $playerId = (int) $this->game->getActivePlayerId();

        $this->checkPlayerToEliminate();
        if ($this->getRemainingPlayers() == 0) {
            return EndScore::class;
        }

        $this->game->giveExtraTime($playerId);

        $this->game->bga->tableStats->inc('turnsNumber', 1);
        $this->game->bga->playerStats->inc('turnsNumber', 1, $playerId);

        $this->game->activeNextPlayer();
        $playerId = intval($this->game->getActivePlayerId());

        if ($this->game->isEliminated($playerId)) {
            $endOfRound = $playerId == intval($this->game->getGameStateValue(FIRST_PLAYER));
            if ($endOfRound) {
                return EndRound::class;
            } else {
                return $this->onEnteringState();
            }
        }

        $this->checkPlayerToEliminate();
        if ($this->getRemainingPlayers() == 0) {
            return EndScore::class;
        }

        $endOfRound = $playerId == intval($this->game->getGameStateValue(FIRST_PLAYER));

        return $endOfRound ? EndRound::class : PlaceRoute::class;
    }

    private function getRemainingPlayers(): int {
        return intval($this->game->getUniqueValueFromDB( "SELECT count(*) FROM player WHERE player_eliminated = 0"));
    }

    private function checkPlayerToEliminate(): void {
        $eliminatedPlayer = intval($this->game->getGameStateValue(ELIMINATE_PLAYER));
        if ($eliminatedPlayer === 0) {
            return;
        }

        if ($eliminatedPlayer === intval($this->game->getActivePlayerId())) {
            if ($this->getRemainingPlayers() == 1) {
                // if last player, we make a notification same as elimination
                // but we don't really eliminate him as the framework don't like it and game will end anyway
                $this->game->bga->notify->all('playerEliminated', '', [
                    'who_quits' => $eliminatedPlayer,
                    'player_name' => $this->game->getPlayerName($eliminatedPlayer),
                ]);
                $this->game->DbQuery("UPDATE player SET `player_eliminated` = 1 WHERE `player_id` = $eliminatedPlayer");
            } else {
                return;
            }
        }

        $this->game->bga->playerScore->set($eliminatedPlayer, 0, null);
        $this->game->eliminatePlayer($eliminatedPlayer);
        $this->game->setGameStateValue(ELIMINATE_PLAYER, 0);
    }
}
