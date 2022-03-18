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
    function PlayerTable(player) {
        this.playerId = Number(player.id);
        var eliminated = Number(player.eliminated) > 0;
        var html = "\n        <div id=\"player-table-".concat(player.id, "\" class=\"player-table ").concat(eliminated ? 'eliminated' : '', "\" style=\"box-shadow: 0 0 3px 3px #").concat(player.color, ";\">\n            <div id=\"player-table-").concat(player.id, "-top\" class=\"top\" data-type=\"").concat(player.sheetType, "\">\n            ");
        for (var i = 1; i <= 12; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-top-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += " \n            </div>\n            <div id=\"player-table-".concat(player.id, "-main\" class=\"main\">\n                <div class=\"old-ladies block\">");
        for (var i = 1; i <= 8; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-old-ladies-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "        \n                    <div id=\"player-table-".concat(player.id, "-old-ladies-total\" class=\"total\"></div>\n                </div>\n                <div class=\"students block\">\n                ");
        for (var i = 1; i <= 6; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-students-checkmark").concat(i, "\" class=\"students checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-internships-checkmark").concat(i, "\" class=\"internships checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 4; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-schools-checkmark").concat(i, "\" class=\"schools checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(player.id, "-students-special\" class=\"special\"></div>\n                    <div id=\"player-table-").concat(player.id, "-students-subtotal\" class=\"subtotal\"></div>\n                    <div id=\"player-table-").concat(player.id, "-students-total\" class=\"total\"></div>\n                </div>\n                <div class=\"tourists block\">");
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-tourists-light-checkmark").concat(i, "\" class=\"monument light checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-tourists-dark-checkmark").concat(i, "\" class=\"monument dark checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(player.id, "-tourists-specialLight\" class=\"special\" data-style=\"Light\"></div>\n                    <div id=\"player-table-").concat(player.id, "-tourists-specialDark\" class=\"special\" data-style=\"Dark\"></div>\n                    <div id=\"player-table-").concat(player.id, "-tourists-specialMax\" class=\"special\"></div>");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 4; i++) {
                html += "\n                        <div id=\"player-table-".concat(player.id, "-tourists-checkmark").concat(row, "-").concat(i, "\" class=\"tourists checkmark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += " \n                    <div id=\"player-table-".concat(player.id, "-tourists-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(player.id, "-tourists-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(player.id, "-tourists-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(player.id, "-tourists-total\" class=\"total\"></div>\n                </div>\n                <div class=\"businessmen block\">\n                    <div id=\"player-table-").concat(player.id, "-businessmen-special\" class=\"special\"></div>");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 3; i++) {
                html += "\n                        <div id=\"player-table-".concat(player.id, "-businessmen-checkmark").concat(row, "-").concat(i, "\" class=\"checkmark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += "\n                    <div id=\"player-table-".concat(player.id, "-businessmen-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(player.id, "-businessmen-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(player.id, "-businessmen-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(player.id, "-businessmen-total\" class=\"total\"></div>\n                </div>\n                <div class=\"common-objectives block\">\n                    <div id=\"player-table-").concat(player.id, "-common-objectives-objective1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(player.id, "-common-objectives-objective2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(player.id, "-common-objectives-total\" class=\"total\"></div>\n                </div>\n                <div class=\"personal-objective block\">\n                    <div id=\"player-table-").concat(player.id, "-personal-objective-total\" class=\"total\"></div>\n                </div>\n                <div class=\"turn-zones block\">");
        for (var i = 1; i <= 5; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-turn-zones-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(player.id, "-turn-zones-total\" class=\"total\"></div>\n                </div>\n                <div class=\"traffic-jam block\">");
        for (var i = 1; i <= 19; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-traffic-jam-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(player.id, "-traffic-jam-total\" class=\"total\"></div>\n                </div>\n                <div id=\"player-table-").concat(player.id, "-total-score\" class=\"total score\"></div>\n            </div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</div>\n            <div id=\"player-table-").concat(player.id, "-first-player-wrapper\" class=\"first-player-wrapper\"></div>\n        </div>\n        ");
        dojo.place(html, 'player-tables');
        this.updateScoreSheet(player.scoreSheets);
    }
    PlayerTable.prototype.setRound = function (validatedTickets, currentTicket) {
        if (!currentTicket) {
            return;
        }
        for (var i = 1; i <= 12; i++) {
            this.setContentAndValidation("top-checkmark".concat(i), currentTicket === i || validatedTickets.includes(i) ? '✔' : '', currentTicket === i);
        }
    };
    PlayerTable.prototype.updateScoreSheet = function (scoreSheets) {
        this.updateOldLadiesScoreSheet(scoreSheets.current.oldLadies, scoreSheets.validated.oldLadies);
        this.updateStudentsScoreSheet(scoreSheets.current.students, scoreSheets.validated.students);
        this.updateTouristsScoreSheet(scoreSheets.current.tourists, scoreSheets.validated.tourists);
        this.updateBusinessmenScoreSheet(scoreSheets.current.businessmen, scoreSheets.validated.businessmen);
        this.updateCommonObjectivesScoreSheet(scoreSheets.current.commonObjectives, scoreSheets.validated.commonObjectives);
        this.updatePersonalObjectiveScoreSheet(scoreSheets.current.personalObjective, scoreSheets.validated.personalObjective);
        this.updateTurnZonesScoreSheet(scoreSheets.current.turnZones, scoreSheets.validated.turnZones);
        this.updateTrafficJamScoreSheet(scoreSheets.current.trafficJam, scoreSheets.validated.trafficJam);
        this.setContentAndValidation("total-score", scoreSheets.current.total, scoreSheets.current.total != scoreSheets.validated.total);
    };
    PlayerTable.prototype.setContentAndValidation = function (id, content, unvalidated) {
        var div = document.getElementById("player-table-".concat(this.playerId, "-").concat(id));
        var contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        }
        else if (typeof content === 'number') {
            contentStr = '' + content;
        }
        div.innerHTML = contentStr;
        div.dataset.unvalidated = unvalidated.toString();
    };
    PlayerTable.prototype.updateOldLadiesScoreSheet = function (current, validated) {
        for (var i = 1; i <= 8; i++) {
            this.setContentAndValidation("old-ladies-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        this.setContentAndValidation("old-ladies-total", current.total, current.total !== validated.total);
    };
    PlayerTable.prototype.updateStudentsScoreSheet = function (current, validated) {
        for (var i = 1; i <= 6; i++) {
            this.setContentAndValidation("students-checkmark".concat(i), current.checkedStudents >= i ? '✔' : '', current.checkedStudents >= i && validated.checkedStudents < i);
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("internships-checkmark".concat(i), current.checkedInternships >= i ? '✔' : '', current.checkedInternships >= i && validated.checkedInternships < i);
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("schools-checkmark".concat(i), current.checkedSchools >= i ? '✔' : '', current.checkedSchools >= i && validated.checkedSchools < i);
        }
        this.setContentAndValidation("students-special", current.specialSchool, current.specialSchool !== validated.specialSchool);
        this.setContentAndValidation("students-subtotal", current.subTotal, current.subTotal !== validated.subTotal);
        this.setContentAndValidation("students-total", current.total, current.total !== validated.total);
    };
    PlayerTable.prototype.updateTouristsScoreSheet = function (current, validated) {
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("tourists-light-checkmark".concat(i), current.checkedMonumentsLight >= i ? '✔' : '', current.checkedMonumentsLight >= i && validated.checkedMonumentsLight < i);
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("tourists-dark-checkmark".concat(i), current.checkedMonumentsDark >= i ? '✔' : '', current.checkedMonumentsDark >= i && validated.checkedMonumentsDark < i);
        }
        this.setContentAndValidation("tourists-specialLight", current.specialMonumentLight, current.specialMonumentLight !== validated.specialMonumentLight);
        this.setContentAndValidation("tourists-specialDark", current.specialMonumentDark, current.specialMonumentDark !== validated.specialMonumentDark);
        this.setContentAndValidation("tourists-specialMax", current.specialMonumentMax, current.specialMonumentMax !== validated.specialMonumentMax);
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 4; i++) {
                this.setContentAndValidation("tourists-checkmark".concat(row, "-").concat(i), current.checkedTourists[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedTourists[row - 1] >= i && validated.checkedTourists[row - 1] < i);
            }
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("tourists-subtotal".concat(i), current.subTotals[i - 1], current.subTotals[i - 1] != validated.subTotals[i - 1]);
        }
        this.setContentAndValidation("tourists-total", current.total, current.total != validated.total);
    };
    PlayerTable.prototype.updateBusinessmenScoreSheet = function (current, validated) {
        this.setContentAndValidation("businessmen-special", current.specialOffice, current.specialOffice !== validated.specialOffice);
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 3; i++) {
                this.setContentAndValidation("businessmen-checkmark".concat(row, "-").concat(i), current.checkedBusinessmen[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedBusinessmen[row - 1] >= i && validated.checkedBusinessmen[row - 1] < i);
            }
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("businessmen-subtotal".concat(i), current.subTotals[i - 1], current.subTotals[i - 1] != validated.subTotals[i - 1]);
        }
        this.setContentAndValidation("businessmen-total", current.total, current.total != validated.total);
    };
    PlayerTable.prototype.updateCommonObjectivesScoreSheet = function (current, validated) {
        for (var i = 1; i <= 2; i++) {
            this.setContentAndValidation("common-objectives-objective".concat(i), current.subTotals[i - 1], current.subTotals[i - 1] != validated.subTotals[i - 1]);
        }
        this.setContentAndValidation("common-objectives-total", current.total, current.total != validated.total);
    };
    PlayerTable.prototype.updatePersonalObjectiveScoreSheet = function (current, validated) {
        this.setContentAndValidation("personal-objective-total", current.total, current.total != validated.total);
    };
    PlayerTable.prototype.updateTurnZonesScoreSheet = function (current, validated) {
        for (var i = 1; i <= 5; i++) {
            this.setContentAndValidation("turn-zones-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        this.setContentAndValidation("turn-zones-total", -current.total, current.total !== validated.total);
    };
    PlayerTable.prototype.updateTrafficJamScoreSheet = function (current, validated) {
        for (var i = 1; i <= 19; i++) {
            this.setContentAndValidation("traffic-jam-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        this.setContentAndValidation("traffic-jam-total", -current.total, current.total !== validated.total);
    };
    return PlayerTable;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game) {
        var _this = this;
        this.game = game;
        // TODO TEMP
        var center = document.getElementById('center');
        dojo.place("<div id=\"departures\"></div>", center);
        Object.keys(game.gamedatas.TODO_TEMP_MAP_POSITIONS).forEach(function (key) {
            var position = Number(key);
            var elements = game.gamedatas.TODO_TEMP_MAP_POSITIONS[position];
            var departure = elements.some(function (element) { return element >= 1 && element <= 12; });
            if (departure) {
                dojo.place("<button id=\"position".concat(position, "-placeDeparturePawn\" class=\"bgabutton bgabutton_blue disabled\">Start at ").concat(position, "</button>"), "departures");
                document.getElementById("position".concat(position, "-placeDeparturePawn")).addEventListener('click', function () { return _this.game.placeDeparturePawn(position); });
            }
        });
        Object.keys(game.gamedatas.MAP_ROUTES).forEach(function (key) {
            var position = Number(key);
            var destinations = game.gamedatas.MAP_ROUTES[position];
            dojo.place("<div id=\"position".concat(position, "\"></div>"), center);
            destinations.forEach(function (destination) {
                var label = '';
                var elements = game.gamedatas.TODO_TEMP_MAP_POSITIONS[position];
                if (elements.some(function (element) { return element == 0; })) {
                    label += '🟢';
                }
                if (elements.some(function (element) { return element == 20; })) {
                    label += '👵';
                }
                if (elements.some(function (element) { return element == 30; })) {
                    label += '🎓';
                }
                if (elements.some(function (element) { return element == 32; })) {
                    label += '🏫';
                }
                if (elements.some(function (element) { return element == 40; })) {
                    label += '🕶';
                }
                if (elements.some(function (element) { return element == 41 || element == 42; })) {
                    label += '🗼';
                }
                if (elements.some(function (element) { return element == 50; })) {
                    label += '🕴';
                }
                if (elements.some(function (element) { return element == 51; })) {
                    label += '🏢';
                }
                if (elements.some(function (element) { return [35, 45, 46, 55].includes(element); })) {
                    label += '★';
                }
                dojo.place("<button id=\"position".concat(position, "-placeRoute-to").concat(destination, "\" class=\"bgabutton bgabutton_blue placeRoute-button disabled\">").concat(label, "</button>"), "position".concat(position));
                //dojo.place(`<button id="position${position}-placeRoute-to${destination}" class="bgabutton bgabutton_blue placeRoute-button disabled">${position} - ${destination}</button>`, `position${position}`);
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
        this.placeFirstPlayerToken(gamedatas.firstPlayerTokenPlayerId);
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
        args.possibleRoutes.forEach(function (route) {
            var min = Math.min(route.from, route.to);
            var max = Math.max(route.from, route.to);
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
                    this.addActionButton("confirmTurn_button", _("Confirm turn"), function () { return _this.confirmTurn(); });
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
            if (playerId === _this.getPlayerId()) {
                dojo.place("<div class=\"personal-objective-wrapper\"><div id=\"panel-board-personal-objective\" class=\"personal-objective\" data-type=\"".concat(player.personalObjective, "\"></div></div>"), "player_board_".concat(player.id));
                _this.addTooltipHtml('panel-board-personal-objective', _("Your personal objective"));
            }
            /*if (eliminated) {
                setTimeout(() => this.eliminatePlayer(playerId), 200);
            }*/
            // first player token
            dojo.place("<div id=\"player_board_".concat(player.id, "_firstPlayerWrapper\" class=\"firstPlayerWrapper\"></div>"), "player_board_".concat(player.id));
        });
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
        var table = new PlayerTable(gamedatas.players[playerId]);
        table.setRound(gamedatas.validatedTickets, gamedatas.currentTicket);
        this.playersTables.push(table);
    };
    /*private getPlayerTable(playerId: number): PlayerTable {
        return this.playerTables.find(playerTable => playerTable.playerId === Number(playerId));
    }*/
    GetOnBoard.prototype.getZoom = function () {
        //return this.tableManager.zoom;
        return 1; // TODO
    };
    GetOnBoard.prototype.placeFirstPlayerToken = function (playerId) {
        var firstPlayerBoardToken = document.getElementById('firstPlayerBoardToken');
        if (firstPlayerBoardToken) {
            slideToObjectAndAttach(this, firstPlayerBoardToken, "player_board_".concat(playerId, "_firstPlayerWrapper"));
        }
        else {
            dojo.place('<div id="firstPlayerBoardToken" class="first-player-token"></div>', "player_board_".concat(playerId, "_firstPlayerWrapper"));
            this.addTooltipHtml('firstPlayerBoardToken', _("Inspector pawn. This player is the first player of the round."));
        }
        var firstPlayerTableToken = document.getElementById('firstPlayerTableToken');
        if (firstPlayerTableToken) {
            slideToObjectAndAttach(this, firstPlayerTableToken, "player-table-".concat(playerId, "-first-player-wrapper"));
        }
        else {
            dojo.place('<div id="firstPlayerTableToken" class="first-player-token"></div>', "player-table-".concat(playerId, "-first-player-wrapper"));
            this.addTooltipHtml('firstPlayerTableToken', _("Inspector pawn. This player is the first player of the round."));
        }
    };
    GetOnBoard.prototype.getPlayerTable = function (playerId) {
        return this.playersTables.find(function (playerTable) { return playerTable.playerId === playerId; });
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
            ['newRound', 1],
            ['newFirstPlayer', ANIMATION_MS],
            ['updateScoreSheet', 1], // TODO TEMP
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    GetOnBoard.prototype.notif_newRound = function (notif) {
        console.log(notif.args);
        this.playersTables.forEach(function (playerTable) { return playerTable.setRound(notif.args.validatedTickets, notif.args.currentTicket); });
    };
    GetOnBoard.prototype.notif_newFirstPlayer = function (notif) {
        this.placeFirstPlayerToken(notif.args.playerId);
    };
    GetOnBoard.prototype.notif_updateScoreSheet = function (notif) {
        var _a;
        var playerId = notif.args.playerId;
        this.getPlayerTable(playerId).updateScoreSheet(notif.args.scoreSheets);
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(notif.args.scoreSheets.current.total);
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
