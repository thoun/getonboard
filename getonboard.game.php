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
  * getonboard.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once(APP_GAMEMODULE_PATH.'module/table/table.game.php');

require_once('modules/php/constants.inc.php');
require_once('modules/php/utils.php');
require_once('modules/php/actions.php');
require_once('modules/php/states.php');
require_once('modules/php/args.php');
require_once('modules/php/score-sheet.php');
require_once('modules/php/debug-util.php');

class GetOnBoard extends Table {
    use UtilTrait;
    use ActionTrait;
    use StateTrait;
    use ArgsTrait;
    use ScoreSheetTrait;
    use DebugUtilTrait;

	function __construct() {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels([
            FIRST_PLAYER => 10,
            ELIMINATE_PLAYER => 11,

            SCORING_OPTION => 100,
        ]);   

        $this->tickets = self::getNew("module.common.deck");
        $this->tickets->init("tickets");     
	}
	
    protected function getGameName() {
		// Used for translations and stuff. Please do not modify.
        return "getonboard";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame($players, $options = []) {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        $sheetTypes = [1, 2, 3, 4, 5];
        $personalObjectives = [1, 2, 3, 4, 5];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_sheet_type, player_personal_objective) VALUES ";
        $values = [];
        foreach($players as $player_id => $player) {
            $color = array_shift($default_colors);

            $sheetTypeIndex = bga_rand(0, count($sheetTypes) - 1);
            $sheetType = array_splice($sheetTypes, $sheetTypeIndex, 1)[0];
            $sheetTypes = array_values($sheetTypes);

            $personalObjectiveIndex = bga_rand(0, count($personalObjectives) - 1);
            $personalObjective = array_splice($personalObjectives, $personalObjectiveIndex, 1)[0];
            $personalObjectives = array_values($personalObjectives);

            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."', $sheetType, $personalObjective)";
        }
        $sql .= implode(',', $values);
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue(FIRST_PLAYER, intval(array_keys($players)[0]));
        self::setGameStateInitialValue(ELIMINATE_PLAYER, 0);
        
        // Init game statistics
        foreach(['table', 'player'] as $statType) {
            $this->initStat($statType, 'turnsNumber', 0);
            $this->initStat($statType, 'markersPlaced', 0);
            $this->initStat($statType, 'greenLightsUsed', 0);
            $this->initStat($statType, 'turnZoneUsed', 0);
            $this->initStat($statType, 'trafficJamUsed', 0);
            $this->initStat($statType, 'commonObjectivesFirst', 0);
            $this->initStat($statType, 'commonObjectivesSecond', 0);
            $this->initStat($statType, 'personalObjectives', 0);
        }
        

        $this->setupCommonObjectives();
        $this->setupTickets(count($players));
        $this->dealTickets(array_keys($players));

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        // TODO TEMP to test
        //$this->debugSetup();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas() {
        $result = [];
    
        $currentPlayerId = intval(self::getCurrentPlayerId());    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_no playerNo, player_sheet_type sheetType, player_departure_position departurePosition FROM player ";
        $result['players'] = self::getCollectionFromDb($sql);
        $map = $this->getMap();

        $showDeparturePosition = intval($this->gamestate->state_id()) >= ST_START_GAME;
        $isEndScore = intval($this->gamestate->state_id()) >= ST_END_SCORE;

        $commonObjectives = $this->getCommonObjectives();
        foreach ($result['players'] as $playerId => &$playerDb) {
            $playerDb['playerNo'] = intval($playerDb['playerNo']);
            $playerDb['sheetType'] = intval($playerDb['sheetType']);
            $playerDb['departurePosition'] = $showDeparturePosition ? intval($playerDb['departurePosition']) : null;
            $placedRoutes = $this->getPlacedRoutes($playerId);
            $playerDb['markers'] = $placedRoutes;
        $playerDb['scoreSheets'] = $this->getScoreSheets($playerId, $placedRoutes, $commonObjectives, $isEndScore);

            if ($playerId === $currentPlayerId || $isEndScore) {
                $personalObjective = intval($this->getUniqueValueFromDB("SELECT player_personal_objective FROM `player` where `player_id` = $playerId"));
                $playerDb['personalObjective'] = $personalObjective;
                $playerDb['personalObjectiveLetters'] = $personalObjective == 0 ? null : array_map(fn($code) => chr($code), $this->getPersonalObjectiveLetters($playerId));
                $playerDb['personalObjectivePositions'] = $personalObjective == 0 ? null : $this->getPersonalObjectivePositions($personalObjective, $map);
            }
        }
  
        $result['roundNumber'] = $this->getRoundNumber();
        $result['map'] = $map;
        $result['MAP_ROUTES'] = $this->MAP_ROUTES[$map];
        $result['firstPlayerTokenPlayerId'] = intval($this->getGameStateValue(FIRST_PLAYER));
        $result['validatedTickets'] = $this->getValidatedTicketsForRound();
        $result['currentTicket'] = $this->getCurrentTicketForRound();
        $result['commonObjectives'] = $this->getCommonObjectives();
        $result['hiddenScore'] = intval(self::getGameStateValue('SCORING_OPTION')) !== 2;

        $result['MAP_POSITIONS'] = $this->MAP_POSITIONS[$map];
  
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression() {
        $stateId = intval($this->gamestate->state_id());
        if ($stateId >= ST_END_SCORE) {
            return 100;
        } else if ($stateId <= ST_START_GAME) {
            return 0;
        } else {
            return 4 + 8 * ($this->getRoundNumber() - 1);
        }
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn($state, $active_player) {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                case 'placeRoute':
                    $placedRoutes = $this->getPlacedRoutes($active_player);
                    $unvalidatedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => !$placedRoute->validated));

                    if (count($unvalidatedRoutes) > 0) {
                        $this->applyCancel($unvalidatedRoutes, '');
                    }

                    $this->gamestate->nextState("nextPlayer");
                	break;
                default:
                    $this->gamestate->nextState("nextPlayer");
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException("Zombie mode not supported at this game state: ".$statename);
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb($from_version) {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
