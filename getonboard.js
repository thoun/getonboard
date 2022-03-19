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
        var deltaX = destinationCR.left - objectCR.left + (posX !== null && posX !== void 0 ? posX : 0);
        var deltaY = destinationCR.top - objectCR.top + (posY !== null && posY !== void 0 ? posY : 0);
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
            object.style.transform = "translate(".concat(deltaX, "px, ").concat(deltaY, "px) rotate(").concat(rotation, "deg)");
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
var PlayerTableBlock = /** @class */ (function () {
    function PlayerTableBlock(playerId) {
        this.playerId = playerId;
        var html = "\n        <div class=\"old-ladies block\">";
        for (var i = 1; i <= 8; i++) {
            html += "\n                <div id=\"player-table-".concat(playerId, "-old-ladies-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>\n            ");
        }
        html += "        \n                    <div id=\"player-table-".concat(playerId, "-old-ladies-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
    }
    PlayerTableBlock.prototype.setContentAndValidation = function (id, content, unvalidated) {
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
    return PlayerTableBlock;
}());
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PlayerTableOldLadiesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableOldLadiesBlock, _super);
    function PlayerTableOldLadiesBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"old-ladies block\" data-zone=\"2\">";
        for (var i = 1; i <= 8; i++) {
            html += "\n                <div id=\"player-table-".concat(playerId, "-old-ladies-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>\n            ");
        }
        html += "        \n                    <div id=\"player-table-".concat(playerId, "-old-ladies-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTableOldLadiesBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.oldLadies;
        var validated = scoreSheets.validated.oldLadies;
        for (var i = 1; i <= 8; i++) {
            this.setContentAndValidation("old-ladies-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        this.setContentAndValidation("old-ladies-total", current.total, current.total !== validated.total);
    };
    return PlayerTableOldLadiesBlock;
}(PlayerTableBlock));
var PlayerTableStudentsBlock = /** @class */ (function (_super) {
    __extends(PlayerTableStudentsBlock, _super);
    function PlayerTableStudentsBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"students block\" data-zone=\"3\">\n                ";
        for (var i = 1; i <= 6; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-students-checkmark").concat(i, "\" class=\"students checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-internships-checkmark").concat(i, "\" class=\"internships checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 4; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-schools-checkmark").concat(i, "\" class=\"schools checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-students-special\" class=\"special\"></div>\n                    <div id=\"player-table-").concat(playerId, "-students-subtotal\" class=\"subtotal\"></div>\n                    <div id=\"player-table-").concat(playerId, "-students-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTableStudentsBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.students;
        var validated = scoreSheets.validated.students;
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
    return PlayerTableStudentsBlock;
}(PlayerTableBlock));
var PlayerTableTouristsBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTouristsBlock, _super);
    function PlayerTableTouristsBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"tourists block\" data-zone=\"4\">";
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-tourists-light-checkmark").concat(i, "\" class=\"monument light checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        for (var i = 1; i <= 3; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-tourists-dark-checkmark").concat(i, "\" class=\"monument dark checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-tourists-specialLight\" class=\"special\" data-style=\"Light\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-specialDark\" class=\"special\" data-style=\"Dark\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-specialMax\" class=\"special\"></div>");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 4; i++) {
                html += "\n                        <div id=\"player-table-".concat(playerId, "-tourists-checkmark").concat(row, "-").concat(i, "\" class=\"tourists checkmark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += " \n                    <div id=\"player-table-".concat(playerId, "-tourists-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(playerId, "-tourists-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTableTouristsBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.tourists;
        var validated = scoreSheets.validated.tourists;
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
    return PlayerTableTouristsBlock;
}(PlayerTableBlock));
var PlayerTableBusinessmenBlock = /** @class */ (function (_super) {
    __extends(PlayerTableBusinessmenBlock, _super);
    function PlayerTableBusinessmenBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"businessmen block\" data-zone=\"5\">\n                    <div id=\"player-table-".concat(playerId, "-businessmen-special\" class=\"special\"></div>");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 3; i++) {
                html += "\n                        <div id=\"player-table-".concat(playerId, "-businessmen-checkmark").concat(row, "-").concat(i, "\" class=\"checkmark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-businessmen-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTableBusinessmenBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.businessmen;
        var validated = scoreSheets.validated.businessmen;
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
    return PlayerTableBusinessmenBlock;
}(PlayerTableBlock));
var PlayerTableCommonObjectivesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableCommonObjectivesBlock, _super);
    function PlayerTableCommonObjectivesBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"common-objectives block\">\n            <div id=\"player-table-".concat(playerId, "-common-objectives-objective1\" class=\"subtotal\" data-number=\"1\"></div>\n            <div id=\"player-table-").concat(playerId, "-common-objectives-objective2\" class=\"subtotal\" data-number=\"2\"></div>\n            <div id=\"player-table-").concat(playerId, "-common-objectives-total\" class=\"total\"></div>\n        </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTableCommonObjectivesBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.commonObjectives;
        var validated = scoreSheets.validated.commonObjectives;
        for (var i = 1; i <= 2; i++) {
            this.setContentAndValidation("common-objectives-objective".concat(i), current.subTotals[i - 1], current.subTotals[i - 1] != validated.subTotals[i - 1]);
        }
        this.setContentAndValidation("common-objectives-total", current.total, current.total != validated.total);
    };
    return PlayerTableCommonObjectivesBlock;
}(PlayerTableBlock));
var PlayerTablePersonalObjectiveBlock = /** @class */ (function (_super) {
    __extends(PlayerTablePersonalObjectiveBlock, _super);
    function PlayerTablePersonalObjectiveBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"personal-objective block\">\n            <div id=\"player-table-".concat(playerId, "-personal-objective-total\" class=\"total\"></div>\n        </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTablePersonalObjectiveBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.personalObjective;
        var validated = scoreSheets.validated.personalObjective;
        this.setContentAndValidation("personal-objective-total", current.total, current.total != validated.total);
    };
    return PlayerTablePersonalObjectiveBlock;
}(PlayerTableBlock));
var PlayerTableTurnZonesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTurnZonesBlock, _super);
    function PlayerTableTurnZonesBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"turn-zones block\" data-zone=\"6\">";
        for (var i = 1; i <= 5; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-turn-zones-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-turn-zones-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTableTurnZonesBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.turnZones;
        var validated = scoreSheets.validated.turnZones;
        for (var i = 1; i <= 5; i++) {
            this.setContentAndValidation("turn-zones-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        this.setContentAndValidation("turn-zones-total", -current.total, current.total !== validated.total);
    };
    return PlayerTableTurnZonesBlock;
}(PlayerTableBlock));
var PlayerTableTrafficJamBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTrafficJamBlock, _super);
    function PlayerTableTrafficJamBlock(playerId, scoreSheets) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div class=\"traffic-jam block\" data-zone=\"7\">";
        for (var i = 1; i <= 19; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-traffic-jam-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-traffic-jam-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets);
        return _this;
    }
    PlayerTableTrafficJamBlock.prototype.updateScoreSheet = function (scoreSheets) {
        var current = scoreSheets.current.trafficJam;
        var validated = scoreSheets.validated.trafficJam;
        for (var i = 1; i <= 19; i++) {
            this.setContentAndValidation("traffic-jam-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        this.setContentAndValidation("traffic-jam-total", -current.total, current.total !== validated.total);
    };
    return PlayerTableTrafficJamBlock;
}(PlayerTableBlock));
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PlayerTable = /** @class */ (function () {
    function PlayerTable(player, insertIn) {
        if (insertIn === void 0) { insertIn = 'player-tables'; }
        this.playerId = player.id;
        var eliminated = Number(player.eliminated) > 0;
        var html = "\n        <div id=\"player-table-".concat(player.id, "\" class=\"player-table ").concat(eliminated ? 'eliminated' : '', "\" style=\"box-shadow: 0 0 3px 3px #").concat(player.color, ";\">\n            <div id=\"player-table-").concat(player.id, "-top\" class=\"top\" data-type=\"").concat(player.sheetType, "\">\n            ");
        for (var i = 1; i <= 12; i++) {
            html += "\n                    <div id=\"player-table-".concat(player.id, "-top-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += " \n            </div>\n            <div id=\"player-table-".concat(player.id, "-main\" class=\"main\">\n                <div id=\"player-table-").concat(player.id, "-total-score\" class=\"total score\"></div>\n            </div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</div>\n            <div id=\"player-table-").concat(player.id, "-first-player-wrapper\" class=\"first-player-wrapper\"></div>\n        </div>\n        ");
        dojo.place(html, insertIn);
        this.oldLadies = new PlayerTableOldLadiesBlock(this.playerId, player.scoreSheets);
        this.students = new PlayerTableStudentsBlock(this.playerId, player.scoreSheets);
        this.tourists = new PlayerTableTouristsBlock(this.playerId, player.scoreSheets);
        this.businessmen = new PlayerTableBusinessmenBlock(this.playerId, player.scoreSheets);
        this.commonObjectives = new PlayerTableCommonObjectivesBlock(this.playerId, player.scoreSheets);
        this.personalObjective = new PlayerTablePersonalObjectiveBlock(this.playerId, player.scoreSheets);
        this.turnZones = new PlayerTableTurnZonesBlock(this.playerId, player.scoreSheets);
        this.trafficJam = new PlayerTableTrafficJamBlock(this.playerId, player.scoreSheets);
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
        this.oldLadies.updateScoreSheet(scoreSheets);
        this.students.updateScoreSheet(scoreSheets);
        this.tourists.updateScoreSheet(scoreSheets);
        this.businessmen.updateScoreSheet(scoreSheets);
        this.commonObjectives.updateScoreSheet(scoreSheets);
        this.personalObjective.updateScoreSheet(scoreSheets);
        this.turnZones.updateScoreSheet(scoreSheets);
        this.trafficJam.updateScoreSheet(scoreSheets);
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
    return PlayerTable;
}());
var TableCenter = /** @class */ (function () {
    function TableCenter(game, gamedatas) {
        var _this = this;
        this.game = game;
        this.gamedatas = gamedatas;
        var map = document.getElementById('map');
        map.dataset.size = gamedatas.map;
        var mapElements = document.getElementById('map-elements');
        // intersections
        Object.keys(gamedatas.MAP_POSITIONS).forEach(function (key) {
            var position = Number(key);
            var elements = gamedatas.MAP_POSITIONS[position];
            var departure = elements.find(function (element) { return element >= 1 && element <= 12; });
            var coordinates = _this.getCoordinatesFromPosition(position);
            var html = "<div id=\"intersection".concat(position, "\" class=\"intersection");
            if (departure > 0) {
                html += " departure\" data-departure=".concat(departure);
            }
            html += "\" style=\"top: ".concat(coordinates[0], "px; left: ").concat(coordinates[1], "px;\"></div>");
            dojo.place(html, mapElements);
            if (departure > 0) {
                document.getElementById("intersection".concat(position)).addEventListener('click', function () { return _this.game.placeDeparturePawn(position); });
            }
        });
        // routes
        Object.keys(gamedatas.MAP_ROUTES).forEach(function (key) {
            var position = Number(key);
            var destinations = gamedatas.MAP_ROUTES[position];
            destinations.forEach(function (destination) {
                var coordinates = _this.getCoordinatesFromPositions(position, destination);
                var html = "<div id=\"route".concat(position, "-").concat(destination, "\" class=\"route\" style=\"top: ").concat(coordinates[0], "px; left: ").concat(coordinates[1], "px;\" data-direction=\"").concat(Math.abs(position - destination) <= 1 ? 0 : 1, "\"></div>");
                dojo.place(html, mapElements);
                document.getElementById("route".concat(position, "-").concat(destination)).addEventListener('click', function () { return _this.game.placeRoute(position, destination); });
            });
        });
        // departure pawns
        Object.values(gamedatas.players).filter(function (player) { return player.departurePosition; }).forEach(function (player) { return _this.addDeparturePawn(Number(player.id), player.departurePosition); });
        // markers
        Object.values(gamedatas.players).forEach(function (player) { return player.markers.forEach(function (marker) { return _this.addMarker(Number(player.id), marker); }); });
    }
    TableCenter.prototype.addDeparturePawn = function (playerId, position) {
        dojo.place("<div id=\"departure-pawn-".concat(playerId, "\" class=\"departure-pawn\" style=\"background: #").concat(this.game.getPlayerColor(playerId), ";\"></div>"), "intersection".concat(position));
    };
    TableCenter.prototype.addMarker = function (playerId, marker) {
        var _a;
        var min = Math.min(marker.from, marker.to);
        var max = Math.max(marker.from, marker.to);
        dojo.place("<div id=\"marker-".concat(playerId, "-").concat(min, "-").concat(max, "\" class=\"marker ").concat(marker.validated ? '' : 'unvalidated', "\" style=\"background: #").concat(this.game.getPlayerColor(playerId), ";\"></div>"), "route".concat(min, "-").concat(max));
        var ghost = document.getElementById("ghost-marker-".concat(min, "-").concat(max));
        (_a = ghost === null || ghost === void 0 ? void 0 : ghost.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(ghost);
    };
    TableCenter.prototype.setMarkerValidated = function (playerId, marker) {
        var min = Math.min(marker.from, marker.to);
        var max = Math.max(marker.from, marker.to);
        document.getElementById("marker-".concat(playerId, "-").concat(min, "-").concat(max)).classList.remove('unvalidated');
    };
    TableCenter.prototype.removeMarker = function (playerId, marker) {
        var min = Math.min(marker.from, marker.to);
        var max = Math.max(marker.from, marker.to);
        var div = document.getElementById("marker-".concat(playerId, "-").concat(min, "-").concat(max));
        div === null || div === void 0 ? void 0 : div.parentElement.removeChild(div);
    };
    TableCenter.prototype.addGhostMarker = function (route) {
        var min = Math.min(route.from, route.to);
        var max = Math.max(route.from, route.to);
        var ghostClass = '';
        if (route.isElimination) {
            ghostClass = 'elimination';
        }
        else if (route.useTurnZone) {
            ghostClass = 'turn-zone';
        }
        else if (route.trafficJam > 0) {
            ghostClass = 'traffic-jam';
        }
        dojo.place("<div id=\"ghost-marker-".concat(min, "-").concat(max, "\" class=\"ghost marker ").concat(ghostClass, "\"></div>"), "route".concat(min, "-").concat(max));
    };
    TableCenter.prototype.removeGhostMarkers = function () {
        Array.from(document.getElementsByClassName('ghost')).forEach(function (element) { var _a; return (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element); });
    };
    TableCenter.prototype.getCoordinatesFromNumberAndDigit = function (number, digit) {
        if (this.gamedatas.map === 'big') {
            var space = 65;
            return [
                165 + space * digit,
                26 + space * number,
            ];
        }
        else if (this.gamedatas.map === 'small') {
            var space = 60;
            return [
                28 + space * number,
                196 + space * digit,
            ];
        }
    };
    TableCenter.prototype.getCoordinatesFromPosition = function (position) {
        var number = Math.floor(position / 10) - 1;
        var digit = (position % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit(number, digit);
    };
    TableCenter.prototype.getCoordinatesFromPositions = function (from, to) {
        var fromNumber = Math.floor(from / 10) - 1;
        var fromDigit = (from % 10) - 1;
        var toNumber = Math.floor(to / 10) - 1;
        var toDigit = (to % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit((fromNumber + toNumber) / 2, (fromDigit + toDigit) / 2);
    };
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
/*define('OLD_LADY', 20);

define('STUDENT', 30);
define('INTERNSHIP', 31);
define('SCHOOL', 32);
define('SCHOOL_SPECIAL', 35);

define('TOURIST', 40);
define('MONUMENT_LIGHT', 41);
define('MONUMENT_DARK', 42);
define('MONUMENT_LIGHT_SPECIAL', 45);
define('MONUMENT_DARK_SPECIAL', 46);

define('BUSINESSMAN', 50);
define('OFFICE', 51);
define('OFFICE_SPECIAL', 55);

define('TURN_ZONES', 60);
define('TRAFFIC_JAM', 70);*/
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
            this.dontPreloadImage("map-small.jpg");
        }
        else {
            this.dontPreloadImage("map-big.jpg");
        }
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.placeFirstPlayerToken(gamedatas.firstPlayerTokenPlayerId);
        this.setupNotifications();
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
        var _this = this;
        if (this.isCurrentPlayerActive()) {
            args.possibleRoutes.forEach(function (route) { return _this.tableCenter.addGhostMarker(route); });
        }
    };
    GetOnBoard.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'placeDeparturePawn':
                this.onLeavingPlaceDeparturePawn();
                break;
            case 'placeRoute':
                this.onLeavingPlaceRoute();
                break;
        }
    };
    GetOnBoard.prototype.onLeavingPlaceDeparturePawn = function () {
        Array.from(document.getElementsByClassName('intersection')).forEach(function (element) { return element.classList.remove('selectable'); });
    };
    GetOnBoard.prototype.onLeavingPlaceRoute = function () {
        if (this.isCurrentPlayerActive()) {
            this.tableCenter.removeGhostMarkers();
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
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeDeparturePawn':
                    var placeDeparturePawnArgs = args;
                    placeDeparturePawnArgs._private.positions.forEach(function (position) {
                        return document.getElementById("intersection".concat(position)).classList.add('selectable');
                    });
                    break;
                case 'placeRoute':
                    this.addActionButton("confirmTurn_button", _("Confirm turn"), function () { return _this.confirmTurn(); });
                    var placeRouteArgs = args;
                    if (placeRouteArgs.canConfirm) {
                        this.startActionTimer("confirmTurn_button", 5);
                    }
                    else {
                        dojo.addClass("confirmTurn_button", "disabled");
                    }
                    this.addActionButton("cancelLast_button", _("Cancel last marker"), function () { return _this.cancelLast(); }, null, null, 'gray');
                    this.addActionButton("resetTurn_button", _("Reset the whole turn"), function () { return _this.resetTurn(); }, null, null, 'gray');
                    if (!placeRouteArgs.canCancel) {
                        dojo.addClass("cancelLast_button", "disabled");
                        dojo.addClass("resetTurn_button", "disabled");
                    }
                    break;
            }
        }
        else {
            this.onLeavingPlaceDeparturePawn();
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    GetOnBoard.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    GetOnBoard.prototype.getPlayerColor = function (playerId) {
        return this.gamedatas.players[playerId].color;
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
            if (eliminated) {
                setTimeout(function () { return _this.eliminatePlayer(playerId); }, 200);
            }
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
        return this.playersTables.find(function (playerTable) { return Number(playerTable.playerId) === playerId; });
    };
    GetOnBoard.prototype.eliminatePlayer = function (playerId) {
        this.gamedatas.players[playerId].eliminated = 1;
        document.getElementById("overall_player_board_".concat(playerId)).classList.add('eliminated-player');
        dojo.addClass("player-table-".concat(playerId), 'eliminated');
    };
    GetOnBoard.prototype.showZone = function (playerId, zone) {
        dojo.place("<div class=\"pip\" id=\"pip-".concat(playerId, "-").concat(zone, "\"></div>"), 'pips');
        new PlayerTable(this.gamedatas.players[playerId], "pip-".concat(playerId, "-").concat(zone));
        var pipDiv = document.getElementById("pip-".concat(playerId, "-").concat(zone));
        var zoneDiv = pipDiv.querySelector("[data-zone=\"".concat(zone, "\"]"));
        var zoneStyle = window.getComputedStyle(zoneDiv);
        pipDiv.style.width = zoneStyle.width;
        pipDiv.style.height = zoneStyle.height;
        pipDiv.scrollTo(Number(zoneStyle.left.match(/\d+/)[0]), 77 + Number(zoneStyle.top.match(/\d+/)[0]));
        setTimeout(function () { var _a; return (_a = pipDiv.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(pipDiv); }, 2000);
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
        var _this = this;
        if (!this.checkAction('placeRoute')) {
            return;
        }
        var args = this.gamedatas.gamestate.args;
        var route = args.possibleRoutes.find(function (r) { return (r.from === from && r.to === to) || (r.from === to && r.to === from); });
        var eliminationWarning = route.isElimination && args.possibleRoutes.some(function (r) { return !r.isElimination; });
        if (eliminationWarning) {
            this.confirmationDialog(_('Are you sure you want to place that marker? You will be eliminated!'), function () {
                _this.takeAction('placeRoute', {
                    from: from,
                    to: to,
                });
            });
        }
        else {
            this.takeAction('placeRoute', {
                from: from,
                to: to,
            });
        }
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
        if (Number((_a = this.prefs[202]) === null || _a === void 0 ? void 0 : _a.value) === 2) {
            return;
        }
        var button = document.getElementById(buttonId);
        var actionTimerId = null;
        var _actionTimerLabel = button.innerHTML;
        var _actionTimerSeconds = time;
        var actionTimerFunction = function () {
            var button = document.getElementById(buttonId);
            if (button == null || button.classList.contains('disabled')) {
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
            ['placedRoute', ANIMATION_MS],
            ['confirmTurn', ANIMATION_MS],
            ['flipObjective', ANIMATION_MS],
            ['placedDeparturePawn', 1],
            ['removeMarkers', 1],
            ['updateScoreSheet', 1],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    GetOnBoard.prototype.notif_newRound = function (notif) {
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
    GetOnBoard.prototype.notif_placedDeparturePawn = function (notif) {
        this.tableCenter.addDeparturePawn(notif.args.playerId, notif.args.position);
    };
    GetOnBoard.prototype.notif_placedRoute = function (notif) {
        var _this = this;
        var playerId = notif.args.playerId;
        this.tableCenter.addMarker(playerId, notif.args.marker);
        notif.args.zones.forEach(function (zone) { return _this.showZone(playerId, zone); });
    };
    GetOnBoard.prototype.notif_confirmTurn = function (notif) {
        var _this = this;
        notif.args.markers.forEach(function (marker) { return _this.tableCenter.setMarkerValidated(notif.args.playerId, marker); });
    };
    GetOnBoard.prototype.notif_removeMarkers = function (notif) {
        var _this = this;
        notif.args.markers.forEach(function (marker) { return _this.tableCenter.removeMarker(notif.args.playerId, marker); });
    };
    GetOnBoard.prototype.notif_playerEliminated = function (notif) {
        var _a;
        var playerId = Number(notif.args.who_quits);
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(0);
        this.eliminatePlayer(playerId);
    };
    GetOnBoard.prototype.notif_flipObjective = function (notif) {
        // TODO flip card
        console.log('flipObjective', notif.args.objective);
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    GetOnBoard.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                if (args.shape && args.shape[0] != '<') {
                    args.shape = "<div class=\"shape\" data-shape=\"".concat(JSON.stringify(args.shape), "\" data-step=\"").concat(args.step, "\"></div>");
                }
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
