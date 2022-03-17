<?php

class PlacedRoute {
    public int $id;
    public int $playerId;
    public int $from;
    public int $to;
    public int $round;
    public bool $useTurnZone;
    public bool $validated;
    public int $trafficJam;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->playerId = intval($dbCard['player_id']);
        $this->from = $dbCard['from'];
        $this->to = intval($dbCard['to']);
        $this->round = intval($dbCard['round']);
        $this->useTurnZone = boolval($dbCard['use_turn_zone']);
        $this->validated = boolval($dbCard['validated']);
        $this->trafficJam = intval($dbCard['traffic_jam']);
    } 
}
?>