<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * GetOnBoard implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * getonboard.action.php
 *
 * GetOnBoard main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/getonboard/getonboard/myAction.html", ...)
 *
 */

class action_getonboardparisrome extends APP_GameAction
{ 
    // Constructor: please do not modify
   	public function __default() {
  	    if (self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    } else {
            $this->view = "getonboardparisrome_getonboardparisrome";
            self::trace( "Complete reinitialization of board game" );
        }
  	}
  	
    public function placeDeparturePawn() {
        self::setAjaxMode();

        $position = self::getArg("position", AT_posint, true);

        $this->game->placeDeparturePawn($position);

        self::ajaxResponse();
    }
  	
    public function placeRoute() {
        self::setAjaxMode();

        $from = self::getArg("from", AT_posint, true);
        $to = self::getArg("to", AT_posint, true);

        $this->game->placeRoute($from, $to);

        self::ajaxResponse();
    }
  	
    public function cancelLast() {
        self::setAjaxMode();

        $this->game->cancelLast();

        self::ajaxResponse();
    }
  	
    public function resetTurn() {
        self::setAjaxMode();

        $this->game->resetTurn();

        self::ajaxResponse();
    }
  	
    public function confirmTurn() {
        self::setAjaxMode();

        $this->game->confirmTurn();

        self::ajaxResponse();
    }

}
