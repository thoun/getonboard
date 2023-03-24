<?php

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

            $number = $this->array_find($mapPositions[$position], fn($element) => $element >= 1 && $element <= 12);

            self::notifyAllPlayers('placedDeparturePawn', clienttranslate('${player_name} places departure pawn to number ${number}'), [
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
                $this->notifyAllPlayers('playerEliminated', '', [
                    'who_quits' => $eliminatedPlayer,
                    'player_name' => $this->getPlayerName($eliminatedPlayer),
                ]);
                $this->DbQuery("UPDATE player SET `player_eliminated` = 1 WHERE `player_id` = $eliminatedPlayer");
            } else {
                return;
            }
        }

        $this->DbQuery("UPDATE player SET `player_score` = 0 WHERE `player_id` = $eliminatedPlayer");
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

        $this->incStat(1, 'turnsNumber');
        $this->incStat(1, 'turnsNumber', $playerId);

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
    
            self::notifyAllPlayers('newFirstPlayer', clienttranslate('${player_name} is the new first player'), [
                'playerId' => $playerId,
                'player_name' => self::getActivePlayerName(),
            ]);
        } else {
            $this->notifCurrentRound();
        }
            
        $this->gamestate->nextState($startNewRound ? 'newRound' : 'endScore');
    }

    function computeStats(int $playerId) {
        $scoreSheets = $this->getScoreSheets($playerId, $this->getPlacedRoutes($playerId), $this->getCommonObjectives(), true);
        $scoreSheet = $scoreSheets->validated;
        
        $this->setStat(count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 10)), 'commonObjectivesFirst', $playerId);
        $this->setStat(count(array_filter($scoreSheet->commonObjectives->subTotals, fn($subTotal) => $subTotal == 6)), 'commonObjectivesSecond', $playerId);
        $this->setStat($scoreSheet->personalObjective->total > 0 ? 1 : 0, 'personalObjectives', $playerId);
        $this->setStat($scoreSheet->oldLadies->total, 'finalScoreOldLadies', $playerId);
        $this->setStat($scoreSheet->students->total, 'finalScoreStudents', $playerId);
        $this->setStat($scoreSheet->tourists->total, 'finalScoreTourists', $playerId);
        $this->setStat($scoreSheet->lovers->total, 'finalScoreLovers', $playerId);
        if ($scoreSheet->oldLadies->checked > 0) {
            $this->setStat((float)$scoreSheet->oldLadies->total / (float)$scoreSheet->oldLadies->checked, 'averagePointsByCheckedOldLadies', $playerId);
        }
        $checkedStudents = $scoreSheet->students->checkedStudents;
        if ($checkedStudents > 0) {
            $this->setStat((float)$scoreSheet->students->total / (float)$checkedStudents, 'averagePointsByCheckedStudents', $playerId);
        }
        $checkedTourists = 0;
        foreach ($scoreSheet->tourists->checkedTourists as $checkedTourist) {
            $checkedTourists += $checkedTourist;
        }
        if ($checkedTourists > 0) {
            $this->setStat((float)$scoreSheet->tourists->total / (float)$checkedTourists, 'averagePointsByCheckedTourists', $playerId);
        }
        $checkedLovers = 0;
        foreach ($scoreSheet->lovers->checkedLovers as $checkedLover) {
            $checkedLovers += $checkedLover;
        }
        if ($checkedLovers > 0) {
            $this->setStat((float)$scoreSheet->lovers->total / (float)$checkedLovers, 'averagePointsByCheckedLovers', $playerId);
        }
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();
        $map = $this->getMap();
        foreach ($playersIds as $playerId) {
            if (!$this->isEliminated($playerId)) {
                $scoreSheets = $this->notifUpdateScoreSheet($playerId, true);
                $score = $scoreSheets->validated->total;
                $this->DbQuery("UPDATE player SET `player_score` = $score WHERE `player_id` = $playerId");
            }

            $personalObjective = intval($this->getUniqueValueFromDB("SELECT player_personal_objective FROM `player` where `player_id` = $playerId"));

            $personalObjectiveLetters = array_map(fn($code) => chr($code), $this->getPersonalObjectiveLetters($playerId));
            self::notifyAllPlayers('revealPersonalObjective', clienttranslate('${player_name} personal objective was ${objectiveLetters}'), [
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
