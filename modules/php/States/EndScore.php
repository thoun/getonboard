<?php
declare(strict_types=1);

namespace Bga\Games\GetOnBoardParisRome\States;

use Bga\GameFramework\StateType;
use Bga\GameFramework\States\GameState;
use Bga\Games\GetOnBoardParisRome\Game;

class EndScore extends GameState
{
    public function __construct(protected Game $game)
    {
        parent::__construct(
            $game,
            id: \ST_END_SCORE,
            type: StateType::GAME,
            name: 'endScore',
            updateGameProgression: true,
        );
    }

    public function onEnteringState(): int {
        $playersIds = $this->game->getPlayersIds();
        $map = $this->game->getMap();
        foreach ($playersIds as $playerId) {
            if (!$this->game->isEliminated($playerId)) {
                $scoreSheets = $this->game->notifUpdateScoreSheet($playerId, true);
                $score = $scoreSheets->validated->total;
                $this->game->bga->playerScore->set($playerId, $score, null);
            }

            $personalObjective = intval($this->game->getUniqueValueFromDB("SELECT player_personal_objective FROM `player` where `player_id` = $playerId"));

            $personalObjectiveLetters = array_map(fn($code) => chr($code), $this->game->getPersonalObjectiveLetters($playerId));
            $this->game->bga->notify->all('revealPersonalObjective', clienttranslate('${player_name} personal objective was ${objectiveLetters}'), [
                'playerId' => $playerId,
                'player_name' => $this->game->getPlayerName($playerId),
                'objectiveLetters' => implode(' ', $personalObjectiveLetters),
                'personalObjective' => $personalObjective,
                'personalObjectiveLetters' => $personalObjectiveLetters,
                'personalObjectivePositions' => $this->game->getPersonalObjectivePositions($personalObjective, $map),
            ]);

            $this->computeStats($playerId);
        }

        return \ST_END_GAME;
    }

    private function computeStats(int $playerId): void {
        $scoreSheets = $this->game->getScoreSheets($playerId, $this->game->getPlacedRoutes($playerId), $this->game->getCommonObjectives(), true);
        $scoreSheet = $scoreSheets->validated;
        
        $this->game->bga->playerStats->set('commonObjectivesFirst', count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 10)), $playerId);
        $this->game->bga->playerStats->set('commonObjectivesSecond', count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 6)), $playerId);
        $this->game->bga->playerStats->set('personalObjectives', $scoreSheet->personalObjective->total > 0 ? 1 : 0, $playerId);
        $this->game->bga->playerStats->set('finalScoreOldLadies', $scoreSheet->oldLadies->total, $playerId);
        $this->game->bga->playerStats->set('finalScoreStudents', $scoreSheet->students->total, $playerId);
        $this->game->bga->playerStats->set('finalScoreTourists', $scoreSheet->tourists->total, $playerId);
        $this->game->bga->playerStats->set('finalScoreLovers', $scoreSheet->lovers->total, $playerId);
        if ($scoreSheet->oldLadies->checked > 0) {
            $this->game->bga->playerStats->set('averagePointsByCheckedOldLadies', (float)$scoreSheet->oldLadies->total / (float)$scoreSheet->oldLadies->checked, $playerId);
        }
        $checkedStudents = $scoreSheet->students->checkedStudents;
        if ($checkedStudents > 0) {
            $this->game->bga->playerStats->set('averagePointsByCheckedStudents', (float)$scoreSheet->students->total / (float)$checkedStudents, $playerId);
        }
        $checkedTourists = 0;
        foreach ($scoreSheet->tourists->checkedTourists as $checkedTourist) {
            $checkedTourists += $checkedTourist;
        }
        if ($checkedTourists > 0) {
            $this->game->bga->playerStats->set('averagePointsByCheckedTourists', (float)$scoreSheet->tourists->total / (float)$checkedTourists, $playerId);
        }
        $checkedLovers = 0;
        foreach ($scoreSheet->lovers->checkedLoversLight as $checkedLover) {
            $checkedLovers += $checkedLover;
        }
        foreach ($scoreSheet->lovers->checkedLoversDark as $checkedLover) {
            $checkedLovers += $checkedLover;
        }
        if ($checkedLovers > 0) {
            $this->game->bga->playerStats->set('averagePointsByCheckedLovers', (float)$scoreSheet->lovers->total / (float)$checkedLovers, $playerId);
        }
    }
}
