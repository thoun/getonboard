function slideToObjectAndAttach(game, object, destinationId, zoom) {
    if (zoom === void 0) { zoom = 1; }
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var objectCR = object.getBoundingClientRect();
        var destinationCR = destination.getBoundingClientRect();
        var deltaX = destinationCR.left - objectCR.left;
        var deltaY = destinationCR.top - objectCR.top;
        var attachToNewParent = function () {
            object.style.top = 'unset';
            object.style.left = 'unset';
            object.style.position = 'relative';
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        };
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        }
        else {
            object.style.transition = "transform 0.5s ease-in";
            object.style.transform = "translate(".concat(deltaX / zoom, "px, ").concat(deltaY / zoom, "px)");
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
function slideToObjectTicketSlot2(game, object, destinationId, keepTransform) {
    var destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
        var originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        var slot1left = Number(window.getComputedStyle(document.getElementById('ticket-slot-1')).left.match(/\d+/)[0]);
        var slot2left = Number(window.getComputedStyle(document.getElementById('ticket-slot-2')).left.match(/\d+/)[0]);
        var deltaX = slot2left - slot1left;
        var attachToNewParent = function () {
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = keepTransform !== null && keepTransform !== void 0 ? keepTransform : 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        };
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        }
        else {
            object.style.transition = "transform 0.5s ease-in";
            object.style.transform = "translateX(".concat(deltaX, "px) ").concat(keepTransform !== null && keepTransform !== void 0 ? keepTransform : '');
            var securityTimeoutId_2 = null;
            var transitionend_2 = function () {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend_2);
                object.removeEventListener('transitioncancel', transitionend_2);
                resolve(true);
                if (securityTimeoutId_2) {
                    clearTimeout(securityTimeoutId_2);
                }
            };
            object.addEventListener('transitionend', transitionend_2);
            object.addEventListener('transitioncancel', transitionend_2);
            // security check : if transition fails, we force tile to destination
            securityTimeoutId_2 = setTimeout(function () {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend_2);
                    object.removeEventListener('transitioncancel', transitionend_2);
                    resolve(true);
                }
            }, 700);
        }
    });
}
var PlayerTableBlock = /** @class */ (function () {
    function PlayerTableBlock(playerId) {
        this.playerId = playerId;
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
    function PlayerTableOldLadiesBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"old-ladies-block-".concat(playerId, "\" data-tooltip=\"[20]\" class=\"old-ladies block\" data-zone=\"2\">");
        for (var i = 1; i <= 8; i++) {
            html += "\n                <div id=\"player-table-".concat(playerId, "-old-ladies-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>\n            ");
        }
        html += "        \n                    <div id=\"player-table-".concat(playerId, "-old-ladies-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableOldLadiesBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.oldLadies;
        var validated = scoreSheets.validated.oldLadies;
        for (var i = 1; i <= 8; i++) {
            this.setContentAndValidation("old-ladies-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation("old-ladies-total", current.total, current.total !== validated.total);
        }
    };
    return PlayerTableOldLadiesBlock;
}(PlayerTableBlock));
var PlayerTableStudentsBlock = /** @class */ (function (_super) {
    __extends(PlayerTableStudentsBlock, _super);
    function PlayerTableStudentsBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"students-block-".concat(playerId, "\" data-tooltip=\"[30,32]\" class=\"students block\" data-zone=\"3\">\n                ");
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
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableStudentsBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.students;
        var validated = scoreSheets.validated.students;
        for (var i = 1; i <= 6; i++) {
            this.setContentAndValidation("students-checkmark".concat(i), current.checkedStudents >= i ? '✔' : '', current.checkedStudents >= i && validated.checkedStudents < i);
        }
        for (var i = 1; i <= 3; i++) {
            this.setContentAndValidation("internships-checkmark".concat(i), current.checkedInternships >= i ? '✔' : '', current.checkedInternships >= i && validated.checkedInternships < i);
        }
        for (var i = 1; i <= 4; i++) {
            this.setContentAndValidation("schools-checkmark".concat(i), current.checkedSchools >= i ? '✔' : '', current.checkedSchools >= i && validated.checkedSchools < i);
        }
        this.setContentAndValidation("students-special", current.specialSchool, current.specialSchool !== validated.specialSchool);
        if (visibleScoring) {
            this.setContentAndValidation("students-subtotal", current.subTotal, current.subTotal !== validated.subTotal);
            this.setContentAndValidation("students-total", current.total, current.total !== validated.total);
        }
    };
    return PlayerTableStudentsBlock;
}(PlayerTableBlock));
var PlayerTableTouristsBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTouristsBlock, _super);
    function PlayerTableTouristsBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"tourists-block-".concat(playerId, "\" data-tooltip=\"[40,41]\" class=\"tourists block\" data-zone=\"4\">");
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
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableTouristsBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
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
        if (visibleScoring) {
            this.setContentAndValidation("tourists-specialMax", current.specialMonumentMax, current.specialMonumentMax !== validated.specialMonumentMax);
        }
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 4; i++) {
                this.setContentAndValidation("tourists-checkmark".concat(row, "-").concat(i), current.checkedTourists[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedTourists[row - 1] >= i && validated.checkedTourists[row - 1] < i);
            }
            this.setContentAndValidation("tourists-subtotal".concat(row), current.subTotals[row - 1], current.subTotals[row - 1] != validated.subTotals[row - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation("tourists-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTableTouristsBlock;
}(PlayerTableBlock));
var PlayerTableBusinessmenBlock = /** @class */ (function (_super) {
    __extends(PlayerTableBusinessmenBlock, _super);
    function PlayerTableBusinessmenBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"businessmen-block-".concat(playerId, "\" data-tooltip=\"[50,51]\" class=\"businessmen block\" data-zone=\"5\">\n                    <div id=\"player-table-").concat(playerId, "-businessmen-special\" class=\"special\"></div>");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 3; i++) {
                html += "\n                        <div id=\"player-table-".concat(playerId, "-businessmen-checkmark").concat(row, "-").concat(i, "\" class=\"checkmark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-businessmen-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(playerId, "-businessmen-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableBusinessmenBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.businessmen;
        var validated = scoreSheets.validated.businessmen;
        this.setContentAndValidation("businessmen-special", current.specialOffice, current.specialOffice !== validated.specialOffice);
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 3; i++) {
                this.setContentAndValidation("businessmen-checkmark".concat(row, "-").concat(i), current.checkedBusinessmen[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedBusinessmen[row - 1] >= i && validated.checkedBusinessmen[row - 1] < i);
            }
            this.setContentAndValidation("businessmen-subtotal".concat(row), current.subTotals[row - 1], current.subTotals[row - 1] != validated.subTotals[row - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation("businessmen-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTableBusinessmenBlock;
}(PlayerTableBlock));
var PlayerTableCommonObjectivesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableCommonObjectivesBlock, _super);
    function PlayerTableCommonObjectivesBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"common-objectives-block-".concat(playerId, "\" data-tooltip=\"[90]\" class=\"common-objectives block\">\n            <div id=\"player-table-").concat(playerId, "-common-objectives-objective1\" class=\"subtotal\" data-number=\"1\"></div>\n            <div id=\"player-table-").concat(playerId, "-common-objectives-objective2\" class=\"subtotal\" data-number=\"2\"></div>\n            <div id=\"player-table-").concat(playerId, "-common-objectives-total\" class=\"total\"></div>\n        </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableCommonObjectivesBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.commonObjectives;
        var validated = scoreSheets.validated.commonObjectives;
        for (var i = 1; i <= 2; i++) {
            this.setContentAndValidation("common-objectives-objective".concat(i), current.subTotals[i - 1], current.subTotals[i - 1] != validated.subTotals[i - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation("common-objectives-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTableCommonObjectivesBlock;
}(PlayerTableBlock));
var PlayerTablePersonalObjectiveBlock = /** @class */ (function (_super) {
    __extends(PlayerTablePersonalObjectiveBlock, _super);
    function PlayerTablePersonalObjectiveBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"personal-objective-block-".concat(playerId, "\" data-tooltip=\"[91]\" class=\"personal-objective block\">\n            <div id=\"player-table-").concat(playerId, "-personal-objective-total\" class=\"total\"></div>\n        </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTablePersonalObjectiveBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.personalObjective;
        var validated = scoreSheets.validated.personalObjective;
        if (visibleScoring) {
            this.setContentAndValidation("personal-objective-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTablePersonalObjectiveBlock;
}(PlayerTableBlock));
var PlayerTableTurnZonesBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTurnZonesBlock, _super);
    function PlayerTableTurnZonesBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"turn-zones-block-".concat(playerId, "\" data-tooltip=\"[92]\" class=\"turn-zones block\" data-zone=\"6\">");
        for (var i = 1; i <= 5; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-turn-zones-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-turn-zones-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableTurnZonesBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.turnZones;
        var validated = scoreSheets.validated.turnZones;
        for (var i = 1; i <= 5; i++) {
            this.setContentAndValidation("turn-zones-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation("turn-zones-total", -current.total, current.total !== validated.total);
        }
    };
    return PlayerTableTurnZonesBlock;
}(PlayerTableBlock));
var PlayerTableTrafficJamBlock = /** @class */ (function (_super) {
    __extends(PlayerTableTrafficJamBlock, _super);
    function PlayerTableTrafficJamBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"traffic-jam-block-".concat(playerId, "\" data-tooltip=\"[93]\" class=\"traffic-jam block\" data-zone=\"7\">");
        for (var i = 1; i <= 19; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-traffic-jam-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-traffic-jam-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableTrafficJamBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.trafficJam;
        var validated = scoreSheets.validated.trafficJam;
        for (var i = 1; i <= 19; i++) {
            this.setContentAndValidation("traffic-jam-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation("traffic-jam-total", -current.total, current.total !== validated.total);
        }
    };
    return PlayerTableTrafficJamBlock;
}(PlayerTableBlock));
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
;
var log = isDebug ? console.log.bind(window.console) : function () { };
var PlayerTable = /** @class */ (function () {
    function PlayerTable(game, player, id, insertIn) {
        if (id === void 0) { id = player.id; }
        if (insertIn === void 0) { insertIn = document.getElementById('full-table'); }
        this.playerId = id;
        var eliminated = Number(player.eliminated) > 0;
        var html = "\n        <div id=\"player-table-".concat(this.playerId, "\" class=\"player-table ").concat(eliminated ? 'eliminated' : '', "\" style=\"box-shadow: 0 0 3px 3px #").concat(player.color, ";\">\n            <div id=\"player-table-").concat(this.playerId, "-top\" data-tooltip=\"[95]\" class=\"top\" data-type=\"").concat(player.sheetType, "\">\n            ");
        for (var i = 1; i <= 12; i++) {
            html += "\n                    <div id=\"player-table-".concat(this.playerId, "-top-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += " \n            </div>\n            <div id=\"player-table-".concat(this.playerId, "-main\" class=\"main\">\n                <div id=\"player-table-").concat(this.playerId, "-total-score\" data-tooltip=\"[94]\" class=\"total score\"></div>\n            </div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</div>\n            <div id=\"player-table-").concat(this.playerId, "-first-player-wrapper\" class=\"first-player-wrapper\"></div>\n        </div>\n        ");
        dojo.place(html, insertIn);
        this.oldLadies = new PlayerTableOldLadiesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.students = new PlayerTableStudentsBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.tourists = new PlayerTableTouristsBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.businessmen = new PlayerTableBusinessmenBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.commonObjectives = new PlayerTableCommonObjectivesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.personalObjective = new PlayerTablePersonalObjectiveBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.turnZones = new PlayerTableTurnZonesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.trafficJam = new PlayerTableTrafficJamBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.updateScoreSheet(player.scoreSheets, game.isVisibleScoring());
    }
    PlayerTable.prototype.setRound = function (validatedTickets, currentTicket) {
        if (!currentTicket) {
            return;
        }
        for (var i = 1; i <= 12; i++) {
            this.setContentAndValidation("top-checkmark".concat(i), currentTicket === i || validatedTickets.includes(i) ? '✔' : '', currentTicket === i);
        }
    };
    PlayerTable.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        this.oldLadies.updateScoreSheet(scoreSheets, visibleScoring);
        this.students.updateScoreSheet(scoreSheets, visibleScoring);
        this.tourists.updateScoreSheet(scoreSheets, visibleScoring);
        this.businessmen.updateScoreSheet(scoreSheets, visibleScoring);
        this.commonObjectives.updateScoreSheet(scoreSheets, visibleScoring);
        this.personalObjective.updateScoreSheet(scoreSheets, visibleScoring);
        this.turnZones.updateScoreSheet(scoreSheets, visibleScoring);
        this.trafficJam.updateScoreSheet(scoreSheets, visibleScoring);
        if (visibleScoring) {
            this.setContentAndValidation("total-score", scoreSheets.current.total, scoreSheets.current.total != scoreSheets.validated.total);
        }
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
            var tooltipsIds = [];
            if (elements.includes(0)) {
                tooltipsIds.push(0);
            }
            if (elements.some(function (element) { return element >= 1 && element <= 12; })) {
                tooltipsIds.push(1);
            }
            if (elements.includes(20)) {
                tooltipsIds.push(20);
            }
            if (elements.includes(30)) {
                tooltipsIds.push(30);
            }
            if (elements.includes(32)) {
                tooltipsIds.push(32);
            }
            if (elements.includes(40)) {
                tooltipsIds.push(40);
            }
            if (elements.includes(41) || elements.includes(42)) {
                tooltipsIds.push(41);
            }
            if (elements.includes(50)) {
                tooltipsIds.push(50);
            }
            if (elements.includes(51)) {
                tooltipsIds.push(51);
            }
            if (elements.some(function (element) { return element >= 97 && element <= 122; })) {
                tooltipsIds.push(97);
            }
            var departure = elements.find(function (element) { return element >= 1 && element <= 12; });
            var coordinates = _this.getCoordinatesFromPosition(position);
            var html = "<div id=\"intersection".concat(position, "\" class=\"intersection ").concat(elements.some(function (element) { return element == 0; }) ? 'green-light' : '');
            if (departure > 0) {
                html += " departure\" data-departure=".concat(departure);
            }
            html += "\" data-tooltip=\"".concat(JSON.stringify(tooltipsIds), "\" style=\"left: ").concat(coordinates[0], "px; top: ").concat(coordinates[1], "px;\"></div>");
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
                var html = "<div id=\"route".concat(position, "-").concat(destination, "\" class=\"route\" style=\"left: ").concat(coordinates[0], "px; top: ").concat(coordinates[1], "px;\" data-direction=\"").concat(Math.abs(position - destination) <= 1 ? 0 : 1, "\"></div>");
                dojo.place(html, mapElements);
                document.getElementById("route".concat(position, "-").concat(destination)).addEventListener('click', function () { return _this.game.placeRoute(position, destination); });
            });
        });
        // departure pawns
        Object.values(gamedatas.players).filter(function (player) { return player.departurePosition; }).forEach(function (player) { return _this.addDeparturePawn(Number(player.id), player.departurePosition); });
        // markers
        Object.values(gamedatas.players).forEach(function (player) { return player.markers.forEach(function (marker) { return _this.addMarker(Number(player.id), marker); }); });
        // common objectives
        gamedatas.commonObjectives.forEach(function (commonObjective) { return _this.placeCommonObjective(commonObjective); });
        // personal objective
        var currentPlayer = gamedatas.players[this.game.getPlayerId()];
        //Object.keys(gamedatas.MAP_POSITIONS).filter(key => gamedatas.MAP_POSITIONS[key].some(element => element >= 97 && element <= 122)).forEach(position =>
        currentPlayer === null || currentPlayer === void 0 ? void 0 : currentPlayer.personalObjectivePositions.forEach(function (position) {
            return dojo.place("<div class=\"objective-letter\" style=\"box-shadow: 0 0 5px 5px #".concat(currentPlayer.color, ";\" data-position=\"").concat(position, "\"></div>"), "intersection".concat(position));
        });
        // tickets
        this.setRound(gamedatas.validatedTickets, gamedatas.currentTicket, true);
    }
    TableCenter.prototype.addDeparturePawn = function (playerId, position) {
        dojo.place("<div id=\"departure-pawn-".concat(playerId, "\" class=\"departure-pawn\"></div>"), "intersection".concat(position));
        document.getElementById("departure-pawn-".concat(playerId)).style.setProperty('--background', "#".concat(this.game.getPlayerColor(playerId)));
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
            var space = 63.2;
            return [
                38 + space * number,
                179 + space * digit,
            ];
        }
        else if (this.gamedatas.map === 'small') {
            var space = 57.4;
            return [
                213 + space * digit,
                20 + space * number,
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
    TableCenter.prototype.getSide = function (position) {
        if (this.gamedatas.map === 'big') {
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        }
        else if (this.gamedatas.map === 'small') {
            // TODO handle angle
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        }
    };
    TableCenter.prototype.placeCommonObjective = function (objective) {
        dojo.place("<div id=\"common-objective-".concat(objective.id, "\" class=\"common-objective card-inner\" data-side=\"").concat(objective.completed ? '1' : '0', "\">\n            <div class=\"card-side front\"></div>\n            <div class=\"card-side back\"></div>\n        </div>"), "common-objective-slot-".concat(objective.number));
    };
    TableCenter.prototype.setRound = function (validatedTickets, currentTicket, initialization) {
        if (initialization === void 0) { initialization = false; }
        var roundNumber = Math.min(12, validatedTickets.length + (!currentTicket ? 0 : 1));
        if (initialization) {
            for (var i = 1; i <= 12; i++) {
                var visible = i <= roundNumber;
                dojo.place("<div id=\"ticket-".concat(i, "\" class=\"ticket card-inner\" data-side=\"").concat(visible ? '1' : '0', "\" data-ticket=\"").concat(i === roundNumber ? currentTicket : 0, "\">\n                    <div class=\"card-side front\"></div>\n                    <div class=\"card-side back\"></div>\n                </div>"), "ticket-slot-".concat(visible ? 2 : 1));
            }
        }
        else {
            var roundTicketDiv = document.getElementById("ticket-".concat(roundNumber));
            roundTicketDiv.dataset.ticket = "".concat(currentTicket);
            slideToObjectTicketSlot2(this.game, roundTicketDiv, "ticket-slot-2", "rotateY(180deg)");
            roundTicketDiv.dataset.side = "1";
        }
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
var ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1];
var ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0];
var LOCAL_STORAGE_ZOOM_KEY = 'GetOnBoard-zoom';
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[GreenLight\]/ig, '<div class="map-icon" data-element="0"></div>')
        .replace(/\[OldLady\]/ig, '<div class="map-icon" data-element="20"></div>')
        .replace(/\[Student\]/ig, '<div class="map-icon" data-element="30"></div>')
        .replace(/\[School\]/ig, '<div class="map-icon" data-element="32"></div>')
        .replace(/\[Tourist\]/ig, '<div class="map-icon" data-element="40"></div>')
        .replace(/\[MonumentLight\]/ig, '<div class="map-icon" data-element="41"></div>')
        .replace(/\[MonumentDark\]/ig, '<div class="map-icon" data-element="42"></div>')
        .replace(/\[Businessman\]/ig, '<div class="map-icon" data-element="50"></div>')
        .replace(/\[Office\]/ig, '<div class="map-icon" data-element="51"></div>');
}
var GetOnBoard = /** @class */ (function () {
    function GetOnBoard() {
        this.zoom = 1;
        this.playersTables = [];
        this.registeredTablesByPlayerId = [];
        var zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
        if (zoomStr) {
            this.zoom = Number(zoomStr);
        }
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
        var _this = this;
        var players = Object.values(gamedatas.players);
        // ignore loading of some pictures
        if (players.length > 3) {
            this.dontPreloadImage("map-small-no-grid.jpg");
        }
        else {
            this.dontPreloadImage("map-big-no-grid.jpg");
        }
        this.dontPreloadImage("map-small.jpg");
        this.dontPreloadImage("map-big.jpg");
        this.dontPreloadImage("map-small-no-grid-no-building.jpg");
        this.dontPreloadImage("map-big-no-grid-no-building.jpg");
        this.dontPreloadImage("map-small-no-building.jpg");
        this.dontPreloadImage("map-big-no-building.jpg");
        log("Starting game setup");
        this.gamedatas = gamedatas;
        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.createPlayerJumps(gamedatas);
        this.placeFirstPlayerToken(gamedatas.firstPlayerTokenPlayerId);
        document.getElementById('round-panel').innerHTML = "".concat(_('Round'), "&nbsp;<span id=\"round-number-counter\"></span>&nbsp;/&nbsp;12");
        this.roundNumberCounter = new ebg.counter();
        this.roundNumberCounter.create("round-number-counter");
        this.roundNumberCounter.setValue(gamedatas.roundNumber);
        this.setupNotifications();
        this.setupPreferences();
        document.getElementById('zoom-out').addEventListener('click', function () { return _this.zoomOut(); });
        document.getElementById('zoom-in').addEventListener('click', function () { return _this.zoomIn(); });
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }
        if (Number(gamedatas.gamestate.id) >= 90) { // score or end
            this.onEnteringShowScore();
        }
        this.addTooltips();
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
            case 'endScore':
                this.onEnteringShowScore();
                break;
        }
    };
    GetOnBoard.prototype.setGamestateDescription = function (property) {
        if (property === void 0) { property = ''; }
        var originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = "".concat(originalState['description' + property]);
        this.gamedatas.gamestate.descriptionmyturn = "".concat(originalState['descriptionmyturn' + property]);
        this.updatePageTitle();
    };
    GetOnBoard.prototype.onEnteringPlaceRoute = function (args) {
        var _this = this;
        if (args.canConfirm) {
            this.setGamestateDescription('Confirm');
        }
        if (this.isCurrentPlayerActive()) {
            args.possibleRoutes.forEach(function (route) { return _this.tableCenter.addGhostMarker(route); });
        }
    };
    GetOnBoard.prototype.onEnteringShowScore = function () {
        var _this = this;
        Object.keys(this.gamedatas.players).forEach(function (playerId) { var _a; return (_a = _this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.setValue(0); });
        this.gamedatas.hiddenScore = false;
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
                    var placeDeparturePawnArgs_1 = args;
                    placeDeparturePawnArgs_1._private.positions.forEach(function (position, index) {
                        document.getElementById("intersection".concat(position)).classList.add('selectable');
                        var ticketDiv = "<div class=\"ticket\" data-ticket=\"".concat(placeDeparturePawnArgs_1._private.tickets[index], "\"></div>");
                        _this.addActionButton("placeDeparturePawn".concat(position, "_button"), dojo.string.substitute(_("Start at ${ticket}"), { ticket: ticketDiv }), function () { return _this.placeDeparturePawn(position); });
                    });
                    break;
                case 'placeRoute':
                    this.addActionButton("confirmTurn_button", _("Confirm turn"), function () { return _this.confirmTurn(); });
                    var placeRouteArgs = args;
                    if (placeRouteArgs.canConfirm) {
                        this.startActionTimer("confirmTurn_button", 8);
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
    GetOnBoard.prototype.isVisibleScoring = function () {
        return !this.gamedatas.hiddenScore;
    };
    GetOnBoard.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    GetOnBoard.prototype.getPlayerColor = function (playerId) {
        return this.gamedatas.players[playerId].color;
    };
    GetOnBoard.prototype.setZoom = function (zoom) {
        if (zoom === void 0) { zoom = 1; }
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, '' + this.zoom);
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);
        var div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        }
        else {
            div.style.transform = "scale(".concat(zoom, ")");
            div.style.margin = "0 ".concat(ZOOM_LEVELS_MARGIN[newIndex], "% ").concat((1 - zoom) * -100, "% 0");
        }
        document.getElementById('zoom-wrapper').style.height = "".concat(div.getBoundingClientRect().height, "px");
    };
    GetOnBoard.prototype.zoomIn = function () {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    GetOnBoard.prototype.zoomOut = function () {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        var newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    };
    GetOnBoard.prototype.setupPreferences = function () {
        var _this = this;
        // Extract the ID and value from the UI control
        var onchange = function (e) {
            var match = e.target.id.match(/^preference_control_(\d+)$/);
            if (!match) {
                return;
            }
            var prefId = +match[1];
            var prefValue = +e.target.value;
            _this.prefs[prefId].value = prefValue;
            _this.onPreferenceChange(prefId, prefValue);
        };
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        // Call onPreferenceChange() now
        dojo.forEach(dojo.query("#ingame_menu_content .preference_control"), function (el) { return onchange({ target: el }); });
        try {
            document.getElementById('preference_control_203').closest(".preference_choice").style.display = 'none';
        }
        catch (e) { }
    };
    GetOnBoard.prototype.onPreferenceChange = function (prefId, prefValue) {
        switch (prefId) {
            case 204:
                document.getElementsByTagName('html')[0].dataset.noBuilding = (prefValue == 2).toString();
                break;
            case 205:
                document.getElementsByTagName('html')[0].dataset.noGrid = (prefValue == 2).toString();
                break;
        }
    };
    GetOnBoard.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var _a;
            var playerId = Number(player.id);
            var eliminated = Number(player.eliminated) > 0;
            if (playerId === _this.getPlayerId()) {
                var html = "\n                <div class=\"personal-objective-label\">".concat(_("Your personal objective:"), "</div>\n                <div id=\"personal-objective-wrapper\" data-expanded=\"").concat((((_a = _this.prefs[203]) === null || _a === void 0 ? void 0 : _a.value) != 2).toString(), "\">\n                    <div class=\"personal-objective collapsed\">\n                        ").concat(player.personalObjectiveLetters.map(function (letter) { return "<div class=\"letter\">".concat(letter, "</div>"); }).join(''), "\n                    </div>\n                    <div class=\"personal-objective expanded ").concat(gamedatas.map, "\" data-type=\"").concat(player.personalObjective, "\"></div>\n                    <div id=\"toggle-objective-expand\" class=\"arrow\"></div>\n                </div>");
                dojo.place(html, "player_board_".concat(player.id));
                document.getElementById('toggle-objective-expand').addEventListener('click', function () {
                    var wrapper = document.getElementById("personal-objective-wrapper");
                    var expanded = wrapper.dataset.expanded === 'true';
                    wrapper.dataset.expanded = (!expanded).toString();
                    var select = document.getElementById('preference_control_203');
                    select.value = expanded ? '2' : '1';
                    var event = new Event('change');
                    select.dispatchEvent(event);
                });
            }
            if (eliminated) {
                setTimeout(function () { return _this.eliminatePlayer(playerId); }, 200);
            }
            // first player token
            dojo.place("<div id=\"player_board_".concat(player.id, "_firstPlayerWrapper\" class=\"firstPlayerWrapper\"></div>"), "player_board_".concat(player.id));
            _this.setNewScore(playerId, Number(player.score));
        });
    };
    GetOnBoard.prototype.getOrderedPlayers = function (gamedatas) {
        var _this = this;
        var players = Object.values(gamedatas.players).sort(function (a, b) { return a.playerNo - b.playerNo; });
        var playerIndex = players.findIndex(function (player) { return Number(player.id) === Number(_this.player_id); });
        var orderedPlayers = playerIndex > 0 ? __spreadArray(__spreadArray([], players.slice(playerIndex), true), players.slice(0, playerIndex), true) : players;
        return orderedPlayers;
    };
    GetOnBoard.prototype.createPlayerTables = function (gamedatas) {
        var _this = this;
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            return _this.createPlayerTable(gamedatas, Number(player.id));
        });
    };
    GetOnBoard.prototype.createPlayerTable = function (gamedatas, playerId) {
        var table = new PlayerTable(this, gamedatas.players[playerId]);
        table.setRound(gamedatas.validatedTickets, gamedatas.currentTicket);
        this.playersTables.push(table);
        this.registeredTablesByPlayerId[playerId] = [table];
    };
    GetOnBoard.prototype.createPlayerJumps = function (gamedatas) {
        var _this = this;
        dojo.place("\n        <div id=\"jump-toggle\" class=\"jump-link toggle\">\n            \u21D4\n        </div>\n        <div id=\"jump-0\" class=\"jump-link\">\n            <div class=\"eye\"></div> ".concat(gamedatas.map === 'big' ? 'London' : 'New-York', "\n        </div>"), "jump-controls");
        document.getElementById("jump-toggle").addEventListener('click', function () { return _this.jumpToggle(); });
        document.getElementById("jump-0").addEventListener('click', function () { return _this.jumpToPlayer(0); });
        var orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(function (player) {
            dojo.place("<div id=\"jump-".concat(player.id, "\" class=\"jump-link\" style=\"color: #").concat(player.color, "; border-color: #").concat(player.color, ";\"><div class=\"eye\" style=\"background: #").concat(player.color, ";\"></div> ").concat(player.name, "</div>"), "jump-controls");
            document.getElementById("jump-".concat(player.id)).addEventListener('click', function () { return _this.jumpToPlayer(Number(player.id)); });
        });
        var jumpDiv = document.getElementById("jump-controls");
        jumpDiv.style.marginTop = "-".concat(Math.round(jumpDiv.getBoundingClientRect().height / 2), "px");
    };
    GetOnBoard.prototype.jumpToggle = function () {
        document.getElementById("jump-controls").classList.toggle('folded');
    };
    GetOnBoard.prototype.jumpToPlayer = function (playerId) {
        var elementId = playerId === 0 ? "map" : "player-table-".concat(playerId);
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
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
            slideToObjectAndAttach(this, firstPlayerTableToken, "player-table-".concat(playerId, "-first-player-wrapper"), this.zoom);
        }
        else {
            dojo.place('<div id="firstPlayerTableToken" class="first-player-token"></div>', "player-table-".concat(playerId, "-first-player-wrapper"));
            this.addTooltipHtml('firstPlayerTableToken', _("Inspector pawn. This player is the first player of the round."));
        }
    };
    GetOnBoard.prototype.getTooltip = function (element) {
        switch (element) {
            case 0: return '[GreenLight] : ' + _("If your route ends at an intersection with a [GreenLight], you place an additional marker.");
            case 1: return _("<strong>Number:</strong> Possible starting point. You choose between 2 numbers at the beginning of the game to place your Departure Pawn.");
            case 20: return '[OldLady] : ' + _("When a marker reach an [OldLady], check a box on the [OldLady] zone. Add the number next to each checked box at the end.");
            case 30: return '[Student] : ' + _("When a marker reach an [Student], check a box on the [Student] zone. Multiply [Student] with [School] at the end.");
            case 32: return '[School] : ' + _("When a marker reach a [School], check a box on the [School] zone. Multiply [Student] with [School] at the end.") + "<br><i>".concat(_("If the [School] is marked with a Star, write the number of [Student] you have checked when a marker reach it."), "</i>");
            case 40: return '[Tourist] : ' + _("When a marker reach a [Tourist], check a box on the first available row on the [Tourist] zone. You will score when you drop the [Tourist] to [MonumentLight]/[MonumentDark]. If the current row is full and you didn't reach [MonumentLight]/[MonumentDark], nothing happens.");
            case 41: return '[MonumentLight][MonumentDark] : ' + _("When a marker reach [MonumentLight]/[MonumentDark], write the score on the column of the [Tourist] at the end of the current row. If the current row is empty, nothing happen.") + "<br><i>".concat(_("If [MonumentLight]/[MonumentDark] is marked with a Star, write the number of [Tourist] you have checked when a marker reach it."), "</i>");
            case 50: return '[Businessman] : ' + _("When a marker reach [Businessman], check a box on the first available row on the [Businessman] zone. You will score when you drop the [Businessman] to [Office]. If the current row is full and you didn't reach [Office], nothing happens.");
            case 51: return '[Office] : ' + _("When a marker reach [Office], write the score on the column of the [Businessman] at the end of the current row, and check the associated symbol ([OldLady], [Tourist] or [Student]) as if you reached it with a marker. If the current row is empty, nothing happen.") + "<br><i>".concat(_("If the [Office] is marked with a Star, write the number of [Businessman] you have checked when a marker reach it."), "</i>");
            case 90: return _("<strong>Common Objective:</strong> Score 10 points when you complete the objective, or 6 points if another player completed it on a previous round.");
            case 91: return _("<strong>Personal Objective:</strong> Score 10 points when your markers link the 3 Letters of your personal objective.");
            case 92: return _("<strong>Turn Zone:</strong> If you chose to change a turn into a straight line or a straight line to a turn, check a box on the Turn Zone. The score here is negative, and you only have 5 of them!");
            case 93: return _("<strong>Traffic Jam:</strong> For each marker already in place when you add a marker on a route, check a box on the Turn Zone. If the road is black, check an extra box. The score here is negative!");
            case 94: return _("<strong>Total score:</strong> Sum of all green zone totals, with substraction of all red zone totals.");
            case 95: return _("<strong>Tickets:</strong> The red check indicates the current round ticket. It defines the shape of the route you have to place. The black checks indicates the past rounds.");
            case 97: return _("<strong>Letter:</strong> Used to define your personal objective.");
        }
    };
    GetOnBoard.prototype.addTooltips = function () {
        var _this = this;
        document.querySelectorAll("[data-tooltip]").forEach(function (element) {
            var tooltipsIds = JSON.parse(element.dataset.tooltip);
            var tooltip = "";
            tooltipsIds.forEach(function (id) { return tooltip += "<div class=\"tooltip-section\">".concat(formatTextIcons(_this.getTooltip(id)), "</div>"); });
            _this.addTooltipHtml(element.id, tooltip);
        });
    };
    GetOnBoard.prototype.eliminatePlayer = function (playerId) {
        this.gamedatas.players[playerId].eliminated = 1;
        document.getElementById("overall_player_board_".concat(playerId)).classList.add('eliminated-player');
        dojo.addClass("player-table-".concat(playerId), 'eliminated');
    };
    GetOnBoard.prototype.setNewScore = function (playerId, score) {
        var _this = this;
        var _a;
        if (this.gamedatas.hiddenScore) {
            setTimeout(function () {
                Object.keys(_this.gamedatas.players).filter(function (pId) { return _this.gamedatas.players[pId].eliminated == 0; }).forEach(function (pId) { return document.getElementById("player_score_".concat(pId)).innerHTML = '-'; });
            }, 100);
        }
        else {
            if (!isNaN(score)) {
                (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(score);
            }
        }
    };
    GetOnBoard.prototype.cutZone = function (pipDiv, zone) {
        var zoneDiv = pipDiv.querySelector("[data-zone=\"".concat(zone, "\"]"));
        var zoneStyle = window.getComputedStyle(zoneDiv);
        pipDiv.style.width = zoneStyle.width;
        pipDiv.style.height = zoneStyle.height;
        pipDiv.scrollTo(Number(zoneStyle.left.match(/\d+/)[0]), 77 + Number(zoneStyle.top.match(/\d+/)[0]));
    };
    GetOnBoard.prototype.isElementIntoViewport = function (el) {
        var rect = el.getBoundingClientRect();
        var elemTop = rect.top;
        var elemBottom = rect.bottom;
        // Only completely visible elements return true:
        var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
        // Partially visible elements return true:
        //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
        return isVisible;
    };
    GetOnBoard.prototype.showZone = function (playerId, zone, position) {
        var _this = this;
        var pipSide = this.tableCenter.getSide(position) === 'left' ? 'right' : 'left';
        Array.from(document.getElementsByClassName('pips')).forEach(function (pipDiv) { return pipDiv.dataset.side = pipSide; });
        var playerTableZoneDiv = document.getElementById("player-table-".concat(playerId)).querySelector("[data-zone=\"".concat(zone, "\"]"));
        var pipId = "pip-".concat(playerId, "-").concat(zone, "-").concat(position);
        dojo.place("<div class=\"pip\" id=\"".concat(pipId, "\" style=\"border-color: #").concat(this.getPlayerColor(playerId), "\"></div>"), zone >= 6 ? 'pips-bottom' : 'pips-top');
        var pipDiv = document.getElementById("pip-".concat(playerId, "-").concat(zone, "-").concat(position));
        var pipTable = new PlayerTable(this, this.gamedatas.players[playerId], pipId, pipDiv);
        this.registeredTablesByPlayerId[playerId].push(pipTable);
        this.cutZone(pipDiv, zone);
        var originBR = playerTableZoneDiv.getBoundingClientRect();
        var pipBR = pipDiv.getBoundingClientRect();
        var deltaX = originBR.left - pipBR.left - 8;
        var deltaY = originBR.top - pipBR.top - 8;
        pipDiv.style.transform = "translate(".concat(deltaX / this.zoom, "px, ").concat(deltaY / this.zoom, "px)");
        if (!this.isElementIntoViewport(playerTableZoneDiv)) {
            pipDiv.classList.add('animated');
            setTimeout(function () { return pipDiv.style.transform = ''; }, 0);
        }
        setTimeout(function () {
            var _a;
            var index = _this.registeredTablesByPlayerId[playerId].indexOf(pipTable);
            _this.registeredTablesByPlayerId[playerId].splice(index, 1);
            (_a = pipDiv.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(pipDiv);
        }, 3000);
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
        var _a;
        var args = this.gamedatas.gamestate.args;
        var route = (_a = args.possibleRoutes) === null || _a === void 0 ? void 0 : _a.find(function (r) { return (r.from === from && r.to === to) || (r.from === to && r.to === from); });
        if (!route) {
            return;
        }
        if (!this.checkAction('placeRoute')) {
            return;
        }
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
        if (!this.checkAction('confirmTurn', true)) {
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
            ['newRound', ANIMATION_MS],
            ['newFirstPlayer', ANIMATION_MS],
            ['placedRoute', ANIMATION_MS * 2],
            ['confirmTurn', ANIMATION_MS],
            ['flipObjective', ANIMATION_MS],
            ['placedDeparturePawn', ANIMATION_MS],
            ['removeMarkers', 1],
            ['updateScoreSheet', 1],
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    GetOnBoard.prototype.notif_newRound = function (notif) {
        this.tableCenter.setRound(notif.args.validatedTickets, notif.args.currentTicket);
        this.playersTables.forEach(function (playerTable) { return playerTable.setRound(notif.args.validatedTickets, notif.args.currentTicket); });
        this.roundNumberCounter.toValue(notif.args.round);
    };
    GetOnBoard.prototype.notif_newFirstPlayer = function (notif) {
        this.placeFirstPlayerToken(notif.args.playerId);
    };
    GetOnBoard.prototype.notif_updateScoreSheet = function (notif) {
        var _this = this;
        var playerId = notif.args.playerId;
        this.registeredTablesByPlayerId[playerId].forEach(function (table) { return table.updateScoreSheet(notif.args.scoreSheets, !_this.gamedatas.hiddenScore); });
        this.setNewScore(playerId, notif.args.scoreSheets.current.total);
    };
    GetOnBoard.prototype.notif_placedDeparturePawn = function (notif) {
        this.tableCenter.addDeparturePawn(notif.args.playerId, notif.args.position);
    };
    GetOnBoard.prototype.notif_placedRoute = function (notif) {
        var _this = this;
        var playerId = notif.args.playerId;
        this.tableCenter.addMarker(playerId, notif.args.marker);
        notif.args.zones.forEach(function (zone) { return _this.showZone(playerId, zone, notif.args.position); });
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
        var playerId = Number(notif.args.who_quits);
        this.setNewScore(playerId, 0);
        this.eliminatePlayer(playerId);
    };
    GetOnBoard.prototype.notif_flipObjective = function (notif) {
        document.getElementById("common-objective-".concat(notif.args.objective.id)).dataset.side = '1';
    };
    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    GetOnBoard.prototype.format_string_recursive = function (log, args) {
        try {
            if (log && args && !args.processed) {
                if (args.shape && args.shape[0] != '<') {
                    args.shape = "<div class=\"shape\" data-shape=\"".concat(JSON.stringify(args.shape), "\" data-step=\"").concat(args.step, "\"></div>");
                }
                if (args.elements && typeof args.elements !== 'string') {
                    args.elements = args.elements.map(function (element) {
                        return "<div class=\"map-icon\" data-element=\"".concat(element, "\"></div>");
                    }).join('');
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
