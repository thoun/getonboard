<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        $this->insertRoutes(2343492, [16, 15, 14, 24, 34, 44, 43, 53, 63, 64, 74, 73]);
        $this->insertRoutes(2343493, [16, 15, 14, 24, 34, 44, 43, 53, 63, 64, 74, 73]);
    }

    function insertRoutes(int $playerId, array $positions, int $validated = 1) {
        for($i=0; $i < count($positions) - 1; $i++) {
            $from = $positions[$i];
            $to = $positions[$i+1];
            $useTurnZone = 0;
            $this->DbQuery("INSERT INTO placed_routes(`player_id`, `from`, `to`, `round`, `use_turn_zone`, `traffic_jam`, `validated`) VALUES ($playerId, $from, $to, 0, $useTurnZone, 1, $validated)");
        }
    }

    function debugStart() {
        $playersIds = $this->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $tickets = $this->getCardsFromDb($this->tickets->getCardsInLocation('hand', $playerId));
            $ticketNumber = $tickets[0]->type;
            $position = $this->MAP_DEPARTURE_POSITIONS[$this->getMap()][$ticketNumber]; 
            $this->DbQuery("UPDATE player SET `player_departure_position` = $position WHERE `player_id` = $playerId");
            $this->tickets->moveAllCardsInLocation('hand', 'discard', $playerId);
        }

        $this->gamestate->jumpToState(ST_START_GAME);
    }

    function debugLastRound() {
        $this->DbQuery("update `tickets` set card_location='discard' where card_location='deck'");
    }

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
