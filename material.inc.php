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
 * material.inc.php
 *
 * GetOnBoard game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

 $this->MAP_POSITIONS = [
  'small' => [
    11 => [SCHOOL, SCHOOL_SPECIAL],
    12 => [GREEN_LIGHT, ord('a')],
    13 => [STUDENT],
    14 => [MONUMENT_LIGHT],
    15 => [TOURIST],
    16 => [BUILDING, ord('b')],

    21 => [BUSINESSMAN],
    22 => [TOURIST],
    23 => [GREEN_LIGHT, 1],
    24 => [BUSINESSMAN],
    25 => [GREEN_LIGHT, ord('c')],
    26 => [STUDENT],
    
    31 => [STUDENT],
    32 => [BUILDING, ord('d')],
    33 => [OLD_LADY],
    34 => [MONUMENT_DARK, MONUMENT_DARK_SPECIAL],
    35 => [OLD_LADY],
    36 => [GREEN_LIGHT, 2],
    
    41 => [GREEN_LIGHT, ord('e')],
    42 => [BUSINESSMAN],
    43 => [MONUMENT_LIGHT],
    44 => [STUDENT],
    45 => [BUILDING, ord('f')],
    46 => [TOURIST],
    
    51 => [STUDENT],
    52 => [SCHOOL],
    53 => [TOURIST],
    54 => [GREEN_LIGHT, ord('g')],
    55 => [TOURIST],
    56 => [SCHOOL],
    
    61 => [GREEN_LIGHT, 3],
    62 => [OLD_LADY],
    63 => [BUILDING, ord('h')],
    64 => [OLD_LADY],
    65 => [GREEN_LIGHT, 4],
    66 => [BUSINESSMAN],
    
    71 => [TOURIST],
    72 => [STUDENT],
    73 => [TOURIST],
    74 => [BUSINESSMAN],
    75 => [STUDENT],
    76 => [MONUMENT_DARK],
    
    81 => [GREEN_LIGHT, ord('i')],
    82 => [OLD_LADY],
    83 => [BUSINESSMAN],
    84 => [MONUMENT_LIGHT, MONUMENT_LIGHT_SPECIAL],
    85 => [GREEN_LIGHT, ord('j')],
    86 => [OLD_LADY],
    87 => [BUSINESSMAN],
    
    91 => [MONUMENT_DARK],
    92 => [GREEN_LIGHT, ord('k')],
    93 => [TOURIST],
    94 => [STUDENT],
    95 => [BUSINESSMAN],
    96 => [TOURIST],
    97 => [GREEN_LIGHT, 5],
    
    101 => [BUILDING, ord('l')],
    102 => [BUSINESSMAN],
    103 => [SCHOOL],
    104 => [OLD_LADY],
    105 => [TOURIST],
    106 => [BUILDING, BUILDING_SPECIAL, ord('m')],
    107 => [STUDENT],
    
    112 => [GREEN_LIGHT, ord('n')],
    113 => [BUSINESSMAN],
    114 => [GREEN_LIGHT, 6],
    115 => [STUDENT],
    116 => [OLD_LADY],
    
    122 => [MONUMENT_LIGHT],
    123 => [OLD_LADY],
    124 => [SCHOOL],
    125 => [MONUMENT_DARK],
    
    133 => [BUILDING, ord('o')],
    134 => [TOURIST],
  ],

  'big' => [
    // TODO
    

/*define('GREEN_LIGHT', 0);
// 1 to 6 : starting point

define('OLD_LADY', 10);

define('STUDENT', 20);
define('SCHOOL', 21);
define('SCHOOL_SPECIAL', 25);

define('TOURIST', 30);
define('MONUMENT_LIGHT', 31);
define('MONUMENT_DARK', 32);
define('MONUMENT_LIGHT_SPECIAL', 35);
define('MONUMENT_DARK_SPECIAL', 36);

define('BUSINESSMAN', 40);
define('BUILDING', 21);
define('BUILDING_SPECIAL', 25);

// 97 to 122 : objectives (using ord('a'))*/
  ],
];

