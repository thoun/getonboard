<?php

require_once(__DIR__.'/objects/score-sheet.php');

trait ScoreSheetTrait {

    private function checkCompletedCommonObjective(ScoreSheet &$scoreSheet, array $commonObjectives, int $objectiveType, int $checked, int $round) {
        foreach($commonObjectives as $commonObjective) {
            $objectiveDescription = $this->COMMON_OBJECTIVES[$commonObjective->id];
            $objectiveSubtotalIndex = $commonObjective->number - 1;
            if ($scoreSheet->commonObjectives->subTotals[$objectiveSubtotalIndex] === null &&
                $objectiveType === $objectiveDescription[0] && 
                $checked >= $objectiveDescription[1]) {

                // set objective score
                $scoreSheet->commonObjectives->subTotals[$objectiveSubtotalIndex] = 
                    $commonObjective->completed && $commonObjective->completedAtRound < $round ? 6 : 10;

                // update totals
                $scoreSheet->commonObjectives->total = 0;
                foreach ($scoreSheet->commonObjectives->subTotals as $subTotal) {
                    $scoreSheet->commonObjectives->total += ($subTotal ?? 0);
                }
            }
        }
    }

    private function getTotalForSimpleZone(int $checked, array $deltas) {
        $total = 0;
        for ($i = 0; $i < $checked; $i++) {
            $total += $deltas[$i];
        }
        return $total;
    }

