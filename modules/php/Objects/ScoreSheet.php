<?php

namespace Bga\Games\GetOnBoardParisRome\Objects;

class ScoreSheet {
    public SimpleZoneScoreSheet $oldLadies;
    public StudentsScoreSheet $students;
    public TouristsScoreSheet $tourists;
    public BusinessmenScoreSheet $businessmen;
    public ObjectivesScoreSheet $commonObjectives;
    public ObjectivesScoreSheet $personalObjective;
    public SimpleZoneScoreSheet $turnZones;
    public SimpleZoneScoreSheet $trafficJam;

    public int $total = 0;

    public function __construct() {
        $this->oldLadies = new SimpleZoneScoreSheet();
        $this->students = new StudentsScoreSheet();
        $this->tourists = new TouristsScoreSheet();
        $this->businessmen = new BusinessmenScoreSheet();
        $this->commonObjectives = new ObjectivesScoreSheet();
        $this->personalObjective = new ObjectivesScoreSheet();
        $this->turnZones = new SimpleZoneScoreSheet();
        $this->trafficJam = new SimpleZoneScoreSheet();
    } 
}
