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

        $mapPositions = $this->MAP_POSITIONS[$this->getMap()];

        foreach($playersIds as $playerId) {
            $ticketsCards = $this->getCardsFromDb($this->tickets->getCardsInLocation('hand', $playerId));
            $ticketsNumbers = array_map(fn($ticket) => $ticket->type, $ticketsCards);
            $positions = array_map(fn($ticketNumber) => $this->array_find_key($mapPositions, fn($mapPosition) => $this->array_some($mapPosition, fn($element) => $element == $ticketNumber)), $ticketsNumbers);
            $privateArgs[$playerId] = [
                'tickets' => $ticketsNumbers,
                'positions' => $positions,
            ];
        }
    
        return [
            '_private' => $privateArgs,
        ];
    }
   
    function argPlaceRoute() {
        $playerId = self::getActivePlayerId();

        $placedRoutes = $this->getPlacedRoutes($playerId);
        $currentPosition = $this->getCurrentPosition($playerId, $placedRoutes);
        $canConfirm = true; // TODO
        $canCancel = count($placedRoutes) > 0 && !end($placedRoutes)->validated;
    
        return [
            'currentPosition' => $currentPosition,
            'possibleDestinations' => $this->getPossibleDestinations($this->getMap(), $currentPosition, $placedRoutes),
            'canConfirm' => $canConfirm,
            'canCancel' => $canCancel,
        ];
    }
    
}