    function addOldLadyToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $scoreSheet->oldLadies->checked++;
        $scoreSheet->oldLadies->total = $this->getTotalForSimpleZone($scoreSheet->oldLadies->checked, $this->OLD_LADIES_POINTS);
        
        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, OLD_LADY, $scoreSheet->oldLadies->checked, $round);
    }

    function updateStudentTotal(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $checked = $scoreSheet->students->checkedInternships + $scoreSheet->students->checkedStudents;
        $scoreSheet->students->subTotal = $checked * $scoreSheet->students->checkedSchools;
        $scoreSheet->students->total = ($scoreSheet->students->specialSchool ?? 0) + $scoreSheet->students->subTotal;
        
        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, STUDENT, $checked, $round);
    }
    
    function addTouristToScoreSheet(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $rowIndex = count($scoreSheet->tourists->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->tourists->checkedTourists[$rowIndex] < 4) {
            $scoreSheet->tourists->checkedTourists[$rowIndex]++;
            $this->updateTouristTotal($scoreSheet, $commonObjectives, $round);
        }
    }

    function addMonumentToScoreSheet(ScoreSheet &$scoreSheet, string $type, array $commonObjectives, int $round) {
        $rowIndex = count($scoreSheet->tourists->subTotals);
        if ($rowIndex < 3) {
            if ($scoreSheet->tourists->checkedTourists[$rowIndex] > 0) {
                $scoreSheet->tourists->subTotals[$rowIndex] = $this->TOURISTS_POINTS[$scoreSheet->tourists->checkedTourists[$rowIndex] - 1];
            }
        }
        $scoreSheet->tourists->{'checkedMonuments'.$type}++;
        $this->updateTouristTotal($scoreSheet, $commonObjectives, $round);
    }

    function addSpecialMonumentToScoreSheet(ScoreSheet &$scoreSheet, string $type, array $commonObjectives, int $round) {
        $totalCheckedTourists = 0;
        foreach ($scoreSheet->tourists->checkedTourists as $checkedTourists) {
            $totalCheckedTourists += $checkedTourists;
        }
        $scoreSheet->tourists->{'specialMonument'.$type} = $totalCheckedTourists;

        if ($scoreSheet->tourists->specialMonumentLight !== null || $scoreSheet->tourists->specialMonumentDark !== null) {
            $scoreSheet->tourists->specialMonumentMax = max($scoreSheet->tourists->specialMonumentLight ?? 0, $scoreSheet->tourists->specialMonumentDark ?? 0);
        }

        $this->updateTouristTotal($scoreSheet, $commonObjectives, $round);
    }
    
    function updateTouristTotal(ScoreSheet &$scoreSheet, array $commonObjectives, int $round, bool $endScoring = false) {
        if ($endScoring) {
            $rowIndex = count($scoreSheet->tourists->subTotals);
            if ($rowIndex < 3) {
                $checked = $scoreSheet->tourists->checkedTourists[$rowIndex];
                if ($checked > 0) {
                    $scoreSheet->tourists->subTotals[$rowIndex] = floor($this->TOURISTS_POINTS[$checked - 1] / 2);
                }
            }
        }

        $scoreSheet->tourists->total = $scoreSheet->tourists->specialMonumentMax ?? 0;
        foreach($scoreSheet->tourists->subTotals as $subTotal) {
            $scoreSheet->tourists->total += $subTotal;
        }   
        
        $totalCheckedTourists = 0;
        foreach ($scoreSheet->tourists->checkedTourists as $checkedTourists) {
            $totalCheckedTourists += $checkedTourists;
        }

        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, MONUMENT_LIGHT, $scoreSheet->tourists->checkedMonumentsLight, $round);
        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, MONUMENT_DARK, $scoreSheet->tourists->checkedMonumentsDark, $round);
        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, TOURIST, $totalCheckedTourists, $round);
    }
    
    function addBusinessmanToScoreSheet(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $rowIndex = count($scoreSheet->businessmen->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->businessmen->checkedBusinessmen[$rowIndex] < 3) {
            $scoreSheet->businessmen->checkedBusinessmen[$rowIndex]++;
            $this->updateBusinessmenTotal($scoreSheet, $commonObjectives, $round);
        }
    }

    function addOfficeToScoreSheet(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $rowIndex = count($scoreSheet->businessmen->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->businessmen->checkedBusinessmen[$rowIndex] > 0) {
            $checked = $scoreSheet->businessmen->checkedBusinessmen[$rowIndex];
            $scoreSheet->businessmen->subTotals[$rowIndex] = $this->BUSINESSMEN_POINTS[$checked - 1];

            if ($checked == 1) {
                $this->addOldLadyToScoreSheetAndUpdateTotal($scoreSheet, $commonObjectives, $round);
            } else if ($checked == 2) {
                $this->addTouristToScoreSheet($scoreSheet, $commonObjectives, $round);
            } else if ($checked == 3) {
                $scoreSheet->students->checkedInternships++;
                $this->updateStudentTotal($scoreSheet, $commonObjectives, $round);
            }
        }
        $this->updateBusinessmenTotal($scoreSheet, $commonObjectives, $round);
    }

    function addSpecialOfficeToScoreSheet(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $totalCheckedBusinessmen = 0;
        foreach ($scoreSheet->businessmen->checkedBusinessmen as $checkedBusinessmen) {
            $totalCheckedBusinessmen += $checkedBusinessmen;
        }
        $scoreSheet->businessmen->specialOffice = $totalCheckedBusinessmen;

        $this->updateBusinessmenTotal($scoreSheet, $commonObjectives, $round);
    }
    
    function updateBusinessmenTotal(ScoreSheet &$scoreSheet, array $commonObjectives, int $round, bool $endScoring = false) {
        if ($endScoring) {
            $rowIndex = count($scoreSheet->businessmen->subTotals);
            if ($rowIndex < 3) {
                $checked = $scoreSheet->businessmen->checkedBusinessmen[$rowIndex];
                if ($checked > 0) {
                    $scoreSheet->businessmen->subTotals[$rowIndex] = floor($this->BUSINESSMEN_POINTS[$checked - 1] / 2);
                }
            }
        }

        $scoreSheet->businessmen->total = ($scoreSheet->businessmen->specialOffice ?? 0);
        foreach($scoreSheet->businessmen->subTotals as $subTotal) {
            $scoreSheet->businessmen->total += $subTotal;
        }   
        
        $totalCheckedBusinessmen = 0;
        foreach ($scoreSheet->businessmen->checkedBusinessmen as $checkedBusinessmen) {
            $totalCheckedBusinessmen += $checkedBusinessmen;
        }
        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, BUSINESSMAN, $totalCheckedBusinessmen, $round);
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
            $round = $placedRoute->round;

            foreach ($mapPosition as $element) {
                if ($element > 90 && $scoreSheet->personalObjective->total != 10) {
                    $visitedLetters[] = $element;

                    if ($endScoring && $this->array_every($personalObjectives, fn($letter) => in_array($letter, $visitedLetters))) {
                        $scoreSheet->personalObjective->total = 10;
                    }
                } else {
                    switch ($element) {
                        // old ladies
                        case OLD_LADY:
                            $this->addOldLadyToScoreSheetAndUpdateTotal($scoreSheet, $commonObjectives, $round);
                            break;

                        // students
                        case STUDENT:
                            if ($scoreSheet->students->checkedStudents < 6) {
                                $scoreSheet->students->checkedStudents++;
                                $this->updateStudentTotal($scoreSheet, $commonObjectives, $round);
                            }
                            break;
                        case INTERNSHIP:
                            $scoreSheet->students->checkedInterships++;
                            $this->updateStudentTotal($scoreSheet, $commonObjectives, $round);
                            break;
                        case SCHOOL:
                            if ($scoreSheet->students->checkedSchools < 4) {
                                $scoreSheet->students->checkedSchools++;
                                $this->updateStudentTotal($scoreSheet, $commonObjectives, $round);
                            }
                            break;
                        case SCHOOL_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $scoreSheet->students->specialSchool = $scoreSheet->students->checkedInternships + $scoreSheet->students->checkedStudents;
                            $this->updateStudentTotal($scoreSheet, $commonObjectives, $round);
                            break;

                        // tourists
                        case TOURIST:
                            $this->addTouristToScoreSheet($scoreSheet, $commonObjectives, $round);
                            break;
                        case MONUMENT_LIGHT:
                            $this->addMonumentToScoreSheet($scoreSheet, 'Light', $commonObjectives, $round);
                            break;
                        case MONUMENT_DARK:
                            $this->addMonumentToScoreSheet($scoreSheet, 'Dark', $commonObjectives, $round);
                            break;
                        case MONUMENT_LIGHT_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $this->addSpecialMonumentToScoreSheet($scoreSheet, 'Light', $commonObjectives, $round);
                            break;
                        case MONUMENT_DARK_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $this->addSpecialMonumentToScoreSheet($scoreSheet, 'Dark', $commonObjectives, $round);
                            break;

                        // businessmen
                        case BUSINESSMAN:
                            $this->addBusinessmanToScoreSheet($scoreSheet, $commonObjectives, $round);
                            break;
                        case OFFICE:
                            $this->addOfficeToScoreSheet($scoreSheet, $commonObjectives, $round);
                            break;
                        case OFFICE_SPECIAL: // special is also referenced as normal, don't count it twice!
                            $this->addSpecialOfficeToScoreSheet($scoreSheet, $commonObjectives, $round);
                            break;
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

        if ($endScoring) {
            $this->updateTouristTotal($scoreSheet, $commonObjectives, 0, true);
            $this->updateBusinessmenTotal($scoreSheet, $commonObjectives, 0, true);
        }

        $scoreSheet->total = 
            $scoreSheet->oldLadies->total + 
            $scoreSheet->students->total + 
            $scoreSheet->tourists->total + 
            $scoreSheet->businessmen->total + 
            ($scoreSheet->commonObjectives->total ?? 0) + 
            ($scoreSheet->personalObjective->total ?? 0) + 
            $scoreSheet->turnZones->total + 
            $scoreSheet->trafficJam->total;

        return $scoreSheet;
    }

    function getScoreSheets(int $playerId, array $placedRoutes, array $commonObjectives, bool $endScoring = false) {

        $mapPositions = $this->MAP_POSITIONS[$this->getMap()];

        $personalObjective = $this->getPersonalObjectiveLetters($playerId);

        $validatedPlacedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => $placedRoute->validated));

        $validatedScoreSheet = $this->getScoreSheet($validatedPlacedRoutes, $mapPositions, $personalObjective, $commonObjectives, $endScoring);
        $currentScoreSheet = count($validatedPlacedRoutes) === count($placedRoutes) ? 
            $validatedScoreSheet : 
            $this->getScoreSheet($placedRoutes, $mapPositions, $personalObjective, $commonObjectives, $endScoring);

        return new ScoreSheets(
            $validatedScoreSheet,
            $currentScoreSheet,
        );
    }
}

?>