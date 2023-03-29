<?php

namespace Bga\Games\GetOnBoardParisRome\Objects;

class LoversScoreSheet {
    public array/*int[]*/ $checkedLoversLight = [0, 0, 0];
    public array/*int[]*/ $checkedLoversDark = [0, 0, 0];

    public array/*int[]*/ $subTotals = [];
    public int $total = 0;
}
