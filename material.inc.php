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
    12 => [CINEMA],
    13 => [OLD_LADY],
    14 => [MONUMENT_DARK],
    15 => [LOVER_LIGHT],
    16 => [STUDENT, OLD_LADY],
    17 => [RESTAURANT, ord('l')],

    22 => [TOURIST],
    23 => [RESTAURANT, ord('c')],
    24 => [STUDENT],
    25 => [STATION, 4],
    26 => [TOURIST, LOVER_LIGHT],
    27 => [STATION, 5],
    28 => [STUDENT],
    
    32 => [STATION, ord('a')],
    33 => [OLD_LADY],
    34 => [STATION, ord('e')],
    35 => [LOVER_DARK],
    37 => [MONUMENT_LIGHT],
    38 => [LOVER_DARK],
    39 => [TOURIST],
    
    41 => [STUDENT],
    42 => [LOVER_LIGHT],
    43 => [MONUMENT_LIGHT],
    44 => [OLD_LADY],
    45 => [RESTAURANT, ord('g')],
    46 => [TOURIST],
    47 => [OLD_LADY],
    48 => [STATION, ord('n')],
    49 => [CINEMA],
    
    51 => [STATION, 1],
    52 => [TOURIST],
    53 => [STATION, ord('d')],
    54 => [RESTAURANT],
    55 => [TOURIST],
    56 => [STATION, ord('i')],
    57 => [STUDENT],
    58 => [LOVER_LIGHT],
    59 => [OLD_LADY],
    
    61 => [TOURIST, LOVER_DARK],
    62 => [OLD_LADY],
    63 => [STUDENT],
    64 => [LOVER_DARK],
    65 => [MONUMENT_DARK],
    66 => [LOVER_DARK],
    67 => [STATION, 6],
    68 => [TOURIST],
    
    72 => [RESTAURANT, ord('b')],
    73 => [TOURIST],
    74 => [STATION, ord('f')],
    75 => [LOVER_LIGHT],
    76 => [RESTAURANT, ord('j')],
    77 => [OLD_LADY],
    78 => [RESTAURANT, ord('o')],
    
    83 => [STATION, 2],
    84 => [MONUMENT_LIGHT],
    85 => [CINEMA],
    86 => [OLD_LADY],
    87 => [MONUMENT_DARK],
    88 => [STUDENT],
    
    92 => [STUDENT],
    93 => [OLD_LADY],
    94 => [STUDENT],
    95 => [STATION, ord('h')],
    96 => [TOURIST],
    97 => [STATION, ord('m')],
    98 => [LOVER_DARK],
    
    102 => [LOVER_DARK],
    103 => [MONUMENT_DARK],
    104 => [STATION, 3],
    105 => [LOVER_DARK],
    106 => [RESTAURANT, ord('k')],
    107 => [STUDENT],
    108 => [MONUMENT_LIGHT],
    
    112 => [CINEMA],
    113 => [LOVER_LIGHT],
    114 => [TOURIST],
  ],

  'big' => [
    12 => [RESTAURANT, ord('c')],
    13 => [TOURIST, STUDENT],
    14 => [LOVER_LIGHT],
    15 => [MONUMENT_LIGHT],
    16 => [OLD_LADY],
    17 => [LOVER_LIGHT],
    18 => [STATION, 11],

    21 => [STATION, 1],
    22 => [TOURIST],
    23 => [LOVER_LIGHT],
    24 => [STATION, 4],
    25 => [STUDENT],
    26 => [STATION, 7],
    27 => [TOURIST],
    28 => [MONUMENT_DARK],
    29 => [STUDENT, LOVER_LIGHT],

    31 => [CINEMA],
    32 => [LOVER_LIGHT],
    33 => [STUDENT],
    34 => [OLD_LADY],
    35 => [TOURIST],
    36 => [CINEMA],
    37 => [STATION, 9],
    38 => [STUDENT],
    39 => [TOURIST],

    41 => [TOURIST],
    42 => [STATION, 2],
    43 => [LOVER_DARK],
    44 => [MONUMENT_DARK],
    45 => [RESTAURANT, ord('i')],
    46 => [OLD_LADY],
    47 => [TOURIST],
    48 => [LOVER_DARK],
    49 => [RESTAURANT, ord('o')],

    51 => [STATION, ord('a')],
    52 => [MONUMENT_LIGHT],
    53 => [STATION, ord('e')],
    54 => [STUDENT],
    55 => [LOVER_LIGHT],
    56 => [MONUMENT_LIGHT],
    57 => [STATION, 10],
    58 => [OLD_LADY],
    59 => [STUDENT],

    61 => [STUDENT],
    62 => [OLD_LADY],
    63 => [TOURIST],
    64 => [STATION, ord('g')],
    65 => [OLD_LADY, STUDENT],
    66 => [STATION, ord('j')],
    67 => [LOVER_DARK],
    68 => [STATION, ord('l')],
    69 => [LOVER_DARK],

    71 => [TOURIST, LOVER_DARK],
    72 => [LOVER_LIGHT],
    73 => [RESTAURANT, ord('f')],
    74 => [LOVER_DARK],
    75 => [MONUMENT_DARK],
    76 => [TOURIST],
    77 => [RESTAURANT, ord('k')],
    78 => [TOURIST],
    79 => [CINEMA],

    81 => [STATION, ord('b')],
    82 => [STUDENT],
    83 => [TOURIST, OLD_LADY],
    84 => [STATION, 5],
    85 => [LOVER_DARK],
    86 => [STUDENT],
    87 => [OLD_LADY],
    88 => [STATION, ord('m')],
    89 => [TOURIST],

    91 => [TOURIST],
    92 => [STATION, 3],
    93 => [LOVER_DARK],
    94 => [MONUMENT_LIGHT],
    95 => [OLD_LADY],
    96 => [MONUMENT_DARK],
    97 => [CINEMA],
    98 => [LOVER_DARK],
    99 => [LOVER_LIGHT, OLD_LADY],

    101 => [CINEMA],
    102 => [STATION, ord('d')],
    103 => [STUDENT],
    104 => [LOVER_LIGHT],
    105 => [STATION, 6],
    106 => [LOVER_LIGHT],
    107 => [TOURIST],
    108 => [OLD_LADY],
    109 => [STATION, 12],

    112 => [TOURIST],
    113 => [OLD_LADY],
    114 => [RESTAURANT, ord('h')],
    115 => [STUDENT],
    116 => [STATION, 8],
    117 => [LOVER_DARK],
    118 => [RESTAURANT, ord('n')],
    119 => [STUDENT],
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
  4 => [LOVER_LIGHT, 5],
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
$this->LOVERS_POINTS = [2, 4, 6];
$this->PERSONAL_OBJECTIVE_POINTS = [0, 2, 5, 10];
$this->TURN_ZONES_POINTS = [-1, -2, -2, -2, -3];
$this->TRAFFIC_JAM_POINTS = [0, -1, 0, -1, 0, -1,
 -1, -1, -1, -1, -1, -1, -1, 
 -1, -1, -1, -1, -1, -1];