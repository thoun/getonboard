<?php

class PossibleRoute {
    public int $from;
    public int $to;
    public int $connections;
    public bool $useTurnZone;
    public bool $isElimination;
    public bool $useStation;

    public function __construct(int $from, int $to, int $connections, bool $useTurnZone, bool $isElimination, bool $useStation) {
        $this->from = $from;
        $this->to = $to;
        $this->connections = $connections;
        $this->useTurnZone = $useTurnZone;
        $this->isElimination = $isElimination;
        $this->useStation = $useStation;
    } 
}
?>