<?php

require_once(__DIR__.'/objects/ticket.php');
require_once(__DIR__.'/objects/placed-route.php');

trait UtilTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    function array_find(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return $value;
            }
        }
        return null;
    }

    function array_find_key(array $array, callable $fn) {
        foreach ($array as $key => $value) {
            if($fn($value)) {
                return $key;
            }
        }
        return null;
    }

    function array_some(array $array, callable $fn) {
        foreach ($array as $value) {
            if($fn($value)) {
                return true;
            }
        }
        return false;
    }
    
    function array_every(array $array, callable $fn) {
        foreach ($array as $value) {
            if(!$fn($value)) {
                return false;
            }
        }
        return true;
    }

    function array_identical(array $a1, array $a2) {
        if (count($a1) != count($a2)) {
            return false;
        }
        for ($i=0;$i<count($a1);$i++) {
            if ($a1[$i] != $a2[$i]) {
                return false;
            }
        }
        return true;
    }

    function setGlobalVariable(string $name, /*object|array*/ $obj) {
        /*if ($obj == null) {
            throw new \BgaSystemException('Global Variable null');
        }*/
        $jsonObj = json_encode($obj);
        self::DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getGlobalVariable(string $name, $asArray = null) {
        $json_obj = self::getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
        }
    }

    function deleteGlobalVariable(string $name) {
        self::DbQuery("DELETE FROM `global_variables` where `name` = '$name'");
    }

    function getFirstPlayerId() {
        return intval(self::getGameStateValue(FIRST_PLAYER));
    }

    function getPlayersIds() {
        return array_keys($this->loadPlayersBasicInfos());
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getCardFromDb(array $dbCard) {
        if (!$dbCard || !array_key_exists('id', $dbCard)) {
            throw new \Error('card doesn\'t exists '.json_encode($dbCard));
        }
        if (!$dbCard || !array_key_exists('location', $dbCard)) {
            throw new \Error('location doesn\'t exists '.json_encode($dbCard));
        }
        return new Card($dbCard);
    }

    function getCardsFromDb(array $dbCards) {
        return array_map(fn($dbCard) => $this->getCardFromDb($dbCard), array_values($dbCards));
    }

    function getMap() {
        return count($this->getPlayersIds()) > 3 ? 'big' : 'small';
    }

    function setupTickets(int $playerNumber) {
        // 12 bus ticket cards
        $tickets = [];
        for ($i = 1; $i <= 6; $i++) {
            $tickets[] = [ 'type' => $i, 'type_arg' => null, 'nbr' => 1 ];
        }
        $this->tickets->createCards($tickets, 'deck');
        $tickets = [];
        for ($i = 7; $i <= 12; $i++) {
            $tickets[] = [ 'type' => $i, 'type_arg' => null, 'nbr' => 1 ];
        }
        $this->tickets->createCards($tickets, $playerNumber > 3 ? 'deck' : 'discard');
        $this->tickets->shuffle('deck');
    }

    function dealTickets(array $playersIds) {
        foreach ($playersIds as $playerId) {
            $this->tickets->pickCards(2, 'deck', $playerId);
        }
    }

    function setupCommonObjectives() {
        $commonObjectives = [1, 2, 3, 4, 5, 6];

        for ($i = 1; $i <= 2; $i++) {
            $commonObjectiveIndex = bga_rand(0, count($commonObjectives) - 1);
            $commonObjective = array_splice($commonObjectives, $commonObjectiveIndex, 1)[0];
            $commonObjectives = array_values($commonObjectives);

            $this->DbQuery("INSERT INTO common_objectives(`id`) VALUES ($commonObjective)");
        }
    }

    function getPlacedRoutes(/*int | null*/ $playerId = null) {
        $sql = "SELECT * FROM `placed_routes` ";
        if ($playerId != null) {
            $sql .= "WHERE `player_id` = $playerId ";
        }
        $sql .= "ORDER by `id` ASC";
        $dbResult = self::getCollectionFromDb($sql);

        return array_map(fn($dbCard) => new PlacedRoute($dbCard), array_values($dbResult));
    }

    function getCurrentPosition(int $playerId, array $placedRoutes) {
        if (count($placedRoutes) > 0) {
            return end($placedRoutes)->to;
        } else {
            return intval($this->getUniqueValueFromDB("SELECT player_departure_position FROM `player` where `player_id` = $playerId"));
        }
    }
    
    function getDestinations(string $mapSize, int $position) {
        $routes = [];

        foreach($this->MAP_ROUTES[$mapSize] as $from => $tos) {
            if ($from === $position) {
                $routes = array_merge($routes, $tos);
            } else {
                $routeToSpot = $this->array_find($tos, fn($to) => $to == $position);
                if ($routeToSpot !== null) {
                    $routes[] = $from;
                }
            }
        } 

        return $routes;
    }

    function getPossibleDestinations(string $mapSize, int $position, array $placedRoutes) {
        return array_values(array_filter(
            $this->getDestinations($mapSize, $position), 
            fn($destination) => !$this->array_some($placedRoutes, fn($placedRoute) => ($placedRoute->from === $position && $placedRoute->to === $destination) || ($placedRoute->to === $position && $placedRoute->from === $destination))
        ));
    }

    function getRoundNumber() {
        return intval($this->tickets->countCardInLocation('discard')) + 1;
    }

    function getValidatedTicketsForRound() {
        $tickets = $this->getCardsFromDb($this->tickets->getCardsInLocation('discard'));
        return array_map(fn($ticket) => $ticket->type, $tickets);
    }

    function getCurrentTicketForRound() {
        $tickets = $this->getCardsFromDb($this->tickets->getCardsInLocation('turn'));
        return count($tickets) > 0 ? $tickets[0]->type : null;
    }

    function getPersonalObjectiveType(int $playerId) {
        return intval($this->getUniqueValueFromDB("SELECT player_personal_objective FROM `player` where `player_id` = $playerId"));
    }

    function getPersonalObjectiveLetters(int $playerId) {
        return $this->PERSONAL_OBJECTIVES[$this->getMap()][$this->getPersonalObjectiveType($playerId)];
    }

    function getCommonObjectives() {
        return []; // TODO
    }

    function notifUpdateScoreSheet(int $playerId) {
        $scoreSheets = $this->getScoreSheets($playerId, $this->getPlacedRoutes($playerId), $this->getCommonObjectives());
        
        $this->notifyAllPlayers('updateScoreSheet', '', [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
            'scoreSheets' => $scoreSheets,
        ]);

        return $scoreSheets;
    }
}
