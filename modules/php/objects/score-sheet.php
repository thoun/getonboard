<?php

class SimpleZoneScoreSheet {
    public int $checked = 0;

    public int $total = 0;
}

class StationsScoreSheet {
    public int $encircled = 0;
    public int $checked = 0;

    public int $total = 0;
}

class StudentsScoreSheet {
    public int $checkedStudents = 0;
    public int $checkedCinemas = 0;

    public int $total = 0;
}

class TouristsScoreSheet {
    public array/*int[]*/ $checkedTourists = [0, 0, 0];
    public int $checkedMonumentsLight = 0;
    public int $checkedMonumentsDark = 0; 

    public array/*int[]*/ $subTotals = [];
    public int $total = 0;
}

class LoversScoreSheet {
    public array/*int[]*/ $checkedLovers = [0, 0, 0];

    public array/*int[]*/ $subTotals = [];
    public int $total = 0;
}

class ObjectivesScoreSheet {
    public array/*int[]*/ $subTotals = [null, null];
    public /*int|null*/ $total = null;
}

class ScoreSheet {
    public int $connectionColor = 0;

    public StationsScoreSheet $stations;
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
        $this->stations = new StationsScoreSheet();
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

class ScoreSheets {
    public ScoreSheet $validated;
    public ScoreSheet $current;

    public function __construct(ScoreSheet $validated, ScoreSheet $current) {
        $this->validated = $validated;
        $this->current = $current;
        
    } 
}
?>