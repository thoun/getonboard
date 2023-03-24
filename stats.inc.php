<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * GetOnBoard implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * stats.inc.php
 *
 * GetOnBoard game statistics description
 *
 */

/*
    In this file, you are describing game statistics, that will be displayed at the end of the
    game.
    
    !! After modifying this file, you must use "Reload  statistics configuration" in BGA Studio backoffice
    ("Control Panel" / "Manage Game" / "Your Game")
    
    There are 2 types of statistics:
    _ table statistics, that are not associated to a specific player (ie: 1 value for each game).
    _ player statistics, that are associated to each players (ie: 1 value for each player in the game).

    Statistics types can be "int" for integer, "float" for floating point values, and "bool" for boolean
    
    Once you defined your statistics there, you can start using "initStat", "setStat" and "incStat" method
    in your game logic, using statistics names defined below.
    
    !! It is not a good idea to modify this file when a game is running !!

    If your game is already public on BGA, please read the following before any change:
    http://en.doc.boardgamearena.com/Post-release_phase#Changes_that_breaks_the_games_in_progress
    
    Notes:
    * Statistic index is the reference used in setStat/incStat/initStat PHP method
    * Statistic index must contains alphanumerical characters and no space. Example: 'turn_played'
    * Statistics IDs must be >=10
    * Two table statistics can't share the same ID, two player statistics can't share the same ID
    * A table statistic can have the same ID than a player statistics
    * Statistics ID is the reference used by BGA website. If you change the ID, you lost all historical statistic data. Do NOT re-use an ID of a deleted statistic
    * Statistic name is the English description of the statistic as shown to players
    
*/

$commonStats = [
    "turnsNumber" => [
        "id" => 11,
        "name" => totranslate("Number of turns"),
        "type" => "int" 
    ],
    "markersPlaced" => [
        "id" => 12,
        "name" => totranslate("Markers placed"),
        "type" => "int"
    ],
    "greenLightsUsed" => [
        "id" => 13,
        "name" => totranslate("Green lights used"),
        "type" => "int"
    ],
    "turnZoneUsed" => [
        "id" => 14,
        "name" => totranslate("Turn zone checks"),
        "type" => "int"
    ],
    "trafficJamUsed" => [
        "id" => 15,
        "name" => totranslate("Traffic jam checks"),
        "type" => "int"
    ],
    "commonObjectivesFirst" => [
        "id" => 16,
        "name" => totranslate("Common objectives (realized with 10 points)"),
        "type" => "int"
    ],
    "commonObjectivesSecond" => [
        "id" => 17,
        "name" => totranslate("Common objectives (realized with 6 points)"),
        "type" => "int"
    ],
    "personalObjectives" => [
        "id" => 18,
        "name" => totranslate("Personal objective realized"),
        "type" => "int"
    ],
];

$stats_type = [

    // Statistics global to table
    "table" => $commonStats,
    
    // Statistics existing for each player
    "player" => $commonStats + [        
        "finalScoreOldLadies" => [
            "id" => 19,
            "name" => totranslate("Final score for Old ladies"),
            "type" => "int"
        ],
        "finalScoreStudents" => [
            "id" => 20,
            "name" => totranslate("Final score for Students"),
            "type" => "int"
        ],
        "finalScoreTourists" => [
            "id" => 21,
            "name" => totranslate("Final score for Tourists"),
            "type" => "int"
        ],
        "finalScoreLovers" => [
            "id" => 22,
            "name" => totranslate("Final score for Lovers"),
            "type" => "int"
        ],
        "averagePointsByCheckedOldLadies" => [
            "id" => 23,
            "name" => totranslate("Average points by checked Old ladies"),
            "type" => "float"
        ],
        "averagePointsByCheckedStudents" => [
            "id" => 24,
            "name" => totranslate("Average points by checked Students"),
            "type" => "float"
        ],
        "averagePointsByCheckedTourists" => [
            "id" => 25,
            "name" => totranslate("Average points by checked Tourists"),
            "type" => "float"
        ],
        "averagePointsByCheckedLovers" => [
            "id" => 26,
            "name" => totranslate("Average points by checked Lovers"),
            "type" => "float"
        ],
    ]
];
