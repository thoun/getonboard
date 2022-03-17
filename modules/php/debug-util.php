<?php

trait DebugUtilTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    function debugSetup() {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        } 

        $this->insertSomeRoutes(2343492);
    }

    function insertSomeRoutes(int $playerId) {
        $routesIds = [            
            11, // [SCHOOL, SCHOOL_SPECIAL],
            12, // [GREEN_LIGHT, ord('a')],
            13, // [STUDENT],
            14, // [MONUMENT_LIGHT],
            15, // [TOURIST],
            16, // [BUILDING, ord('b')],

            21, // [BUSINESSMAN],
            22, // [TOURIST],
            23, // [GREEN_LIGHT, 1],
            24, // [BUSINESSMAN],
            25, // [GREEN_LIGHT, ord('c')],
            26, // [STUDENT],
            
            31, // [STUDENT],
            32, // [BUILDING, ord('d')],
            33, // [OLD_LADY],
            34, // [MONUMENT_DARK, MONUMENT_DARK_SPECIAL],
            35, // [OLD_LADY],
            36, // [GREEN_LIGHT, 2],
    
        ];

        foreach($routesIds as $routeId) {
            $useTurnZone = in_array($routeId, [24, 32, 33]) ? 1 : 0;
            $this->DbQuery("INSERT INTO placed_routes(`player_id`, `from`, `to`, `round`, `use_turn_zone`, `traffic_jam`) VALUES ($playerId, $routeId, $routeId, 0, $useTurnZone, 1)");
        }
    }

    function debug($debugData) {
        if ($this->getBgaEnvironment() != 'studio') { 
            return;
        }die('debug data : '.json_encode($debugData));
    }
}
