function slideToObjectAndAttach(game, object, destinationId, posX, posY, rotation) {
    if (rotation === void 0) { rotation = 0; }
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var objectCR = object.getBoundingClientRect();
        var destinationCR = destination.getBoundingClientRect();
        var deltaX = destinationCR.left - objectCR.left + (posX !== null && posX !== void 0 ? posX : 0) * game.getZoom();
        var deltaY = destinationCR.top - objectCR.top + (posY !== null && posY !== void 0 ? posY : 0) * game.getZoom();
        var attachToNewParent = function () {
            object.style.top = posY !== undefined ? "".concat(posY, "px") : 'unset';
            object.style.left = posX !== undefined ? "".concat(posX, "px") : 'unset';
            object.style.position = (posX !== undefined || posY !== undefined) ? 'absolute' : 'relative';
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = rotation ? "rotate(".concat(rotation, "deg)") : 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        };
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        }
        else {
            object.style.transition = "transform 0.5s ease-in";
            object.style.transform = "translate(".concat(deltaX / game.getZoom(), "px, ").concat(deltaY / game.getZoom(), "px) rotate(").concat(rotation, "deg)");
            var securityTimeoutId_1 = null;
            var transitionend_1 = function () {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend_1);
                object.removeEventListener('transitioncancel', transitionend_1);
                resolve(true);
                if (securityTimeoutId_1) {
                    clearTimeout(securityTimeoutId_1);
                }
            };
            object.addEventListener('transitionend', transitionend_1);
            object.addEventListener('transitioncancel', transitionend_1);
            // security check : if transition fails, we force tile to destination
            securityTimeoutId_1 = setTimeout(function () {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend_1);
                    object.removeEventListener('transitioncancel', transitionend_1);
                    resolve(true);
                }
            }, 700);
        }
    });
}
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player) {
        this.game = game;
        this.player = player;
        this.playerId = Number(player.id);
        var eliminated = Number(player.eliminated) > 0;
        var html = "\n        <div id=\"player-table-".concat(player.id, "\" class=\"player-table ").concat(eliminated ? 'eliminated' : '', "\">\n            <div id=\"player-table-").concat(player.id, "-top\" class=\"top\" data-type=\"").concat(player.sheetType, "\"></div>\n            <div id=\"player-table-").concat(player.id, "-main\" class=\"main\"></div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</div>\n        </div>\n        ");
        dojo.place(html, 'player-tables');
    }
    return PlayerTable;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game) {
        var _this = this;
        this.game = game;
        // TODO TEMP
        var center = document.getElementById('center');
        Object.keys(game.gamedatas.MAP_ROUTES).forEach(function (key) {
            var position = Number(key);
            var destinations = game.gamedatas.MAP_ROUTES[position];
            dojo.place("<div id=\"position".concat(position, "\"></div>"), center);
            dojo.place("<button id=\"position".concat(position, "-placeDeparturePawn\" class=\"bgabutton bgabutton_blue disabled\">&gt; ").concat(position, "</button>"), "position".concat(position));
            document.getElementById("position".concat(position, "-placeDeparturePawn")).addEventListener('click', function () { return _this.game.placeDeparturePawn(position); });
            destinations.forEach(function (destination) {
                dojo.place("<button id=\"position".concat(position, "-placeRoute-to").concat(destination, "\" class=\"bgabutton bgabutton_blue placeRoute-button disabled\">").concat(position, " - ").concat(destination, "</button>"), "position".concat(position));
                document.getElementById("position".concat(position, "-placeRoute-to").concat(destination)).addEventListener('click', function () { return _this.game.placeRoute(position, destination); });
            });
        });
        // TODO TEMP
    }
    return TableCenter;
}());
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var ANIMATION_MS = 500;
var GetOnBoard = /** @class */ (function () {
    function GetOnBoard() {
        this.playersTables = [];
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    GetOnBoard.prototype.setup = function (gamedatas) {
        var players = Object.values(gamedatas.players);
        // ignore loading of some pictures
        if (players.length > 3) {
            this.dontPreloadImage("map23.jpg");
        }
        else {
            this.dontPreloadImage("map45.jpg");
        }
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this);
        this.createPlayerTables(gamedatas);
        this.setupNotifications();
        /*this.preferencesManager = new PreferencesManager(this);

        document.getElementById('zoom-out').addEventListener('click', () => this.tableManager?.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.tableManager?.zoomIn());*/
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    GetOnBoard.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'placeRoute':
                this.onEnteringPlaceRoute(args.args);
                break;
        }
    };
    GetOnBoard.prototype.onEnteringPlaceRoute = function (args) {
        args.possibleDestinations.forEach(function (destination) {
            var min = Math.min(args.currentPosition, destination);
            var max = Math.max(args.currentPosition, destination);
            document.getElementById("position".concat(min, "-placeRoute-to").concat(max)).classList.remove('disabled');
        });
    };
    GetOnBoard.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'placeRoute':
                Array.from(document.getElementsByClassName('placeRoute-button')).forEach(function (element) { return element.classList.add('disabled'); });
                break;
        }
    };
    /*private onLeavingStepEvolution() {
            const playerId = this.getPlayerId();
            this.getPlayerTable(playerId)?.unhighlightHiddenEvolutions();
    }*/
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    GetOnBoard.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        switch (stateName) {
            /*case 'changeActivePlayerDie': case 'psychicProbeRollDie':
                this.setDiceSelectorVisibility(true);
                this.onEnteringPsychicProbeRollDie(args); // because it's multiplayer, enter action must be set here
                break;*/
        }
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeDeparturePawn':
                    var placeDeparturePawnArgs = args;
                    /*placeDeparturePawnArgs._private.tickets.forEach(ticket =>
                        (this as any).addActionButton(`placeDeparturePawn${ticket}_button`, dojo.string.substitute(_("Start at ${ticket}"), { ticket }), () => this.placeDeparturePawn(ticket))
                    );*/
                    placeDeparturePawnArgs._private.positions.forEach(function (position) {
                        return document.getElementById("position".concat(position, "-placeDeparturePawn")).classList.remove('disabled');
                    });
                    break;
                case 'placeRoute':
                    this.addActionButton("confirmTurn_button", _("TODO confirmTurn"), function () { return _this.confirmTurn(); });
                    var placeRouteArgs = args;
                    if (!placeRouteArgs.canConfirm) {
                        dojo.addClass("confirmTurn_button", "disabled");
                    }
                    this.addActionButton("cancelLast_button", _("Cancel last marker"), function () { return _this.cancelLast(); }, null, null, 'grey');
                    this.addActionButton("resetTurn_button", _("Reset the whole turn"), function () { return _this.resetTurn(); }, null, null, 'grey');
                    if (!placeRouteArgs.canCancel) {
                        dojo.addClass("cancelLast_button", "disabled");
                        dojo.addClass("resetTurn_button", "disabled");
                    }
                    break;
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    GetOnBoard.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    GetOnBoard.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var playerId = Number(player.id);
            var eliminated = Number(player.eliminated) > 0;
            // health & energy counters
            var html = "<div class=\"counters\">\n                <div id=\"health-counter-wrapper-".concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon health\"></div> \n                    <span id=\"health-counter-").concat(player.id, "\"></span>\n                </div>\n                <div id=\"energy-counter-wrapper-").concat(player.id, "\" class=\"counter\">\n                    <div class=\"icon energy\"></div> \n                    <span id=\"energy-counter-").concat(player.id, "\"></span>\n                </div>");
            html += "</div>";
            dojo.place(html, "player_board_".concat(player.id));
            /*const healthCounter = new ebg.counter();
            healthCounter.create(`health-counter-${player.id}`);
            healthCounter.setValue(player.health);
            this.healthCounters[playerId] = healthCounter;

            const energyCounter = new ebg.counter();
            energyCounter.create(`energy-counter-${player.id}`);
            energyCounter.setValue(player.energy);
            this.energyCounters[playerId] = energyCounter;*/
            /*if (eliminated) {
                setTimeout(() => this.eliminatePlayer(playerId), 200);
            }*/
            // first player token
            dojo.place("<div id=\"player_board_".concat(player.id, "_firstPlayerWrapper\" class=\"firstPlayerWrapper disabled-shimmer\"></div>"), "player_board_".concat(player.id));
            if (gamedatas.firstPlayerTokenPlayerId === playerId) {
                _this.placeFirstPlayerToken(gamedatas.firstPlayerTokenPlayerId);
            }
        });
        //(this as any).addTooltipHtmlToClass('shrink-ray-tokens', this.SHINK_RAY_TOKEN_TOOLTIP);
        //(this as any).addTooltipHtmlToClass('poison-tokens', this.POISON_TOKEN_TOOLTIP);
    };
    GetOnBoard.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    GetOnBoard.prototype.createPlayerTable = function (gamedatas, playerId) {
        this.playersTables.push(new PlayerTable(this, gamedatas.players[playerId]));
    };
    /*private getPlayerTable(playerId: number): PlayerTable {
        return this.playerTables.find(playerTable => playerTable.playerId === Number(playerId));
    }*/
    GetOnBoard.prototype.getZoom = function () {
        //return this.tableManager.zoom;
        return null; // TODO
    };
    GetOnBoard.prototype.placeFirstPlayerToken = function (playerId) {
        var firstPlayerToken = document.getElementById('firstPlayerToken');
        if (firstPlayerToken) {
            slideToObjectAndAttach(this, firstPlayerToken, "player_board_".concat(playerId, "_firstPlayerWrapper"));
        }
        else {
            dojo.place('<div id="firstPlayerToken"></div>', "player_board_".concat(playerId, "_firstPlayerWrapper"));
            this.addTooltipHtml('firstPlayerToken', _("Inspector pawn. This player is the first player of the round."));
        }
    };
    GetOnBoard.prototype.placeDeparturePawn = function (position) {
        if (!this.checkAction('placeDeparturePawn')) {
            return;
        }
        this.takeAction('placeDeparturePawn', {
            position: position
        });
    };
    GetOnBoard.prototype.placeRoute = function (from, to) {
        if (!this.checkAction('placeRoute')) {
            return;
        }
        this.takeAction('placeRoute', {
            from: from,
            to: to,
        });
    };
    GetOnBoard.prototype.cancelLast = function () {
        if (!this.checkAction('cancelLast')) {
            return;
        }
        this.takeAction('cancelLast');
    };
    GetOnBoard.prototype.resetTurn = function () {
        if (!this.checkAction('resetTurn')) {
            return;
        }
        this.takeAction('resetTurn');
    };
    GetOnBoard.prototype.confirmTurn = function () {
        if (!this.checkAction('confirmTurn')) {
            return;
        }
        this.takeAction('confirmTurn');
    };
    GetOnBoard.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/getonboard/getonboard/".concat(action, ".html"), data, this, function () { });
    };
    GetOnBoard.prototype.startActionTimer = function (buttonId, time) {
        var _a;
        if (((_a = this.prefs[202]) === null || _a === void 0 ? void 0 : _a.value) === 2) {
            return;
        }
        var button = document.getElementById(buttonId);
        var actionTimerId = null;
        var _actionTimerLabel = button.innerHTML;
        var _actionTimerSeconds = time;
        var actionTimerFunction = function () {
            var button = document.getElementById(buttonId);
            if (button == null) {
                window.clearInterval(actionTimerId);
            }
            else if (_actionTimerSeconds-- > 1) {
                button.innerHTML = _actionTimerLabel + ' (' + _actionTimerSeconds + ')';
            }
            else {
                window.clearInterval(actionTimerId);
                button.click();
            }
        };
        actionTimerFunction();
        actionTimerId = window.setInterval(function () { return actionTimerFunction(); }, 1000);
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    GetOnBoard.prototype.setupNotifications = function () {
        //log( 'notifications subscriptions setup' );
        var _this = this;
        var notifs = [
            ['pickMonster', ANIMATION_MS],
            ['newFirstPlayer', 1],
            ['updateScoreSheet', 1], // TODO TEMP
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    GetOnBoard.prototype.notif_pickMonster = function (notif) {
        // TODO
    };
    GetOnBoard.prototype.notif_newFirstPlayer = function (notif) {
        console.log(notif.args);
        this.placeFirstPlayerToken(notif.args.playerId);
    };
    GetOnBoard.prototype.notif_updateScoreSheet = function (notif) {
        console.log(notif.args);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    GetOnBoard.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                // Representation of the color of a card
                /*['card_name', 'card_name2'].forEach(cardArg => {
                    if (args[cardArg]) {
                        let types: number[] = null;
                        if (typeof args[cardArg] == 'number') {
                            types = [args[cardArg]];
                        } else if (typeof args[cardArg] == 'string' && args[cardArg][0] >= '0' && args[cardArg][0] <= '9') {
                            types = args[cardArg].split(',').map((cardType: string) => Number(cardType));
                        }
                        if (types !== null) {
                            const tags: string[] = types.map((cardType: number) => {
                                const cardLogId = this.cardLogId++;

                                setTimeout(() => (this as any).addTooltipHtml(`card-log-${cardLogId}`, this.getLogCardTooltip(cardType)), 500);

                                return `<strong id="card-log-${cardLogId}" data-log-type="${cardType}">${this.getLogCardName(cardType)}</strong>`;
                            });
                            args[cardArg] = tags.join(', ');
                        }
                    }
                });*/
                /*for (const property in args) {
                    if (args[property]?.indexOf?.(']') > 0) {
                        args[property] = formatTextIcons(_(args[property]));
                    }
                }

                log = formatTextIcons(_(log));*/
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    return GetOnBoard;
}());
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.getonboard", ebg.core.gamegui, new GetOnBoard());
});
