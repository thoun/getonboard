<?php

class PlacedRoute {
    public int $playerId;
    public int $from;
    public int $to;
    public int $validated;

    public function __construct($dbCard) {
        $this->playerId = intval($dbCard['player_id']);
        $this->from = $dbCard['from'];
        $this->to = intval($dbCard['to']);
        $this->validated = boolval($dbCard['validated']);
    } 
}
?>