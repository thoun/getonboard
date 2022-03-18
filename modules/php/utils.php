<?php

require_once(__DIR__.'/objects/ticket.php');
require_once(__DIR__.'/objects/placed-route.php');
require_once(__DIR__.'/objects/possible-route.php');

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
        return /* TODO count($this->getPlayersIds()) > 3 ?*/ 'big' /*: 'small'*/;
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

    function isSameRoute(object $route, int $from, int $to) {
        return ($route->from === $from && $route->to === $to) || ($route->to === $from && $route->from === $to);
    }

    function createPossibleRoute(int $position, int $destination, array $allPlacedRoutes, array $playerPlacedRoutes, array $unvalidatedRoutes, array $turnShape, array $busyRoutes) {
        $trafficJam = count(array_filter(
            $allPlacedRoutes, 
            fn($route) => $this->isSameRoute($route, $position, $destination)
        ));

        if (in_array($destination, $busyRoutes[$position]) || in_array($position, $busyRoutes[$destination])) {
            $trafficJam++;
        }

        $useTurnZone = false;
        $angle = $turnShape[count($unvalidatedRoutes)]; // 0 means any shape, 1 straight, 2 turn.
        if ($angle > 0) {
            $lastRoute = end($playerPlacedRoutes);
            $lastDirection = abs($lastRoute->from - $lastRoute->to) <= 1;
            $nextDirection = abs($position - $destination) <= 1;

            if ($angle === 1) {
                $useTurnZone = $lastDirection !== $nextDirection;
            } else if ($angle === 2) {
                $useTurnZone = $lastDirection === $nextDirection;
            }
        }

        $isElimination = $this->array_some($playerPlacedRoutes, fn($route) => $route->from === $destination || $route->to === $destination);

        return new PossibleRoute($position, $destination, $trafficJam, $useTurnZone, $isElimination);
    }

    function getPlayerTurnShape(int $playerId) {
        $sheetTypeIndex = intval(self::getUniqueValueFromDB("SELECT player_sheet_type FROM player WHERE player_id = $playerId")) - 1;
        $currentTicket = $this->getCurrentTicketForRound();
        $currentTicketIndex = ($currentTicket - 1) % 6;
        $playerShapes = array_merge(
            array_slice($this->SCORE_SHEETS_SHAPES, 6 - $sheetTypeIndex),
            array_slice($this->SCORE_SHEETS_SHAPES, 0, 6 - $sheetTypeIndex),
        );

        return $playerShapes[$currentTicketIndex];
    }

    function getPossibleRoutes(int $playerId, string $mapSize, array $turnShape, int $position, array $allPlacedRoutes) {
        $busyRoutes = $this->BUSY_ROUTES[$mapSize];

        $playerPlacedRoutes = array_filter($allPlacedRoutes, fn($placedRoute) => $placedRoute->playerId === $playerId);
        $unvalidatedRoutes = array_filter($playerPlacedRoutes, fn($placedRoute) => !$placedRoute->validated);

        $possibleDestinations = array_values(array_filter(
            $this->getDestinations($mapSize, $position), 
            fn($destination) => !$this->array_some($playerPlacedRoutes, fn($placedRoute) => $this->isSameRoute($placedRoute, $position, $destination))
        ));

        if (count($unvalidatedRoutes) >= count($turnShape)) {
            $isGreenLight = in_array(GREEN_LIGHT, $this->MAP_POSITIONS[$mapSize][$position]);

            if ($isGreenLight) {
                $turnShape = [...$turnShape, 0, 0, 0, 0, 0];
            } else {
                return [];
            }
        }

        return array_map(fn($destination) => $this->createPossibleRoute($position, $destination, $allPlacedRoutes, $playerPlacedRoutes, $unvalidatedRoutes, $turnShape, $busyRoutes), $possibleDestinations);
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
    
    function notifCurrentRound() {
        $validatedTickets = $this->getValidatedTicketsForRound();
        $currentTicket = $this->getCurrentTicketForRound();
        
        $message = $currentTicket == null ? '' : clienttranslate('Round ${round}/12 starts!');

        $this->notifyAllPlayers('newRound', $message, [
            'round' => count($validatedTickets) + 1,
            'validatedTickets' => $validatedTickets,
            'currentTicket' => $currentTicket,
        ]);
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
