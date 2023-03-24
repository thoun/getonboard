<?php

namespace Bga\Games\GetOnBoardParisRome\Objects;

class BusinessmenScoreSheet {
    public array/*int[]*/ $checkedBusinessmen = [0, 0, 0];

    public array/*int[]*/ $subTotals = [];
    public int $total = 0;
}
