<?php

class CommonObjective {
    public int $id;
    public bool $completed;
    public int $completedAtRound;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->completed = $dbCard['completed_at_round'] != null;
        $this->completedAtRound = intval($dbCard['completed_at_round']);
    } 
}
?>