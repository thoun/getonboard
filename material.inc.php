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
    16 => [OFFICE, ord('b')],

    21 => [BUSINESSMAN],
    22 => [TOURIST],
    23 => [GREEN_LIGHT, 1],
    24 => [BUSINESSMAN],
    25 => [GREEN_LIGHT, ord('c')],
    26 => [STUDENT],
    
    31 => [STUDENT],
    32 => [OFFICE, ord('d')],
    33 => [OLD_LADY],
    34 => [MONUMENT_DARK, MONUMENT_DARK_SPECIAL],
    35 => [OLD_LADY],
    36 => [GREEN_LIGHT, 2],
    
    41 => [GREEN_LIGHT, ord('e')],
    42 => [BUSINESSMAN],
    43 => [MONUMENT_LIGHT],
    44 => [STUDENT],
    45 => [OFFICE, ord('f')],
    46 => [TOURIST],
    
    51 => [STUDENT],
    52 => [SCHOOL],
    53 => [TOURIST],
    54 => [GREEN_LIGHT, ord('g')],
    55 => [TOURIST],
    56 => [SCHOOL],
    
    61 => [GREEN_LIGHT, 3],
    62 => [OLD_LADY],
    63 => [OFFICE, ord('h')],
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
    
    101 => [OFFICE, ord('l')],
    102 => [BUSINESSMAN],
    103 => [SCHOOL],
    104 => [OLD_LADY],
    105 => [TOURIST],
    106 => [OFFICE, OFFICE_SPECIAL, ord('m')],
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
    
    133 => [OFFICE, ord('o')],
    134 => [TOURIST],
  ],

  'big' => [
    11 => [OLD_LADY, BUSINESSMAN],
    12 => [TOURIST, STUDENT],
    13 => [TOURIST],
    14 => [OLD_LADY],
    15 => [GREEN_LIGHT, 7],
    17 => [SCHOOL],
    18 => [OLD_LADY, BUSINESSMAN],
    19 => [MONUMENT_LIGHT],

    21 => [GREEN_LIGHT, ord('a')],
    23 => [OFFICE, ord('d')],
    24 => [BUSINESSMAN],
    25 => [STUDENT],
    27 => [GREEN_LIGHT, ord('k')],
    28 => [TOURIST],
    29 => [GREEN_LIGHT, 11],

    31 => [MONUMENT_DARK],
    32 => [TOURIST],
    33 => [OLD_LADY],
    34 => [GREEN_LIGHT, 5],
    35 => [TOURIST],
    36 => [BUSINESSMAN],
    37 => [OLD_LADY],
    38 => [STUDENT],
    39 => [OFFICE, ord('n')],

    41 => [STUDENT],
    42 => [GREEN_LIGHT, 3],
    43 => [BUSINESSMAN],
    44 => [STUDENT],
    45 => [OFFICE, ord('g')],
    46 => [SCHOOL],
    47 => [GREEN_LIGHT, ord('l')],
    48 => [MONUMENT_DARK, MONUMENT_DARK_SPECIAL],
    49 => [TOURIST],

    51 => [GREEN_LIGHT, 1],
    52 => [TOURIST],
    53 => [SCHOOL],
    54 => [MONUMENT_LIGHT, MONUMENT_LIGHT_SPECIAL],
    55 => [OLD_LADY],
    56 => [TOURIST],
    57 => [BUSINESSMAN],
    58 => [GREEN_LIGHT, 9],
    59 => [STUDENT],

    61 => [BUSINESSMAN],
    62 => [OFFICE, ord('c')],
    63 => [TOURIST],
    64 => [BUSINESSMAN],
    65 => [GREEN_LIGHT, ord('h')],
    66 => [BUSINESSMAN],
    67 => [TOURIST],
    68 => [OLD_LADY],
    69 => [MONUMENT_LIGHT],

    71 => [GREEN_LIGHT, 2],
    72 => [OLD_LADY],
    73 => [STUDENT],
    74 => [GREEN_LIGHT, ord('f')],
    75 => [STUDENT],
    76 => [OFFICE, ord('j')],
    77 => [STUDENT],
    78 => [TOURIST],
    79 => [OLD_LADY, BUSINESSMAN],

    81 => [STUDENT],
    82 => [TOURIST],
    83 => [BUSINESSMAN],
    84 => [OLD_LADY],
    85 => [MONUMENT_DARK],
    86 => [OLD_LADY],
    87 => [BUSINESSMAN],
    88 => [SCHOOL, SCHOOL_SPECIAL],
    89 => [GREEN_LIGHT, 12],

    91 => [GREEN_LIGHT, ord('b')],
    92 => [SCHOOL],
    93 => [MONUMENT_DARK],
    94 => [TOURIST],
    95 => [GREEN_LIGHT, ord('i')],
    96 => [TOURIST],
    97 => [GREEN_LIGHT, ord('m')],
    98 => [BUSINESSMAN],
    99 => [OFFICE, ord('o')],

    101 => [BUSINESSMAN],
    102 => [TOURIST],
    103 => [OFFICE, OFFICE_SPECIAL, ord('e')],
    104 => [GREEN_LIGHT, 6],
    105 => [STUDENT],
    106 => [GREEN_LIGHT, 8],
    107 => [STUDENT],
    108 => [TOURIST],
    109 => [STUDENT],

    111 => [TOURIST, BUSINESSMAN],
    112 => [GREEN_LIGHT, 4],
    113 => [STUDENT],
    114 => [BUSINESSMAN],
    115 => [MONUMENT_LIGHT],
    116 => [BUSINESSMAN],
    117 => [OLD_LADY],
    118 => [GREEN_LIGHT, 10],
    119 => [TOURIST, BUSINESSMAN],
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
    11 => [12, 21],
    12 => [13],
    13 => [14, 23],
    14 => [15, 24],
    15 => [25],
    17 => [18, 27],
    18 => [19, 28],
    19 => [29],

    21 => [31],
    23 => [24, 33],
    24 => [25, 34],
    25 => [35],
    27 => [28, 37],
    28 => [38],
    29 => [39],

    31 => [32, 41],
    32 => [33],
    33 => [34, 43],
    34 => [35, 44],
    35 => [36, 45],
    36 => [37, 46],
    37 => [38],
    38 => [39, 48],
    39 => [49],

    41 => [42, 51],
    42 => [43, 52],
    43 => [44, 53],
    44 => [45, 54],
    45 => [46, 55],
    46 => [47, 56],
    47 => [57],
    48 => [49, 58],
    49 => [59],

    51 => [52, 61],
    52 => [53, 62],
    53 => [54, 63],
    54 => [55, 64],
    55 => [56, 65],
    56 => [57, 66],
    57 => [58, 67],
    58 => [59, 68],
    59 => [69],

    61 => [62, 71],
    62 => [63, 72],
    63 => [64, 73],
    64 => [65, 74],
    65 => [66, 75],
    66 => [67, 76],
    67 => [68, 77],
    68 => [69, 78],
    69 => [],

    71 => [72, 81],
    72 => [73, 82],
    73 => [83],
    74 => [75, 84],
    75 => [76, 85],
    76 => [77, 86],
    77 => [78],
    78 => [79, 88],
    79 => [89],

    81 => [91],
    82 => [83, 92],
    83 => [84, 93],
    84 => [85],
    85 => [86, 95],
    86 => [87, 96],
    87 => [88, 97],
    88 => [89, 98],
    89 => [99],

    91 => [92, 101],
    92 => [93, 102],
    93 => [94, 103],
    94 => [95, 104],
    95 => [96, 105],
    96 => [97, 106],
    97 => [98, 107],
    98 => [99, 108],
    99 => [109],

    101 => [102, 111],
    102 => [103, 112],
    103 => [104],
    104 => [105, 114],
    105 => [115],
    106 => [107, 116],
    107 => [108, 117],
    108 => [118],
    109 => [119],

    111 => [112],
    112 => [113],
    113 => [114],
    114 => [115],
    115 => [116],
    116 => [117],
    117 => [118],
    118 => [119],
    119 => [],
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

$this->COMMON_OBJECTIVES = [
  1 => [OLD_LADY, 5],
  2 => [STUDENT, 5],
  3 => [TOURIST, 5],
  4 => [BUSINESSMAN, 5],
  5 => [MONUMENT_LIGHT, 3],
  6 => [MONUMENT_DARK, 3],
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
  [0, 2, 2],
];

$this->OLD_LADIES_POINTS = [1, 1, 1, 2, 2, 2, 3, 3];
$this->TOURISTS_POINTS = [2, 5, 9, 14];
$this->BUSINESSMEN_POINTS = [2, 4, 6];
$this->BUSINESSMEN_BONUS = [OLD_LADY, TOURIST, INTERNSHIP];
$this->TURN_ZONES_POINTS = [-1, -2, -2, -2, -3];
$this->TRAFFIC_JAM_POINTS = [0, -1, 0, -1, 0, -1,
 -1, -1, -1, -1, -1, -1, -1, 
 -1, -1, -1, -1, -1, -1];