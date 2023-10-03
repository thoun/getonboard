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

    function addStationToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet) {
        if ($scoreSheet->stations->encircled < 6) {
            $scoreSheet->stations->encircled++;
            $scoreSheet->stations->total = 2 * ($scoreSheet->stations->encircled - $scoreSheet->stations->checked);
        }
    }

    function addUsedStationToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet) {
        if ($scoreSheet->stations->checked < 6) {
            $scoreSheet->stations->checked++;
            $scoreSheet->stations->total = 2 * ($scoreSheet->stations->encircled - $scoreSheet->stations->checked);
        }
    }

    function addOldLadyToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $scoreSheet->oldLadies->checked++;
        $scoreSheet->oldLadies->total = $this->getTotalForSimpleZone($scoreSheet->oldLadies->checked, $this->OLD_LADIES_POINTS);
        
        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, OLD_LADY, $scoreSheet->oldLadies->checked, $round);
    }

    function updateStudentTotal(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $checked = $scoreSheet->students->checkedStudents;
        $scoreSheet->students->total = $checked * $scoreSheet->students->checkedCinemas;
        
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

        $scoreSheet->tourists->total = 0;
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
    
    function addLoverToScoreSheet(ScoreSheet &$scoreSheet, string $type, array $commonObjectives, int $round) {
        $rowIndex = count($scoreSheet->lovers->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->lovers->{'checkedLovers'.$type}[$rowIndex] < 2) {
            $scoreSheet->lovers->{'checkedLovers'.$type}[$rowIndex]++;
            $this->updateLoversTotal($scoreSheet, $commonObjectives, $round);
        }
    }

    function getLoverPoints(int $light, int $dark) {
        $couples = min($light, $dark);
        $singles = max($light, $dark) - $couples;
        return $couples * 6 + $singles * 2;
    }

    function addRestaurantToScoreSheet(ScoreSheet &$scoreSheet, array $commonObjectives, int $round) {
        $rowIndex = count($scoreSheet->lovers->subTotals);
        if ($rowIndex >= 3) {
            return;
        }
        if ($scoreSheet->lovers->checkedLoversLight[$rowIndex] > 0 || $scoreSheet->lovers->checkedLoversDark[$rowIndex] > 0) {
            $scoreSheet->lovers->subTotals[$rowIndex] = $this->getLoverPoints($scoreSheet->lovers->checkedLoversLight[$rowIndex], $scoreSheet->lovers->checkedLoversDark[$rowIndex]);
        }
        $this->updateLoversTotal($scoreSheet, $commonObjectives, $round);
    }
    
    function updateLoversTotal(ScoreSheet &$scoreSheet, array $commonObjectives, int $round, bool $endScoring = false) {
        if ($endScoring) {
            $rowIndex = count($scoreSheet->lovers->subTotals);
            if ($rowIndex < 3) {
                if ($scoreSheet->lovers->checkedLoversLight[$rowIndex] > 0 || $scoreSheet->lovers->checkedLoversDark[$rowIndex] > 0) {
                    $scoreSheet->lovers->subTotals[$rowIndex] = floor($this->getLoverPoints($scoreSheet->lovers->checkedLoversLight[$rowIndex], $scoreSheet->lovers->checkedLoversDark[$rowIndex]) / 2);
                }
            }
        }

        $scoreSheet->lovers->total = 0;
        foreach($scoreSheet->lovers->subTotals as $subTotal) {
            $scoreSheet->lovers->total += $subTotal;
        }   
        
        $totalCheckedLovers = 0;
        foreach ($scoreSheet->lovers->checkedLoversLight as $checkedLovers) {
            $totalCheckedLovers += $checkedLovers;
        }
        foreach ($scoreSheet->lovers->checkedLoversDark as $checkedLovers) {
            $totalCheckedLovers += $checkedLovers;
        }
        $this->checkCompletedCommonObjective($scoreSheet, $commonObjectives, LOVER_LIGHT, $totalCheckedLovers, $round);
    }

    function addTurnZoneToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet) {
        $scoreSheet->turnZones->checked = min($scoreSheet->turnZones->checked + 1, 5);
        $scoreSheet->turnZones->total = $this->getTotalForSimpleZone($scoreSheet->turnZones->checked, $this->TURN_ZONES_POINTS);
    }

    function addConnectionsToScoreSheetAndUpdateTotal(ScoreSheet &$scoreSheet, int $connections) {
        $scoreSheet->connections->checked = min($scoreSheet->connections->checked + $connections, 19);
        $scoreSheet->connections->total = $this->getTotalForSimpleZone($scoreSheet->connections->checked, $this->CONNECTION_POINTS);
    }

    function getScoreSheet(int $connectionColor, array $placedRoutes, array $mapPositions, array $personalObjectives, array $commonObjectives, bool $endScoring = false) {
        $scoreSheet = new ScoreSheet();
        $scoreSheet->connectionColor = $connectionColor;

        $visitedLetters = [];

        foreach ($placedRoutes as $placedRoute) {
            $mapPosition = $mapPositions[$placedRoute->to];
            $round = $placedRoute->round;

            foreach ($mapPosition as $element) {
                if ($element > 90 && $scoreSheet->personalObjective->total < 10) {
                    $visitedLetters[] = $element;

                    if ($endScoring) {
                        $visitedLettersCount = count(array_filter($personalObjectives, fn($letter) => in_array($letter, $visitedLetters)));
                        $scoreSheet->personalObjective->total = $this->PERSONAL_OBJECTIVE_POINTS[$visitedLettersCount];
                    }
                } else {
                    switch ($element) {
                        // stations
                        case STATION:
                            $this->addStationToScoreSheetAndUpdateTotal($scoreSheet);
                            break;

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
                        case CINEMA:
                            if ($scoreSheet->students->checkedCinemas < 4) {
                                $scoreSheet->students->checkedCinemas++;
                                $this->updateStudentTotal($scoreSheet, $commonObjectives, $round);
                            }
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

                        // lovers
                        case LOVER_LIGHT:
                        case LOVER_DARK:
                            $this->addLoverToScoreSheet($scoreSheet, $element == LOVER_DARK ? 'Dark' : 'Light', $commonObjectives, $round);
                            break;
                        case RESTAURANT:
                            $this->addRestaurantToScoreSheet($scoreSheet, $commonObjectives, $round);
                            break;
                    }
                }
            }

            if ($placedRoute->useTurnZone) {
                $this->addTurnZoneToScoreSheetAndUpdateTotal($scoreSheet);
            }
            if ($placedRoute->connections > 0) {
                $this->addConnectionsToScoreSheetAndUpdateTotal($scoreSheet, $placedRoute->connections);
            }
            // stations
            if ($placedRoute->useStation) {
                $this->addUsedStationToScoreSheetAndUpdateTotal($scoreSheet);
            }
        }

        if ($endScoring) {
            $this->updateTouristTotal($scoreSheet, $commonObjectives, 0, true);
            $this->updateLoversTotal($scoreSheet, $commonObjectives, 0, true);
        }

        $scoreSheet->total = 
            $scoreSheet->stations->total +
            $scoreSheet->oldLadies->total + 
            $scoreSheet->students->total + 
            $scoreSheet->tourists->total + 
            $scoreSheet->lovers->total + 
            ($scoreSheet->commonObjectives->total ?? 0) + 
            ($scoreSheet->personalObjective->total ?? 0) + 
            $scoreSheet->turnZones->total + 
            $scoreSheet->connections->total;

        return $scoreSheet;
    }

    function getScoreSheets(int $playerId, array $placedRoutes, array $commonObjectives, bool $endScoring = false) {
        $connectionColor = intval($this->getGameStateValue(CONNECTION_COLOR));

        $mapPositions = $this->MAP_POSITIONS[$this->getMap()];

        $personalObjective = $this->getPersonalObjectiveLetters($playerId);

        $validatedPlacedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => $placedRoute->validated));

        $validatedScoreSheet = $this->getScoreSheet($connectionColor, $validatedPlacedRoutes, $mapPositions, $personalObjective, $commonObjectives, $endScoring);
        $currentScoreSheet = count($validatedPlacedRoutes) === count($placedRoutes) ? 
            $validatedScoreSheet : 
            $this->getScoreSheet($connectionColor, $placedRoutes, $mapPositions, $personalObjective, $commonObjectives, $endScoring);

        return new ScoreSheets(
            $validatedScoreSheet,
            $currentScoreSheet,
        );
    }
}

?>