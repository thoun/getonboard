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

        $this->tickets->pickCardForLocation('deck', 'turn');

        $this->notifCurrentRound();

        $this->gamestate->nextState('start');
    }

    function checkPlayerToEliminate() {
        $eliminatedPlayer = intval($this->getGameStateValue(ELIMINATE_PLAYER));
        if ($eliminatedPlayer === 0 || $eliminatedPlayer === intval($this->getActivePlayerId())) {
            return;
        }

        $this->DbQuery("UPDATE player SET `player_score` = 0 WHERE `player_id` = $eliminatedPlayer");
        $this->eliminatePlayer($eliminatedPlayer);
        $this->setGameStateValue(ELIMINATE_PLAYER, 0);
    }

    function stNextPlayer() {
        $playerId = $this->getActivePlayerId();

        $this->checkPlayerToEliminate();

        $this->giveExtraTime($playerId);

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
                'player_name' => self::getActivePlayerName(),
                'objectiveLetters' => implode(' ', $personalObjectiveLetters),
                'personalObjective' => $personalObjective,
                'personalObjectiveLetters' => $personalObjectiveLetters,
                'personalObjectivePositions' => $this->getPersonalObjectivePositions($personalObjective, $map),
            ]);
        }

        $this->gamestate->nextState('endGame');
    }
}
