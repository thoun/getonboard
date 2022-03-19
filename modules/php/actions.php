<?php

trait ActionTrait {

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 
    
    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */

    public function placeDeparturePawn(int $position) {
        self::checkAction('placeDeparturePawn'); 
        
        $playerId = self::getCurrentPlayerId();

        $tickets = $this->getCardsFromDb($this->tickets->getCardsInLocation('hand', $playerId));

        $mapElements = $this->MAP_POSITIONS[$this->getMap()][$position];
        $ticketNumber = $this->array_find($mapElements, fn($element) => $element >= 1 && $element <= 12);

        if ($ticketNumber === null || !$this->array_some($tickets, fn($ticket) => $ticket->type == $ticketNumber)) {
            throw new BgaUserException("Invalid departure");
        }

        $position = $this->MAP_DEPARTURE_POSITIONS[$this->getMap()][$ticketNumber]; 

        $this->DbQuery("UPDATE player SET `player_departure_position` = $position WHERE `player_id` = $playerId"); 

        self::notifyAllPlayers('placedDeparturePawn', clienttranslate('${player_name} places departure pawn'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'position' => $position,
        ]);

        $this->gamestate->setPlayerNonMultiactive($playerId, 'next');
    }
        
  	
    public function placeRoute(int $routeFrom, int $routeTo) {
        self::checkAction('placeRoute'); 
        
        $playerId = intval(self::getActivePlayerId());

        $allPlacedRoutes = $this->getPlacedRoutes();
        $playerPlacedRoutes = array_filter($allPlacedRoutes, fn($placedRoute) => $placedRoute->playerId === $playerId);
        $currentPosition = $this->getCurrentPosition($playerId, $playerPlacedRoutes);
        $from = $currentPosition == $routeFrom ? $routeFrom : $routeTo;
        $to = $currentPosition == $routeFrom ? $routeTo : $routeFrom;
        $turnShape = $this->getPlayerTurnShape($playerId);
        $possibleRoutes = $this->getPossibleRoutes($playerId, $this->getMap(), $turnShape, $currentPosition, $allPlacedRoutes);
        $possibleRoute = $this->array_find($possibleRoutes, fn($route) => $this->isSameRoute($route, $from, $to));

        if ($possibleRoute == null) {
            throw new BgaUserException("Invalid route");
        }

        $round = $this->getRoundNumber();
        $useTurnZone = $possibleRoute->useTurnZone ? 1 : 0;
        $this->DbQuery("INSERT INTO placed_routes(`player_id`, `from`, `to`, `round`, `use_turn_zone`, `traffic_jam`) VALUES ($playerId, $from, $to, $round, $useTurnZone, $possibleRoute->trafficJam)");
        
        self::notifyAllPlayers('placedRoute', clienttranslate('${player_name} places a route marker'), [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'marker' => PlacedRoute::forNotif($from, $to, false),
        ]);

        if ($possibleRoute->isElimination) {
            $this->setGameStateValue(ELIMINATE_PLAYER, $playerId);
            $this->applyConfirmTurn($playerId);
        }

        $this->notifUpdateScoreSheet($playerId);

        //self::incStat(1, 'placedRoutes');
        //self::incStat(1, 'placedRoutes', $playerId);

        $this->gamestate->nextState('placeNext');
    }

    private function applyCancel(array $routes) {
        $playerId = intval(self::getActivePlayerId());
        $routesIds = array_map(fn($route) => $route->id, $routes);

        $this->DbQuery("DELETE FROM placed_routes WHERE `id` IN (".implode(',', $routesIds).")");

        self::notifyAllPlayers('removeMarkers', '', [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'markers' => array_map(fn($route) => PlacedRoute::forNotif($route->from, $route->to, false), $routes),
        ]);

        $this->notifUpdateScoreSheet($playerId);

        $this->gamestate->nextState('placeNext');
    }
  	
    public function cancelLast() {
        self::checkAction('cancelLast'); 
        
        $playerId = self::getActivePlayerId();

        $placedRoutes = $this->getPlacedRoutes($playerId);
        $canCancel = count($placedRoutes) > 0 && !end($placedRoutes)->validated;

        if (!$canCancel) {
            throw new BgaUserException("No move to cancel");
        }

        $routesToCancel = [end($placedRoutes)];
        $this->applyCancel($routesToCancel);
    }
  	
    public function resetTurn() {
        self::checkAction('resetTurn'); 
        
        $playerId = self::getActivePlayerId();

        $placedRoutes = $this->getPlacedRoutes($playerId);
        $unvalidatedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => !$placedRoute->validated));

        if (count($unvalidatedRoutes) == 0) {
            throw new BgaUserException("No move to cancel");
        }

        $this->applyCancel($unvalidatedRoutes);
    }

    private function applyConfirmTurn(int $playerId) {
        $placedRoutes = $this->getPlacedRoutes($playerId);
        $unvalidatedRoutes = array_values(array_filter($placedRoutes, fn($placedRoute) => !$placedRoute->validated));
        $unvalidatedRoutesIds = array_map(fn($placedRoute) => $placedRoute->id, $unvalidatedRoutes);

        $this->DbQuery("UPDATE placed_routes SET `validated` = 1 WHERE `id` IN (".implode(',', $unvalidatedRoutesIds).")");

        self::notifyAllPlayers('confirmTurn', '', [
            'playerId' => $playerId,
            'player_name' => self::getActivePlayerName(),
            'markers' => array_map(fn($route) => PlacedRoute::forNotif($route->from, $route->to, true), $unvalidatedRoutes),
        ]);
        
        $scoreSheets = $this->notifUpdateScoreSheet($playerId);
        $score = $scoreSheets->validated->total;
        $this->DbQuery("UPDATE player SET `player_score` = $score WHERE `player_id` = $playerId");

        $this->gamestate->nextState('nextPlayer');
    }
  	
    public function confirmTurn() {
        self::checkAction('confirmTurn'); 
        
        $playerId = self::getActivePlayerId();

        $this->applyConfirmTurn($playerId);
    }
}
