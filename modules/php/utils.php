<?php

require_once(__DIR__.'/objects/ticket.php');

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
}
