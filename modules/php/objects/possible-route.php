<?php

class PossibleRoute {
    public int $from;
    public int $to;
    public int $connections;
    public bool $useTurnZone;
    public bool $isElimination;

    public function __construct(int $from, int $to, int $connections, bool $useTurnZone, bool $isElimination) {
        $this->from = $from;
        $this->to = $to;
        $this->connections = $connections;
        $this->useTurnZone = $useTurnZone;
        $this->isElimination = $isElimination;
    } 
}
?>