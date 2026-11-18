<?php

namespace Bga\Games\GetOnBoard\Objects;

class BusinessmenScoreSheet {
    public array/*int[]*/ $checkedBusinessmen = [0, 0, 0];
    public ?int $specialOffice = null;

    public array/*int[]*/ $subTotals = [];
    public int $total = 0;
}
