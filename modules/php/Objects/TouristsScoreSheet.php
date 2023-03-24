<?php

namespace Bga\Games\GetOnBoardParisRome\Objects;

class TouristsScoreSheet {
    public array/*int[]*/ $checkedTourists = [0, 0, 0];
    public int $checkedMonumentsLight = 0;
    public int $checkedMonumentsDark = 0; 

    public array/*int[]*/ $subTotals = [];
    public int $total = 0;
}
