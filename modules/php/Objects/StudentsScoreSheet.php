<?php

namespace Bga\Games\GetOnBoard\Objects;

class StudentsScoreSheet {
    public int $checkedStudents = 0;
    public int $checkedInternships = 0;
    public int $checkedSchools = 0;
    public ?int $specialSchool = null;

    public int $subTotal = 0;
    public int $total = 0;
}