$this->MAP_ROUTES = [
 'small' => [
   11 => [12, 21],
   12 => [13, 22],
   13 => [14, 23],
   14 => [15, 24],
   15 => [16, 25],
   16 => [26],

   21 => [22, 31],
   22 => [23, 32],
   23 => [24, 33],
   24 => [25, 34],
   25 => [26, 35],
   26 => [36],

   31 => [32, 41],
   32 => [33, 42],
   33 => [43],
   34 => [35, 44],
   35 => [36, 45],
   36 => [46],

   41 => [42, 51],
   42 => [43, 52],
   43 => [44, 53],
   44 => [45, 54],
   45 => [46, 55],
   46 => [56],

   51 => [52, 61],
   52 => [53, 62],
   53 => [63],
   54 => [55, 64],
   55 => [56, 65],
   56 => [66],

   61 => [62, 71],
   62 => [63, 72],
   63 => [64, 73],
   64 => [65, 74],
   65 => [66, 75],
   66 => [76],

   71 => [72, 81],
   72 => [73, 82],
   73 => [74, 83],
   74 => [75, 84],
   75 => [76, 85],
   76 => [86],

   81 => [82, 91],
   82 => [83, 92],
   83 => [84, 93],
   84 => [85, 94],
   85 => [86, 95],
   86 => [87, 96],
   87 => [97],

   91 => [92, 101],
   92 => [93, 102],
   93 => [94, 103],
   94 => [95, 104],
   95 => [96, 105],
   96 => [97, 106],
   97 => [107],

   101 => [102],
   102 => [103, 112],
   103 => [104, 113],
   104 => [105, 114],
   105 => [106, 115],
   106 => [107, 116],
   107 => [107],

   112 => [113, 122],
   113 => [114, 123],
   114 => [115, 124],
   115 => [116, 125],
   116 => [],

   122 => [123],
   123 => [124, 133],
   124 => [125, 134],
   125 => [],

   133 => [134],
   134 => [],
 ],

 'big' => [
  // TODO
 ],
];


$this->BUSY_ROUTES = [
  'small' => [ 
    43 => [44], 
    52 => [53],
    53 => [63], 
    63 => [64, 73],
    64 => [74],
    73 => [74, 83],
    74 => [75, 84], 
    83 => [84, 93],
    84 => [94],
    93 => [94],
    94 => [104],
    104 => [105],
  ],
 
  'big' => [],
 ];

$this->MAP_DEPARTURE_POSITIONS = [
  'small' => [
    1 => 23,
    2 => 36,
    3 => 61,
    4 => 65,
    5 => 97,
    6 => 114,
  ],

  'big' => [
    1 => 51,
    2 => 71,
    3 => 42,
    4 => 112,
    5 => 34,
    6 => 104,
    7 => 15,
    8 => 106,
    9 => 58,
    10 => 118,
    11 => 29,
    12 => 99,
  ],
];

$this->COMMON_OBJECTIVES = [
  1 => [5, OLD_LADY],
  2 => [5, STUDENT],
  3 => [5, TOURIST],
  4 => [5, BUSINESSMAN],
  5 => [3, MONUMENT_LIGHT],
  6 => [3, MONUMENT_DARK],
];



$this->PERSONAL_OBJECTIVES = [
  'small' => [
    1 => [ord('a'), ord('f'), ord('k')],
    2 => [ord('b'), ord('g'), ord('l')],
    3 => [ord('c'), ord('h'), ord('o')],
    4 => [ord('d'), ord('i'), ord('m')],
    5 => [ord('e'), ord('j'), ord('n')],
  ],

  'big' => [
    1 => [ord('a'), ord('g'), ord('m')],
    2 => [ord('b'), ord('j'), ord('k')],
    3 => [ord('c'), ord('i'), ord('l')],
    4 => [ord('d'), ord('f'), ord('o')],
    5 => [ord('e'), ord('h'), ord('n')],
  ],
];

// 0 means any shape, 1 straight, 2 turn. This is for sheet 1, sheet 2 is the same but with indexes 1, 2, 3, 4, 5, 0, sheet 3 shift one more...
$this->SCORE_SHEETS_SHAPES = [
  [0, 1],
  [0, 2],
  [0, 0],
  [0],
  [0, 1, 1],
  [0, 0, 0],
];

$this->OLD_LADIES_POINTS = [1, 1, 1, 2, 2, 2, 3, 3];
$this->TOURISTS_POINTS = [2, 5, 9, 14];
$this->BUSINESSMEN_POINTS = [2, 4, 6];
$this->BUSINESSMEN_BONUS = [OLD_LADY, TOURIST, INTERNSHIP];
$this->TURN_ZONES_POINTS = [-1, -2, -2, -2, -3];
$this->TRAFFIC_JAM_POINTS = [0, -1, 0, -1, 0, -1,
 -1, -1, -1, -1, -1, -1, -1, 
 -1, -1, -1, -1, -1, -1];