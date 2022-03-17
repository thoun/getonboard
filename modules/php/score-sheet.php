<?php

require_once(__DIR__.'/objects/score-sheet.php');

trait ScoreSheetTrait {

    private function getTotalForSimpleZone(int $checked, array $deltas) {
        $total = 0;
        for ($i = 0; $i < $checked; $i++) {
            $total += $deltas[$i];
        }
        return $total;
    }

    function addOldLadyToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet) {
        $scoreSheet->oldLadies->checked++;
        $scoreSheet->oldLadies->total = $this->getTotalForSimpleZone($scoreSheet->oldLadies->checked, $this->OLD_LADIES_POINTS);
        // TODO check common objective
    }

    function updateStudentTotal(ScoreSheet &$scoreSheet) {
        $checked = $scoreSheet->students->checkedInternships + $scoreSheet->students->checkedStudents;
        $scoreSheet->students->subTotal = $checked * $scoreSheet->students->checkedSchools;
        $scoreSheet->students->total = ($scoreSheet->students->specialSchool || 0) + $scoreSheet->students->subTotal;
        // TODO check common objective
    }
    
    function addTouristToScoreSheet(ScoreSheet &$scoreSheet) {
        $rowIndex = count($scoreSheet->tourists->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->tourists->checkedTourists[$rowIndex] < 4) {
            $scoreSheet->tourists->checkedTourists[$rowIndex]++;
            $this->updateTouristTotal($scoreSheet);
        }
    }

    function addMonumentToScoreSheet(ScoreSheet &$scoreSheet, string $type) {
        $rowIndex = count($scoreSheet->tourists->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->tourists->checkedTourists[$rowIndex] > 0) {
            $scoreSheet->tourists->subTotals[$rowIndex] = $this->TOURISTS_POINTS[$scoreSheet->tourists->checkedTourists[$rowIndex] - 1];
            $this->updateTouristTotal($scoreSheet);
        }
        $scoreSheet->tourists->{'checkedMonuments'.$type}++;
    }

    function addSpecialMonumentToScoreSheet(ScoreSheet &$scoreSheet, string $type) {
        $totalCheckedTourists = 0;
        foreach ($scoreSheet->tourists->checkedTourists as $checkedTourists) {
            $totalCheckedTourists += $checkedTourists;
        }
        $scoreSheet->tourists->{'specialMonument'.$type} = $totalCheckedTourists;

        if ($scoreSheet->tourists->specialMonumentLight !== null || $scoreSheet->tourists->specialMonumentMax !== null) {
            $scoreSheet->tourists->specialMonumentMax = max($scoreSheet->tourists->specialMonumentLight || 0, $scoreSheet->tourists->specialMonumentDark || 0);
        }

        $this->updateTouristTotal($scoreSheet);
    }
    
    function updateTouristTotal(ScoreSheet &$scoreSheet) {
        $scoreSheet->tourists->total = $scoreSheet->tourists->specialMonumentMax || 0;
        foreach($scoreSheet->tourists->subTotals as $subTotal) {
            $scoreSheet->tourists->total += $subTotal;
        }   
        // TODO check common objective dark & light     
    }
    
    function addBusinessmanToScoreSheet(ScoreSheet &$scoreSheet) {
        $rowIndex = count($scoreSheet->businessmen->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->businessmen->checkedBusinessmen[$rowIndex] < 3) {
            $scoreSheet->businessmen->checkedBusinessmen[$rowIndex]++;
            $this->updateBusinessmenTotal($scoreSheet);
        }
    }

    function addBuildingToScoreSheet(ScoreSheet &$scoreSheet) {
        $rowIndex = count($scoreSheet->businessmen->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->businessmen->checkedBusinessmen[$rowIndex] > 0) {
            $checked = $scoreSheet->businessmen->checkedBusinessmen[$rowIndex];
            $scoreSheet->businessmen->subTotals[$rowIndex] = $this->BUSINESSMEN_POINTS[$checked - 1];
            $this->updateBusinessmenTotal($scoreSheet);

            if ($checked == 1) {
                $this->addOldLadyToScoreSheetAndUpdateTotal($scoreSheet);
            } else if ($checked == 2) {
                $this->addTouristToScoreSheet($scoreSheet, false);
            } else if ($checked == 3) {
                $scoreSheet->students->checkedStudents++;
                $this->updateStudentTotal($scoreSheet);
            }
        }
    }

    function addSpecialBuildingToScoreSheet(ScoreSheet &$scoreSheet) {
        $totalCheckedBusinessmen = 0;
        foreach ($$scoreSheet->businessmen->checkedBusinessmen as $checkedBusinessmen) {
            $totalCheckedBusinessmen += $checkedBusinessmen;
        }
        $scoreSheet->businessmen->specialBuilding = $totalCheckedBusinessmen;

        $this->updateTouristTotal($scoreSheet);
    }
    
    function updateBusinessmenTotal(ScoreSheet &$scoreSheet) {
        $scoreSheet->businessmen->total = ($scoreSheet->businessmen->specialBuilding || 0);
        foreach($scoreSheet->businessmen->subTotals as $subTotal) {
            $scoreSheet->businessmen->total += $subTotal;
        }   
        // TODO check common objective
    }

    function addTurnZoneToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet) {
        $scoreSheet->turnZones->checked = min($scoreSheet->turnZones->checked + 1, 5);
        $scoreSheet->turnZones->total = $this->getTotalForSimpleZone($scoreSheet->turnZones->checked, $this->TURN_ZONES_POINTS);
    }

    function addTrafficJamToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet, int $trafficJam) {
        $scoreSheet->trafficJam->checked = min($scoreSheet->trafficJam->checked + $trafficJam, 19);
        $scoreSheet->trafficJam->total = $this->getTotalForSimpleZone($scoreSheet->trafficJam->checked, $this->TRAFFIC_JAM_POINTS);
    }

    function getScoreSheet(array $placedRoutes, array $mapPositions, array $personalObjectives, array $commonObjectives, bool $endScoring = false) {
        $scoreSheet = new ScoreSheet();

        $visitedLetters = [];

        foreach ($placedRoutes as $placedRoute) {
            $mapPosition = $mapPositions[$placedRoute->to];

            foreach ($mapPosition as $element) {
                if ($element > 90 && $scoreSheet->personalObjective->total != 10) {
                    $visitedLetters[] = $element;

                    if ($this->array_every($personalObjectives, fn($letter) => in_array($letter, $visitedLetters))) {
                        $scoreSheet->personalObjective->total = 10;
                    }
                } else {
                    switch ($element) {
                        // old ladies
                        case OLD_LADY:
                            $this->addOldLadyToScoreSheetAndUpdateTotal($scoreSheet);
                            break;

                        // students
                        case STUDENT:
                            $scoreSheet->students->checkedStudents++;
                            $this->updateStudentTotal($scoreSheet);
                            break;
                        case INTERNSHIP:
                            $scoreSheet->students->checkedInterships++;
                            $this->updateStudentTotal($scoreSheet);
                            break;
                        case SCHOOL:
                            $scoreSheet->students->checkedSchools++;
                            $this->updateStudentTotal($scoreSheet);
                        case SCHOOL_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $scoreSheet->students->specialSchool = $scoreSheet->students->checkedInternships + $scoreSheet->students->checkedStudents;
                            $this->updateStudentTotal($scoreSheet);
                            break;

                        // tourists
                        case TOURIST:
                            $this->addTouristToScoreSheet($scoreSheet, $endScoring);
                            break;
                        case MONUMENT_LIGHT:
                            $this->addMonumentToScoreSheet($scoreSheet, 'Light');
                            break;
                        case MONUMENT_DARK:
                            $this->addMonumentToScoreSheet($scoreSheet, 'Dark');
                            break;
                        case MONUMENT_LIGHT_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $this->addSpecialMonumentToScoreSheet($scoreSheet, 'Light');
                            break;
                        case MONUMENT_DARK_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $this->addSpecialMonumentToScoreSheet($scoreSheet, 'Dark');
                            break;

                        // businessmen
                        case BUSINESSMAN:
                            $this->addBusinessmanToScoreSheet($scoreSheet, $endScoring);
                            break;
                        case BUILDING:
                            $this->addBuildingToScoreSheet($scoreSheet);
                            break;
                        case BUILDING_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $this->addSpecialBuildingToScoreSheet($scoreSheet);
                            break;

                        // TODO common objectives
                    }
                }
            }

            if ($placedRoute->useTurnZone) {
                $this->addTurnZoneToScoreSheetAndUpdateTotal($scoreSheet);
            }
            if ($placedRoute->trafficJam > 0) {
                $this->addTrafficJamToScoreSheetAndUpdateTotal($scoreSheet, $placedRoute->trafficJam);
            }
        }

        $scoreSheet->total = $scoreSheet->oldLadies->total + $scoreSheet->students->total + $scoreSheet->tourists->total + $scoreSheet->businessmen->total /* + TODO*/;

        return $scoreSheet;
    }

    function getScoreSheets(int $playerId, array $placedRoutes, array $commonObjectives) {

        $mapPositions = $this->MAP_POSITIONS[$this->getMap()];

        $personalObjective = $this->getPersonalObjectiveLetters($playerId);

        $validatedPlacedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => $placedRoute->validated));

        $validatedScoreSheet = $this->getScoreSheet($validatedPlacedRoutes, $mapPositions, $personalObjective, $commonObjectives);
        $currentScoreSheet = count($validatedPlacedRoutes) === count($placedRoutes) ? 
            $validatedScoreSheet : 
            $this->getScoreSheet($placedRoutes, $mapPositions, $personalObjective, $commonObjectives);

        return new ScoreSheets(
            $validatedScoreSheet,
            $currentScoreSheet,
        );
    }
}

?>