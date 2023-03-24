<?php

namespace Bga\Games\GetOnBoardParisRome\Objects;

class ScoreSheets {
    public function __construct(
        public ScoreSheet $validated,
        public ScoreSheet $current,
    ) {
    }
}
