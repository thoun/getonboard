<?php

namespace Bga\Games\GetOnBoard\Objects;

class PossibleRoute {
    public function __construct(
        public int $from,
        public int $to,
        public int $trafficJam,
        public bool $useTurnZone,
        public bool $isElimination,
    ) {
    }
}
