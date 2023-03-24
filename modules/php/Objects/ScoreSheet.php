<?php

namespace Bga\Games\GetOnBoardParisRome\Objects;

class ScoreSheet {
    public int $connectionColor = 0;

    public SimpleZoneScoreSheet $oldLadies;
    public StudentsScoreSheet $students;
    public TouristsScoreSheet $tourists;
    public LoversScoreSheet $lovers;
    public ObjectivesScoreSheet $commonObjectives;
    public ObjectivesScoreSheet $personalObjective;
    public SimpleZoneScoreSheet $turnZones;
    public SimpleZoneScoreSheet $trafficJam;

    public int $total = 0;

    public function __construct() {
        $this->oldLadies = new SimpleZoneScoreSheet();
        $this->students = new StudentsScoreSheet();
        $this->tourists = new TouristsScoreSheet();
        $this->lovers = new LoversScoreSheet();
        $this->commonObjectives = new ObjectivesScoreSheet();
        $this->personalObjective = new ObjectivesScoreSheet();
        $this->turnZones = new SimpleZoneScoreSheet();
        $this->trafficJam = new SimpleZoneScoreSheet();
    } 
}
