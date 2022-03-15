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
        $this->tickets->moveAllCardsInLocation(null, 'deck');
        $this->tickets->shuffle('deck');

        $this->tickets->pickCardForLocation('deck', 'turn');

        $this->gamestate->nextState('start');
    }

    function stNextPlayer() {
        $playerId = $this->getActivePlayerId();
        $this->giveExtraTime($playerId);

        $this->activeNextPlayer();

        $playerId = intval($this->getActivePlayerId());

        $endOfRound = $playerId == intval($this->getGameStateValue(FIRST_PLAYER));
        $this->gamestate->nextState($endOfRound ? 'endRound' : 'nextPlayer');
    }

    function stEndRound() {
        $this->tickets->moveAllCardsInLocation('turn', 'discard');

        $startNewRound = intval($this->tickets->countCardInLocation('discard')) < 12;

        if ($startNewRound) {

            $this->activeNextPlayer();
    
            $playerId = $this->getActivePlayerId();
            $this->setGameStateValue(FIRST_PLAYER, $playerId);
    
            // TODO notif

            $this->tickets->pickCardForLocation('deck', 'turn');
        }
            
        $this->gamestate->nextState($startNewRound ? 'newRound' : 'endScore');
    }
}
