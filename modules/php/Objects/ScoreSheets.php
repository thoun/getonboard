<?php

namespace Bga\Games\GetOnBoard\Objects;

class ScoreSheets {
    public function __construct(
        public ScoreSheet $validated,
        public ScoreSheet $current,
    ) {
    }
}
