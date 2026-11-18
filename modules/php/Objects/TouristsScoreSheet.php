<?php

namespace Bga\Games\GetOnBoard\Objects;

class TouristsScoreSheet {
    public array/*int[]*/ $checkedTourists = [0, 0, 0];
    public int $checkedMonumentsLight = 0;
    public int $checkedMonumentsDark = 0; 
    public ?int $specialMonumentLight = null;
    public ?int $specialMonumentDark = null;
    public ?int $specialMonumentMax = null;

    public array/*int[]*/ $subTotals = [];
    public int $total = 0;
}
