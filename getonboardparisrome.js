var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
function throttle(callback, delay) {
    var last;
    var timer;
    return function () {
        var context = this;
        var now = +new Date();
        var args = arguments;
        if (last && now < last + delay) {
            clearTimeout(timer);
            timer = setTimeout(function () {
                last = now;
                callback.apply(context, args);
            }, delay);
        }
        else {
            last = now;
            callback.apply(context, args);
        }
    };
}
var advThrottle = function (func, delay, options) {
    if (options === void 0) { options = { leading: true, trailing: false }; }
    var timer = null, lastRan = null, trailingArgs = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timer) { //called within cooldown period
            lastRan = this; //update context
            trailingArgs = args; //save for later
            return;
        }
        if (options.leading) { // if leading
            func.call.apply(// if leading
            func, __spreadArray([this], args, false)); //call the 1st instance
        }
        else { // else it's trailing
            lastRan = this; //update context
            trailingArgs = args; //save for later
        }
        var coolDownPeriodComplete = function () {
            if (options.trailing && trailingArgs) { // if trailing and the trailing args exist
                func.call.apply(// if trailing and the trailing args exist
                func, __spreadArray([lastRan], trailingArgs, false)); //invoke the instance with stored context "lastRan"
                lastRan = null; //reset the status of lastRan
                trailingArgs = null; //reset trailing arguments
                timer = setTimeout(coolDownPeriodComplete, delay); //clear the timout
            }
            else {
                timer = null; // reset timer
            }
        };
        timer = setTimeout(coolDownPeriodComplete, delay);
    };
};
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this._zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, }));
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        this.throttleTime = (_e = settings.throttleTime) !== null && _e !== void 0 ? _e : 100;
        window.addEventListener('resize', advThrottle(function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        }, this.throttleTime, { leading: true, trailing: true, }));
        if (window.ResizeObserver) {
            new ResizeObserver(advThrottle(function () { return _this.zoomOrDimensionChanged(); }, this.throttleTime, { leading: true, trailing: true, })).observe(settings.element);
        }
        if ((_f = this.settings.autoZoom) === null || _f === void 0 ? void 0 : _f.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ZoomManager.prototype, "zoomLevels", {
        /**
         * Returns the zoom levels
         */
        get: function () {
            return this._zoomLevels;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this._zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this._zoomLevels[this._zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Sets the available zoomLevels and new zoom to the provided values.
     * @param zoomLevels the new array of zoomLevels that can be used.
     * @param newZoom if provided the zoom will be set to this value, if not the last element of the zoomLevels array will be set as the new zoom
     */
    ZoomManager.prototype.setZoomLevels = function (zoomLevels, newZoom) {
        if (!zoomLevels || zoomLevels.length <= 0) {
            return;
        }
        this._zoomLevels = zoomLevels;
        var zoomIndex = newZoom && zoomLevels.includes(newZoom) ? this._zoomLevels.indexOf(newZoom) : this._zoomLevels.length - 1;
        this.setZoom(this._zoomLevels[zoomIndex]);
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this._zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    /**
     * Everytime the element dimensions changes, we update the style. And call the optional callback.
     * Unsafe method as this is not protected by throttle. Surround with  `advThrottle(() => this.zoomOrDimensionChanged(), this.throttleTime, { leading: true, trailing: true, })` to avoid spamming recomputation.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.offsetWidth / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.offsetHeight * this._zoom, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this._zoomLevels[this._zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this._zoomLevels[0]) {
            return;
        }
        var newIndex = this._zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this._zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
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
        for (var i = 1; i <= 4; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-cinemas-checkmark").concat(i, "\" class=\"cinemas checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-students-total\" class=\"total\"></div>\n                </div>\n        ");
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
        for (var i = 1; i <= 4; i++) {
            this.setContentAndValidation("cinemas-checkmark".concat(i), current.checkedCinemas >= i ? '✔' : '', current.checkedCinemas >= i && validated.checkedCinemas < i);
        }
        if (visibleScoring) {
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
var PlayerTableLoversBlock = /** @class */ (function (_super) {
    __extends(PlayerTableLoversBlock, _super);
    function PlayerTableLoversBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"lovers-block-".concat(playerId, "\" data-tooltip=\"[50,51]\" class=\"lovers block\" data-zone=\"5\">");
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 2; i++) {
                html += "\n                    <div id=\"player-table-".concat(playerId, "-lovers-light-checkmark").concat(row, "-").concat(i, "\" class=\"checkmark light\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>\n                    <div id=\"player-table-").concat(playerId, "-lovers-dark-checkmark").concat(row, "-").concat(i, "\" class=\"checkmark dark\" data-row=\"").concat(row, "\" data-number=\"").concat(i, "\"></div>");
            }
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-lovers-subtotal1\" class=\"subtotal\" data-number=\"1\"></div>\n                    <div id=\"player-table-").concat(playerId, "-lovers-subtotal2\" class=\"subtotal\" data-number=\"2\"></div>\n                    <div id=\"player-table-").concat(playerId, "-lovers-subtotal3\" class=\"subtotal\" data-number=\"3\"></div>\n                    <div id=\"player-table-").concat(playerId, "-lovers-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableLoversBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.lovers;
        var validated = scoreSheets.validated.lovers;
        for (var row = 1; row <= 3; row++) {
            for (var i = 1; i <= 2; i++) {
                this.setContentAndValidation("lovers-light-checkmark".concat(row, "-").concat(i), current.checkedLoversLight[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedLoversLight[row - 1] >= i && validated.checkedLoversLight[row - 1] < i);
                this.setContentAndValidation("lovers-dark-checkmark".concat(row, "-").concat(i), current.checkedLoversDark[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedLoversDark[row - 1] >= i && validated.checkedLoversDark[row - 1] < i);
            }
            this.setContentAndValidation("lovers-subtotal".concat(row), current.subTotals[row - 1], current.subTotals[row - 1] != validated.subTotals[row - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation("lovers-total", current.total, current.total != validated.total);
        }
    };
    return PlayerTableLoversBlock;
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
var PlayerTableConnectionsBlock = /** @class */ (function (_super) {
    __extends(PlayerTableConnectionsBlock, _super);
    function PlayerTableConnectionsBlock(playerId, scoreSheets, visibleScoring) {
        var _this = _super.call(this, playerId) || this;
        var html = "\n        <div id=\"connections-block-".concat(playerId, "\" data-tooltip=\"[93]\" class=\"connections block\" data-zone=\"7\">");
        for (var i = 1; i <= 19; i++) {
            html += "\n                    <div id=\"player-table-".concat(playerId, "-connections-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                    <div id=\"player-table-".concat(playerId, "-connections-total\" class=\"total\"></div>\n                </div>\n        ");
        dojo.place(html, "player-table-".concat(playerId, "-main"));
        _this.updateScoreSheet(scoreSheets, visibleScoring);
        return _this;
    }
    PlayerTableConnectionsBlock.prototype.updateScoreSheet = function (scoreSheets, visibleScoring) {
        var current = scoreSheets.current.connections;
        var validated = scoreSheets.validated.connections;
        for (var i = 1; i <= 19; i++) {
            this.setContentAndValidation("connections-checkmark".concat(i), current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation("connections-total", current.total, current.total !== validated.total);
        }
    };
    return PlayerTableConnectionsBlock;
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
            html += "<div id=\"player-table-".concat(this.playerId, "-top-checkmark").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += " \n            </div>\n            \n            <div id=\"player-table-".concat(this.playerId, "-main\" class=\"main\">\n                <div class=\"connection-color\">");
        for (var i = 1; i <= 2; i++) {
            html += "<div id=\"player-table-".concat(this.playerId, "-connection-color-").concat(i, "\" class=\"checkmark\" data-number=\"").concat(i, "\"></div>");
        }
        html += "\n                </div>\n                <div id=\"player-table-".concat(this.playerId, "-total-score\" data-tooltip=\"[94]\" class=\"total score\"></div>\n            </div>\n            <div class=\"name\" style=\"color: #").concat(player.color, ";\">").concat(player.name, "</div>\n            <div id=\"player-table-").concat(this.playerId, "-first-player-wrapper\" class=\"first-player-wrapper\"></div>\n        </div>\n        ");
        dojo.place(html, insertIn);
        if (player.scoreSheets.current.connectionColor) {
            this.setContentAndValidation("connection-color-".concat(player.scoreSheets.current.connectionColor), '✔', false);
        }
        this.oldLadies = new PlayerTableOldLadiesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.students = new PlayerTableStudentsBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.tourists = new PlayerTableTouristsBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.lovers = new PlayerTableLoversBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.commonObjectives = new PlayerTableCommonObjectivesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.personalObjective = new PlayerTablePersonalObjectiveBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.turnZones = new PlayerTableTurnZonesBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
        this.connections = new PlayerTableConnectionsBlock(this.playerId, player.scoreSheets, game.isVisibleScoring());
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
        if (scoreSheets.current.connectionColor) {
            this.setContentAndValidation("connection-color-".concat(scoreSheets.current.connectionColor), '✔', false);
        }
        this.oldLadies.updateScoreSheet(scoreSheets, visibleScoring);
        this.students.updateScoreSheet(scoreSheets, visibleScoring);
        this.tourists.updateScoreSheet(scoreSheets, visibleScoring);
        this.lovers.updateScoreSheet(scoreSheets, visibleScoring);
        this.commonObjectives.updateScoreSheet(scoreSheets, visibleScoring);
        this.personalObjective.updateScoreSheet(scoreSheets, visibleScoring);
        this.turnZones.updateScoreSheet(scoreSheets, visibleScoring);
        this.connections.updateScoreSheet(scoreSheets, visibleScoring);
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
var COMMON_OBJECTIVES = [
    null,
    [20, 5],
    [30, 5],
    [40, 5],
    [50, 5],
    [41, 3],
    [42, 3],
];
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
            if (elements.includes(52)) {
                tooltipsIds.push(52);
            }
            if (elements.some(function (element) { return element >= 97 && element <= 122; })) {
                tooltipsIds.push(97);
            }
            var departure = elements.find(function (element) { return element >= 1 && element <= 12; });
            var coordinates = _this.getCoordinatesFromPosition(position);
            var html = "<div id=\"intersection".concat(position, "\" class=\"intersection ").concat(elements.some(function (element) { return element == 0; }) ? 'station' : '');
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
        var currentPlayer = gamedatas.players[this.game.getPlayerId()];
        // common objectives
        gamedatas.commonObjectives.forEach(function (commonObjective) { return _this.placeCommonObjective(commonObjective, !!currentPlayer); });
        // personal objective
        Object.keys(gamedatas.MAP_POSITIONS).filter(function (key) { return gamedatas.MAP_POSITIONS[key].some(function (element) { return element >= 97 && element <= 122; }); }).forEach(function (position) {
            //currentPlayer?.personalObjectivePositions.forEach(position => 
            return dojo.place("<div class=\"objective-letter\" data-position=\"".concat(position, "\"></div>"), "intersection".concat(position));
        });
        // tickets
        this.setRound(gamedatas.validatedTickets, gamedatas.currentTicket, true);
        ['top', 'bottom', 'left', 'right'].forEach(function (side) { return dojo.place("<div class=\"position-indicator ".concat(side, "\"></div>"), 'map'); });
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
        else if (route.connections > 0) {
            ghostClass = 'connections';
        }
        dojo.place("<div id=\"ghost-marker-".concat(min, "-").concat(max, "\" class=\"ghost marker ").concat(ghostClass, "\"></div>"), "route".concat(min, "-").concat(max));
    };
    TableCenter.prototype.removeGhostMarkers = function () {
        Array.from(document.getElementsByClassName('ghost')).forEach(function (element) { var _a; return (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element); });
    };
    TableCenter.prototype.getCoordinatesFromNumberAndDigit = function (number, digit) {
        if (this.gamedatas.map === 'big') {
            var space = 64;
            return [
                33 + space * number,
                168 + space * digit,
            ];
        }
        else if (this.gamedatas.map === 'small') {
            var space = 64.1;
            return [
                33 + space * number,
                172 + space * digit,
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
        return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
    };
    TableCenter.prototype.placeCommonObjective = function (objective, isPlayer) {
        dojo.place("<div id=\"common-objective-".concat(objective.id, "\" class=\"common-objective card-inner\" data-side=\"").concat(objective.completed ? '1' : '0', "\">\n            <div class=\"card-side front\"></div>\n            <div class=\"card-side back\"></div>\n        </div>\n        "), "common-objective-slot-".concat(objective.number));
        var commonObjectiveInfos = COMMON_OBJECTIVES[objective.id];
        this.game.addTooltipHtml("common-objective-slot-".concat(objective.number), "".concat(this.game.getTooltip(90), "<br><br>").concat(_("To complete this objective, you need to check ${number} ${element}").replace('${number}', "<strong>".concat(commonObjectiveInfos[1], "</strong>")).replace('${element}', "<div class=\"map-icon\" data-element=\"".concat(commonObjectiveInfos[0], "\"></div>"))));
        if (isPlayer) { // objective progress counter only if player is not a spectator
            dojo.place("\n            <div class=\"common-objective-counter\"><span id=\"common-objective-".concat(objective.number, "-counter\" data-type=\"").concat(objective.id, "\">0</span>/").concat(commonObjectiveInfos[1], "</div>\n            "), "common-objective-slot-".concat(objective.number));
        }
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
var ANIMATION_MS = 500;
var ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1, 1.25, 1.5];
var LOCAL_STORAGE_ZOOM_KEY = 'GetOnBoard-zoom';
var LOCAL_STORAGE_JUMP_KEY = 'GetOnBoard-jump-to-folded';
function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[Station\]/ig, '<div class="map-icon" data-element="0"></div>')
        .replace(/\[OldLady\]/ig, '<div class="map-icon" data-element="20"></div>')
        .replace(/\[Student\]/ig, '<div class="map-icon" data-element="30"></div>')
        .replace(/\[Cinema\]/ig, '<div class="map-icon" data-element="32"></div>')
        .replace(/\[Tourist\]/ig, '<div class="map-icon" data-element="40"></div>')
        .replace(/\[MonumentLight\]/ig, '<div class="map-icon" data-element="41"></div>')
        .replace(/\[MonumentDark\]/ig, '<div class="map-icon" data-element="42"></div>')
        .replace(/\[LoverLight\]/ig, '<div class="map-icon" data-element="50"></div>')
        .replace(/\[LoverDark\]/ig, '<div class="map-icon" data-element="51"></div>')
        .replace(/\[Restaurant\]/ig, '<div class="map-icon" data-element="52"></div>');
}
var GetOnBoard = /** @class */ (function () {
    function GetOnBoard() {
        this.playersTables = [];
        this.registeredTablesByPlayerId = [];
        document.getElementById('jump-controls').classList.toggle('folded', localStorage.getItem(LOCAL_STORAGE_JUMP_KEY) == 'true');
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
        if (Number(gamedatas.gamestate.id) >= 90) { // score or end. before createPlayerTables so full score is written if game has ended even if hide score is on
            this.onEnteringShowScore();
        }
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.createPlayerJumps(gamedatas);
        Object.values(gamedatas.players).forEach(function (player) {
            _this.highlightObjectiveLetters(player);
            _this.setObjectivesCounters(Number(player.id), player.scoreSheets.current);
        });
        this.placeFirstPlayerToken(gamedatas.firstPlayerTokenPlayerId);
        document.getElementById('round-panel').innerHTML = "".concat(_('Round'), "&nbsp;<span id=\"round-number-counter\"></span>&nbsp;/&nbsp;12");
        this.roundNumberCounter = new ebg.counter();
        this.roundNumberCounter.create("round-number-counter");
        this.roundNumberCounter.setValue(gamedatas.roundNumber);
        this.zoomManager = new ZoomManager({
            element: document.getElementById('full-table'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            zoomLevels: ZOOM_LEVELS,
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            onZoomChange: function (zoom) { return document.getElementById('map').classList.toggle('hd', zoom > 1); }
        });
        this.setupNotifications();
        this.setupPreferences();
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
        var activePlayerColor = this.getPlayerColor(this.getActivePlayerId());
        var currentPositionIntersection = document.getElementById("intersection".concat(args.currentPosition));
        currentPositionIntersection.classList.add('glow');
        currentPositionIntersection.style.setProperty('--background-lighter', "#".concat(activePlayerColor, "66"));
        currentPositionIntersection.style.setProperty('--background-darker', "#".concat(activePlayerColor, "CC"));
        var map = document.getElementById('map');
        if (this.gamedatas.map == 'small') {
            var elemBR = currentPositionIntersection.getBoundingClientRect();
            var mapBR = map.getBoundingClientRect();
            console.log(currentPositionIntersection.getBoundingClientRect(), map.getBoundingClientRect());
            var left = (elemBR.left - mapBR.left) / mapBR.width * 740;
            var top_1 = (elemBR.top - mapBR.top) / mapBR.height * 740;
            map.style.setProperty('--position-indicator-left', "".concat(left, "px"));
            map.style.setProperty('--position-indicator-top', "".concat(top_1, "px"));
            /*const left = Number(currentPositionIntersection.style.left.match(/(\d+)/)[0]);
            const top = Number(currentPositionIntersection.style.top.match(/(\d+)/)[0]);
            const deltaX = left - 370;
            const deltaY = top - 370;
            const angle = Math.atan(deltaY / deltaX);
            const distanceFromCenter = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
            const newAngle = angle + 0.25 * Math.PI;
            const newDeltaX = distanceFromCenter * Math.cos(newAngle);
            const newDeltaY = distanceFromCenter * Math.sin(newAngle);
            console.log(deltaX, deltaY, distanceFromCenter, angle, '--', newAngle, newDeltaX, newDeltaY);
            map.style.setProperty('--position-indicator-left', `${370 + newDeltaX}px`);
            map.style.setProperty('--position-indicator-top', `${370 + newDeltaY}px`);*/
        }
        else {
            map.style.setProperty('--position-indicator-left', currentPositionIntersection.style.left);
            map.style.setProperty('--position-indicator-top', currentPositionIntersection.style.top);
        }
        map.style.setProperty('--position-indicator-color', "#".concat(activePlayerColor));
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
        document.querySelectorAll('.intersection.glow').forEach(function (element) { return element.classList.remove('glow'); });
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
    GetOnBoard.prototype.expandObjectiveClick = function () {
        var wrappers = document.querySelectorAll(".personal-objective-wrapper");
        var expanded = this.prefs[203].value == '1';
        wrappers.forEach(function (wrapper) { return wrapper.dataset.expanded = (!expanded).toString(); });
        var select = document.getElementById('preference_control_203');
        select.value = expanded ? '2' : '1';
        var event = new Event('change');
        select.dispatchEvent(event);
    };
    GetOnBoard.prototype.showPersonalObjective = function (playerId) {
        var _this = this;
        if (document.getElementById("personal-objective-wrapper-".concat(playerId)).childElementCount > 0) {
            return;
        }
        var player = this.gamedatas.players[playerId];
        var html = "\n            <div class=\"personal-objective collapsed\">\n                ".concat(player.personalObjectiveLetters.map(function (letter, letterIndex) { return "<div class=\"letter\" data-player-id=\"".concat(playerId, "\" data-position=\"").concat(player.personalObjectivePositions[letterIndex], "\">").concat(letter, "</div>"); }).join(''), "\n            </div>\n            <div class=\"personal-objective expanded ").concat(this.gamedatas.map, "\" data-type=\"").concat(player.personalObjective, "\"></div>\n            <div id=\"toggle-objective-expand-").concat(playerId, "\" class=\"arrow\"></div>\n        ");
        dojo.place(html, "personal-objective-wrapper-".concat(playerId));
        document.getElementById("toggle-objective-expand-".concat(playerId)).addEventListener('click', function () { return _this.expandObjectiveClick(); });
    };
    GetOnBoard.prototype.createPlayerPanels = function (gamedatas) {
        var _this = this;
        Object.values(gamedatas.players).forEach(function (player) {
            var _a;
            var playerId = Number(player.id);
            var eliminated = Number(player.eliminated) > 0;
            if (playerId === _this.getPlayerId()) {
                dojo.place("<div class=\"personal-objective-label\">".concat(_("Your personal objective:"), "</div>"), "player_board_".concat(player.id));
            }
            var html = "\n            <div id=\"personal-objective-wrapper-".concat(playerId, "\" class=\"personal-objective-wrapper\" data-expanded=\"").concat((((_a = _this.prefs[203]) === null || _a === void 0 ? void 0 : _a.value) != 2).toString(), "\"></div>");
            dojo.place(html, "player_board_".concat(player.id));
            if (player.personalObjective) {
                _this.showPersonalObjective(playerId);
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
        dojo.place("\n        <div id=\"jump-toggle\" class=\"jump-link toggle\">\n            \u21D4\n        </div>\n        <div id=\"jump-0\" class=\"jump-link\">\n            <div class=\"eye\"></div> ".concat(gamedatas.map === 'big' ? 'Paris' : 'Roma', "\n        </div>"), "jump-controls");
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
        var jumpControls = document.getElementById('jump-controls');
        jumpControls.classList.toggle('folded');
        localStorage.setItem(LOCAL_STORAGE_JUMP_KEY, jumpControls.classList.contains('folded').toString());
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
            slideToObjectAndAttach(this, firstPlayerTableToken, "player-table-".concat(playerId, "-first-player-wrapper"), this.zoomManager.zoom);
        }
        else {
            dojo.place('<div id="firstPlayerTableToken" class="first-player-token"></div>', "player-table-".concat(playerId, "-first-player-wrapper"));
            this.addTooltipHtml('firstPlayerTableToken', _("Inspector pawn. This player is the first player of the round."));
        }
    };
    GetOnBoard.prototype.getTooltip = function (element) {
        switch (element) {
            case 0: return '[Station] : ' + _("If your route ends at an intersection with a [Station], add a circle on your Metro zone. At the end of each round, you can cross off a single circled [Station] to place 1 extra marker to make your route longer (in any direction).");
            case 1: return _("<strong>Number:</strong> Possible starting point. You choose between 2 numbers at the beginning of the game to place your Departure Pawn.");
            case 20: return '[OldLady] : ' + _("When a marker reaches [OldLady], check a box on the [OldLady] zone. Add the number next to each checked box at game end.");
            case 30: return '[Student] : ' + _("When a marker reaches [Student], check a box on the [Student] zone. Multiply [Student] with [Cinema] at game end.");
            case 32: return '[Cinema] : ' + _("When a marker reaches [Cinema], check a box on the [Cinema] zone. Multiply [Student] with [Cinema] at game end.");
            case 40: return '[Tourist] : ' + _("When a marker reaches [Tourist], check a box on the first available row on the [Tourist] zone. You will score when you drop off the [Tourist] to [MonumentLight]/[MonumentDark]. If the current row is full and you didn't reach [MonumentLight]/[MonumentDark], nothing happens.");
            case 41: return '[MonumentLight][MonumentDark] : ' + _("When a marker reaches [MonumentLight]/[MonumentDark], write the score on the column of the [Tourist] at the end of the current row. If the current row is empty, nothing happens.");
            case 50:
            case 51: return '[LoverLight][LoverDark] : ' + _("When a marker reaches [LoverLight][LoverDark], check a box on the first available row on the [LoverLight][LoverDark] zone. You will score when you drop off the [LoverLight][LoverDark] to [Restaurant]. If the current row is full and you didn't reach [Restaurant], nothing happens.");
            case 52: return '[Restaurant] : ' + _("When a marker reaches [Restaurant], write the score (6 points for each couple dark/light, 2 points for each single) at the end of the current row. If the current row is empty, nothing happens.");
            case 90: return _("<strong>Common Objective:</strong> Score 10 points when you complete the objective, or 6 points if another player completed it on a previous round.");
            case 91: return _("<strong>Personal Objective:</strong> Score 10 points when your markers link the 3 Letters of your personal objective.");
            case 92: return _("<strong>Turn Zone:</strong> If you choose to change a turn into a straight line or a straight line to a turn, check a box on the Turn Zone. The score here is negative, and you only have 5 of them!");
            case 93: return _("<strong>Connections:</strong> For each marker already in place when you add a marker on a route, check a Connection box. If the road is the same as the checked connection color, check an extra box.");
            case 94: return _("<strong>Total score:</strong> Add sum of all green zone totals, subtract sum of all red zone totals.");
            case 95: return _("<strong>Tickets:</strong> The red check indicates the current round ticket. It defines the shape of the route you have to place. The black checks indicates past rounds.");
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
        this.setNewScore(playerId, 0);
    };
    GetOnBoard.prototype.setNewScore = function (playerId, score) {
        var _this = this;
        var _a, _b;
        if (this.gamedatas.players[playerId].eliminated) {
            (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.setValue(0);
        }
        else {
            if (this.gamedatas.hiddenScore) {
                setTimeout(function () {
                    Object.keys(_this.gamedatas.players).filter(function (pId) { return _this.gamedatas.players[pId].eliminated == 0; }).forEach(function (pId) { return document.getElementById("player_score_".concat(pId)).innerHTML = '-'; });
                }, 100);
            }
            else {
                if (!isNaN(score)) {
                    (_b = this.scoreCtrl[playerId]) === null || _b === void 0 ? void 0 : _b.toValue(this.gamedatas.players[playerId].eliminated != 0 ? 0 : score);
                }
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
        pipDiv.style.transform = "translate(".concat(deltaX / this.zoomManager.zoom, "px, ").concat(deltaY / this.zoomManager.zoom, "px)");
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
    GetOnBoard.prototype.positionReached = function (position, playerMarkers) {
        return playerMarkers.some(function (marker) { return marker.from == position || marker.to == position; });
    };
    GetOnBoard.prototype.highlightObjectiveLetters = function (player) {
        var _this = this;
        if (player.personalObjective) {
            var lettersPositions = player.personalObjectivePositions;
            lettersPositions.forEach(function (lettersPosition) {
                var reached = _this.positionReached(lettersPosition, player.markers).toString();
                var mapLetter = document.querySelector(".objective-letter[data-position=\"".concat(lettersPosition, "\"]"));
                var panelLetter = document.querySelector(".letter[data-player-id=\"".concat(player.id, "\"][data-position=\"").concat(lettersPosition, "\"]"));
                if (mapLetter) {
                    mapLetter.dataset.reached = reached;
                }
                if (panelLetter) {
                    panelLetter.dataset.reached = reached;
                }
            });
        }
    };
    GetOnBoard.prototype.setObjectivesCounters = function (playerId, scoreSheet) {
        if (playerId === this.getPlayerId()) {
            [1, 2].forEach(function (objectiveNumber) {
                var span = document.getElementById("common-objective-".concat(objectiveNumber, "-counter"));
                var objective = COMMON_OBJECTIVES[Number(span.dataset.type)];
                var checked = 0;
                switch (objective[0]) {
                    case 20: //OLD_LADY
                        checked = scoreSheet.oldLadies.checked;
                        break;
                    case 30: //STUDENT
                        checked = scoreSheet.students.checkedStudents;
                        break;
                    case 40: //TOURIST
                        checked = scoreSheet.tourists.checkedTourists.reduce(function (a, b) { return a + b; }, 0);
                        break;
                    case 50: //LOVER_LIGHT
                        checked = scoreSheet.lovers.checkedLoversLight.reduce(function (a, b) { return a + b; }, 0) + scoreSheet.lovers.checkedLoversDark.reduce(function (a, b) { return a + b; }, 0);
                        break;
                    case 41: //MONUMENT_LIGHT
                        checked = scoreSheet.tourists.checkedMonumentsLight;
                        break;
                    case 42: //MONUMENT_DARK
                        checked = scoreSheet.tourists.checkedMonumentsDark;
                        break;
                }
                span.innerHTML = checked.toString();
                span.dataset.reached = (checked >= objective[1]).toString();
            });
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
        var eliminationWarning = route.isElimination /* && args.possibleRoutes.some(r => !r.isElimination)*/;
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
        this.ajaxcall("/getonboardparisrome/getonboardparisrome/".concat(action, ".html"), data, this, function () { });
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
            ['revealPersonalObjective', 1],
            ['updateScoreSheet', 1],
            ['playerEliminated', 1],
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
        this.setObjectivesCounters(playerId, notif.args.scoreSheets.current);
    };
    GetOnBoard.prototype.notif_placedDeparturePawn = function (notif) {
        this.tableCenter.addDeparturePawn(notif.args.playerId, notif.args.position);
    };
    GetOnBoard.prototype.notif_placedRoute = function (notif) {
        var _this = this;
        var playerId = notif.args.playerId;
        this.tableCenter.addMarker(playerId, notif.args.marker);
        this.gamedatas.players[notif.args.playerId].markers.push(notif.args.marker);
        var player = this.gamedatas.players[notif.args.playerId];
        this.highlightObjectiveLetters(player);
        notif.args.zones.forEach(function (zone) { return _this.showZone(playerId, zone, notif.args.position); });
    };
    GetOnBoard.prototype.notif_confirmTurn = function (notif) {
        var _this = this;
        notif.args.markers.forEach(function (marker) { return _this.tableCenter.setMarkerValidated(notif.args.playerId, marker); });
    };
    GetOnBoard.prototype.notif_removeMarkers = function (notif) {
        var _this = this;
        notif.args.markers.forEach(function (marker) {
            _this.tableCenter.removeMarker(notif.args.playerId, marker);
            var markerIndex = _this.gamedatas.players[notif.args.playerId].markers.findIndex(function (m) { return m.from == marker.from && m.to == marker.to; });
            if (markerIndex !== -1) {
                _this.gamedatas.players[notif.args.playerId].markers.splice(markerIndex, 1);
            }
        });
        var player = this.gamedatas.players[notif.args.playerId];
        this.highlightObjectiveLetters(player);
    };
    GetOnBoard.prototype.notif_playerEliminated = function (notif) {
        var playerId = Number(notif.args.who_quits);
        this.setNewScore(playerId, 0);
        this.eliminatePlayer(playerId);
    };
    GetOnBoard.prototype.notif_flipObjective = function (notif) {
        document.getElementById("common-objective-".concat(notif.args.objective.id)).dataset.side = '1';
    };
    GetOnBoard.prototype.notif_revealPersonalObjective = function (notif) {
        var playerId = notif.args.playerId;
        var player = this.gamedatas.players[playerId];
        player.personalObjective = notif.args.personalObjective;
        player.personalObjectiveLetters = notif.args.personalObjectiveLetters;
        player.personalObjectivePositions = notif.args.personalObjectivePositions;
        this.showPersonalObjective(playerId);
        this.highlightObjectiveLetters(player);
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
                if (args.objectiveLetters && args.objectiveLetters[0] != '<') {
                    args.objectiveLetters = "<strong>".concat(args.objectiveLetters, "</strong>");
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
    return declare("bgagame.getonboardparisrome", ebg.core.gamegui, new GetOnBoard());
});
