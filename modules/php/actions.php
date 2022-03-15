<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function placeDeparturePawn(int $ticketNumber) {
        self::checkAction('placeDeparturePawn'); 
        
        $playerId = self::getCurrentPlayerId();

        $tickets = $this->getCardsFromDb($this->tickets->getCardsInLocation('hand', $playerId));

        if (!$this->array_some($tickets, fn($ticket) => $ticket->type == $ticketNumber)) {
            throw new BgaUserException("Invalid departure");
        }

        $position = $this->MAP_DEPARTURE_POSITIONS[$this->getMap()][$ticketNumber]; 

        $this->DbQuery("UPDATE player SET `player_departure_position` = $position WHERE `player_id` = $playerId");

        $this->tickets->moveAllCardsInLocation('hand', 'discard', $playerId);

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }
        
  	
    public function placeRoute(int $from, int $to) {
        self::checkAction('placeRoute'); 
        
        $playerId = self::getActivePlayerId();

        // TODO check valid

        $this->DbQuery("INSERT INTO placed_routes(`player_id`, `from`, `to`) VALUES ($playerId, $from, $to)");
        /*
        self::notifyAllPlayers('machinePlayed', clienttranslate('${player_name} plays machine ${machineImage}'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'machine' => $machine,
            'machineImage' => $this->getUniqueId($machine),
            'handMachinesCount' => $this->getHandCount($playerId),
        ]);

        self::incStat(1, 'playedMachines');
        self::incStat(1, 'playedMachines', $playerId);

        $this->gamestate->nextState('choosePlayAction');*/
    }
  	
    public function cancelLast() {
        self::checkAction('cancelLast'); 
        
        $playerId = self::getActivePlayerId();

        // TODO

        $this->gamestate->nextState('placeRoute');
    }
  	
    public function resetTurn() {
        self::checkAction('resetTurn'); 
        
        $playerId = self::getActivePlayerId();

        // TODO

        $this->gamestate->nextState('placeRoute');
    }
  	
    public function confirmTurn() {
        self::checkAction('confirmTurn'); 
        
        $playerId = self::getActivePlayerId();

        $this->DbQuery("UPDATE placed_routes SET `validated` = 1 WHERE `player_id` = $playerId AND `validated` = 0");
        
        // TODO notif

        $this->gamestate->nextState('nextPlayer');
    }
}
