<?php

namespace Bga\Games\GetOnBoardParisRome;

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stPlaceDeparturePawn() {
        $this->gamestate->setAllPlayersMultiactive();

        //$this->gamestate->nextState('refillHand');
    }

    
    function stStartGame() {
        $sql = "SELECT `player_id`, `player_departure_position` FROM `player` ORDER BY `player_no`";
        $dbResult = self::getCollectionFromDb($sql);

        $mapPositions = $this->MAP_POSITIONS[$this->getMap()];

        foreach ($dbResult as $dbLine) {
            $playerId = intval($dbLine['player_id']);
            $position = intval($dbLine['player_departure_position']);

            $number = \array_find($mapPositions[$position], fn($element) => $element >= 1 && $element <= 12);

            $this->bga->notify->all('placedDeparturePawn', clienttranslate('${player_name} places departure pawn to number ${number}'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'position' => $position,
                'number' => $number,
            ]);
        }

        $this->tickets->moveAllCardsInLocation(null, 'deck');
        $this->tickets->shuffle('deck');

        $ticket = $this->getCardFromDb($this->tickets->pickCardForLocation('deck', 'turn'));

        if (in_array(count($this->getPlayersIds()), [2, 3])) {
            $this->setGameStateValue(CONNECTION_COLOR, $ticket->type % 2 == 0 ? 1 : 2);
        }

        $this->notifCurrentRound();

        $this->gamestate->nextState('start');
    }

    function getRemainingPlayers() {
        return intval($this->getUniqueValueFromDB( "SELECT count(*) FROM player WHERE player_eliminated = 0"));
    }

    function checkPlayerToEliminate() {
        $eliminatedPlayer = intval($this->getGameStateValue(ELIMINATE_PLAYER));
        if ($eliminatedPlayer === 0) {
            return;
        }

        if ($eliminatedPlayer === intval($this->getActivePlayerId())) {
            if ($this->getRemainingPlayers() == 1) {
                // if last player, we make a notification same as elimination
                // but we don't really eliminate him as the framework don't like it and game will end anyway
                $this->bga->notify->all('playerEliminated', '', [
                    'who_quits' => $eliminatedPlayer,
                    'player_name' => $this->getPlayerName($eliminatedPlayer),
                ]);
                $this->DbQuery("UPDATE player SET `player_eliminated` = 1 WHERE `player_id` = $eliminatedPlayer");
            } else {
                return;
            }
        }

        $this->bga->playerScore->set($eliminatedPlayer, 0, null);
        $this->eliminatePlayer($eliminatedPlayer);
        $this->setGameStateValue(ELIMINATE_PLAYER, 0);
    }

    function stNextPlayer() {
        $playerId = $this->getActivePlayerId();

        $this->checkPlayerToEliminate();
        if ($this->getRemainingPlayers() == 0) {
            $this->gamestate->jumpToState(ST_END_SCORE);
            return;
        }

        $this->giveExtraTime($playerId);

        $this->bga->tableStats->inc('turnsNumber', 1);
        $this->bga->playerStats->inc('turnsNumber', 1, $playerId);

        $this->activeNextPlayer();
        $playerId = intval($this->getActivePlayerId());

        if ($this->isEliminated($playerId)) {
            $endOfRound = $playerId == intval($this->getGameStateValue(FIRST_PLAYER));
            if ($endOfRound) {
                $this->gamestate->nextState('endRound');
                return;
            } else {
                return $this->stNextPlayer();
            }
        }

        $this->checkPlayerToEliminate();
        if ($this->getRemainingPlayers() == 0) {
            $this->gamestate->jumpToState(ST_END_SCORE);
            return;
        }

        $endOfRound = $playerId == intval($this->getGameStateValue(FIRST_PLAYER));

        $this->gamestate->nextState($endOfRound ? 'endRound' : 'nextPlayer');
    }

    function stEndRound() {
        $this->markCompletedCommonObjectives();

        $this->tickets->moveAllCardsInLocation('turn', 'discard');

        $startNewRound = intval($this->tickets->countCardInLocation('discard')) < ROUND_NUMBER;

        if ($startNewRound) {

            $this->activeNextPlayer();
    
            $playerId = intval($this->getActivePlayerId());
            if ($this->isEliminated($playerId)) {
                return $this->stEndRound();
            }

            $this->setGameStateValue(FIRST_PLAYER, $playerId);

            $this->tickets->pickCardForLocation('deck', 'turn');
            $this->notifCurrentRound();
    
            $this->bga->notify->all('newFirstPlayer', clienttranslate('${player_name} is the new first player'), [
                'playerId' => $playerId,
                'player_name' => $this->getActivePlayerName(),
            ]);
        } else {
            $this->notifCurrentRound();
        }
            
        $this->gamestate->nextState($startNewRound ? 'newRound' : 'endScore');
    }

    function computeStats(int $playerId) {
        $scoreSheets = $this->getScoreSheets($playerId, $this->getPlacedRoutes($playerId), $this->getCommonObjectives(), true);
        $scoreSheet = $scoreSheets->validated;
        
        $this->bga->playerStats->set('commonObjectivesFirst', count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 10)), $playerId);
        $this->bga->playerStats->set('commonObjectivesSecond', count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 6)), $playerId);
        $this->bga->playerStats->set('personalObjectives', $scoreSheet->personalObjective->total > 0 ? 1 : 0, $playerId);
        $this->bga->playerStats->set('finalScoreOldLadies', $scoreSheet->oldLadies->total, $playerId);
        $this->bga->playerStats->set('finalScoreStudents', $scoreSheet->students->total, $playerId);
        $this->bga->playerStats->set('finalScoreTourists', $scoreSheet->tourists->total, $playerId);
        $this->bga->playerStats->set('finalScoreLovers', $scoreSheet->lovers->total, $playerId);
        if ($scoreSheet->oldLadies->checked > 0) {
            $this->bga->playerStats->set('averagePointsByCheckedOldLadies', (float)$scoreSheet->oldLadies->total / (float)$scoreSheet->oldLadies->checked, $playerId);
        }
        $checkedStudents = $scoreSheet->students->checkedStudents;
        if ($checkedStudents > 0) {
            $this->bga->playerStats->set('averagePointsByCheckedStudents', (float)$scoreSheet->students->total / (float)$checkedStudents, $playerId);
        }
        $checkedTourists = 0;
        foreach ($scoreSheet->tourists->checkedTourists as $checkedTourist) {
            $checkedTourists += $checkedTourist;
        }
        if ($checkedTourists > 0) {
            $this->bga->playerStats->set('averagePointsByCheckedTourists', (float)$scoreSheet->tourists->total / (float)$checkedTourists, $playerId);
        }
        $checkedLovers = 0;
        foreach ($scoreSheet->lovers->checkedLoversLight as $checkedLover) {
            $checkedLovers += $checkedLover;
        }
        foreach ($scoreSheet->lovers->checkedLoversDark as $checkedLover) {
            $checkedLovers += $checkedLover;
        }
        if ($checkedLovers > 0) {
            $this->bga->playerStats->set('averagePointsByCheckedLovers', (float)$scoreSheet->lovers->total / (float)$checkedLovers, $playerId);
        }
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();
        $map = $this->getMap();
        foreach ($playersIds as $playerId) {
            if (!$this->isEliminated($playerId)) {
                $scoreSheets = $this->notifUpdateScoreSheet($playerId, true);
                $score = $scoreSheets->validated->total;
                $this->bga->playerScore->set($playerId, $score, null);
            }

            $personalObjective = intval($this->getUniqueValueFromDB("SELECT player_personal_objective FROM `player` where `player_id` = $playerId"));

            $personalObjectiveLetters = array_map(fn($code) => chr($code), $this->getPersonalObjectiveLetters($playerId));
            $this->bga->notify->all('revealPersonalObjective', clienttranslate('${player_name} personal objective was ${objectiveLetters}'), [
                'playerId' => $playerId,
                'player_name' => $this->getPlayerName($playerId),
                'objectiveLetters' => implode(' ', $personalObjectiveLetters),
                'personalObjective' => $personalObjective,
                'personalObjectiveLetters' => $personalObjectiveLetters,
                'personalObjectivePositions' => $this->getPersonalObjectivePositions($personalObjective, $map),
            ]);

            $this->computeStats($playerId);
        }

        $this->gamestate->nextState('endGame');
    }
}
