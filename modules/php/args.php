<?php

trait ArgsTrait {
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
   
    function argPlaceDeparturePawn() {
        $privateArgs = [];
        $playersIds = $this->getPlayersIds();

        foreach($playersIds as $playerId) {
            $tickets = $this->getCardsFromDb($this->tickets->getCardsInLocation('hand', $playerId));
            $privateArgs[$playerId] = [
                'tickets' => array_map(fn($ticket) => $ticket->type, $tickets),
            ];
        }
    
        return [
            '_private' => $privateArgs,
        ];
    }
   
    function argPlaceRoute() {
        $playerId = self::getActivePlayerId();
    
        return [
        ];
    }
    
}