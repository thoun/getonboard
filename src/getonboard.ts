declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const ANIMATION_MS = 500;

const ZOOM_LEVELS = [0.5, 0.625, 0.75, 0.875, 1];
const ZOOM_LEVELS_MARGIN = [-100, -60, -33, -14, 0];
const LOCAL_STORAGE_ZOOM_KEY = 'GetOnBoard-zoom';

function formatTextIcons(rawText: string) {
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

class GetOnBoard implements GetOnBoardGame {
    public zoom: number = 1;

    private gamedatas: GetOnBoardGamedatas;
    //private healthCounters: Counter[] = [];
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private registeredTablesByPlayerId: PlayerTable[][] = [];
    private roundNumberCounter: Counter;

    constructor() {
        const zoomStr = localStorage.getItem(LOCAL_STORAGE_ZOOM_KEY);
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

    public setup(gamedatas: GetOnBoardGamedatas) {
        const players = Object.values(gamedatas.players);
        // ignore loading of some pictures
        if (players.length > 3) {
            (this as any).dontPreloadImage(`map-small.jpg`);
        } else {
            (this as any).dontPreloadImage(`map-big.jpg`);
        }

        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        log('gamedatas', gamedatas);
        this.createPlayerPanels(gamedatas); 
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        this.createPlayerJumps(gamedatas);

        this.placeFirstPlayerToken(gamedatas.firstPlayerTokenPlayerId);
        document.getElementById('round-panel').innerHTML = `${_('Round')}&nbsp;<span id="round-number-counter"></span>&nbsp;/&nbsp;12`;
        this.roundNumberCounter = new ebg.counter();
        this.roundNumberCounter.create(`round-number-counter`);
        this.roundNumberCounter.setValue(gamedatas.roundNumber);

        this.setupNotifications();

        try {
            (document.getElementById('preference_control_203').closest(".preference_choice") as HTMLDivElement).style.display = 'none';
        } catch (e) {}

        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        if (this.zoom !== 1) {
            this.setZoom(this.zoom);
        }

        this.addTooltips();

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        switch (stateName) {
            case 'placeRoute':
                this.onEnteringPlaceRoute(args.args);
                break;
        }
    }
    
    private setGamestateDescription(property: string = '') {
        const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = `${originalState['description' + property]}`; 
        this.gamedatas.gamestate.descriptionmyturn = `${originalState['descriptionmyturn' + property]}`;
        (this as any).updatePageTitle();
    }
    
    private onEnteringPlaceRoute(args: EnteringPlaceRouteArgs) {
        if (args.canConfirm) {
            this.setGamestateDescription('Confirm');
        }

        if ((this as any).isCurrentPlayerActive()) {
            args.possibleRoutes.forEach(route => this.tableCenter.addGhostMarker(route));
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'placeDeparturePawn':
                this.onLeavingPlaceDeparturePawn();
                break;
            case 'placeRoute':                
                this.onLeavingPlaceRoute();
                break;
        }
    }

    private onLeavingPlaceDeparturePawn() {
        Array.from(document.getElementsByClassName('intersection')).forEach(element => element.classList.remove('selectable'));
    }
    
    private onLeavingPlaceRoute() {
        if ((this as any).isCurrentPlayerActive()) {
            this.tableCenter.removeGhostMarkers();
        }
    }
    
    /*private onLeavingStepEvolution() {
            const playerId = this.getPlayerId();
            this.getPlayerTable(playerId)?.unhighlightHiddenEvolutions();
    }*/

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeDeparturePawn':
                    const placeDeparturePawnArgs = args as EnteringPlaceDeparturePawnArgs;
                    placeDeparturePawnArgs._private.positions.forEach((position, index) => {
                        document.getElementById(`intersection${position}`).classList.add('selectable');
                        
                        const ticketDiv = `<div class="ticket" data-ticket="${placeDeparturePawnArgs._private.tickets[index]}"></div>`;
                        (this as any).addActionButton(`placeDeparturePawn${position}_button`, dojo.string.substitute(_("Start at ${ticket}"), {ticket: ticketDiv}), () => this.placeDeparturePawn(position));
                    });
                    break;
                case 'placeRoute':
                    (this as any).addActionButton(`confirmTurn_button`, _("Confirm turn"), () => this.confirmTurn());
                    const placeRouteArgs = args as EnteringPlaceRouteArgs;
                    if (placeRouteArgs.canConfirm) {
                        this.startActionTimer(`confirmTurn_button`, 8);
                    } else {
                        dojo.addClass(`confirmTurn_button`, `disabled`);
                    }
                    (this as any).addActionButton(`cancelLast_button`, _("Cancel last marker"), () => this.cancelLast(), null, null, 'gray');
                    (this as any).addActionButton(`resetTurn_button`, _("Reset the whole turn"), () => this.resetTurn(), null, null, 'gray');
                    if (!placeRouteArgs.canCancel) {
                        dojo.addClass(`cancelLast_button`, `disabled`);
                        dojo.addClass(`resetTurn_button`, `disabled`);
                    }
                    break;
            }

        } else {
            this.onLeavingPlaceDeparturePawn();
        }
    } 
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayerColor(playerId: number): string {
        return this.gamedatas.players[playerId].color;
    }

    private setZoom(zoom: number = 1) {
        this.zoom = zoom;
        localStorage.setItem(LOCAL_STORAGE_ZOOM_KEY, ''+this.zoom);
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom);
        dojo.toggleClass('zoom-in', 'disabled', newIndex === ZOOM_LEVELS.length - 1);
        dojo.toggleClass('zoom-out', 'disabled', newIndex === 0);

        const div = document.getElementById('full-table');
        if (zoom === 1) {
            div.style.transform = '';
            div.style.margin = '';
        } else {
            div.style.transform = `scale(${zoom})`;
            div.style.margin = `0 ${ZOOM_LEVELS_MARGIN[newIndex]}% ${(1-zoom)*-100}% 0`;
        }

        document.getElementById('zoom-wrapper').style.height = `${div.getBoundingClientRect().height}px`;
    }

    public zoomIn() {
        if (this.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) + 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    public zoomOut() {
        if (this.zoom === ZOOM_LEVELS[0]) {
            return;
        }
        const newIndex = ZOOM_LEVELS.indexOf(this.zoom) - 1;
        this.setZoom(ZOOM_LEVELS[newIndex]);
    }

    private createPlayerPanels(gamedatas: GetOnBoardGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);
            const eliminated = Number(player.eliminated) > 0;

            if (playerId === this.getPlayerId()) {
                let html = `
                <div class="personal-objective-label">${_("Your personal objective:")}</div>
                <div id="personal-objective-wrapper" data-expanded="${((this as any).prefs[203]?.value != 2).toString()}">
                    <div class="personal-objective collapsed">
                        ${player.personalObjectiveLetters.map(letter => `<div class="letter">${letter}</div>`).join('')}
                    </div>
                    <div class="personal-objective expanded ${gamedatas.map}" data-type="${player.personalObjective}"></div>
                    <div id="toggle-objective-expand" class="arrow"></div>
                </div>`;
                dojo.place(html, `player_board_${player.id}`);

                document.getElementById('toggle-objective-expand').addEventListener('click', () => {
                    const wrapper = document.getElementById(`personal-objective-wrapper`);
                    const expanded = wrapper.dataset.expanded === 'true';
                    wrapper.dataset.expanded = (!expanded).toString();

                    const select = document.getElementById('preference_control_203') as HTMLSelectElement;
                    select.value = expanded ? '2' : '1';
                    var event = new Event('change');
                    select.dispatchEvent(event);
                });
            }

            if (eliminated) {
                setTimeout(() => this.eliminatePlayer(playerId), 200);
            }

            // first player token
            dojo.place(`<div id="player_board_${player.id}_firstPlayerWrapper" class="firstPlayerWrapper"></div>`, `player_board_${player.id}`);
        });

    }

    private getOrderedPlayers(gamedatas: GetOnBoardGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerTables(gamedatas: GetOnBoardGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: GetOnBoardGamedatas, playerId: number) {
        const table = new PlayerTable(gamedatas.players[playerId]);
        table.setRound(gamedatas.validatedTickets, gamedatas.currentTicket);
        this.playersTables.push(table);
        this.registeredTablesByPlayerId[playerId] = [table];
    }

    private createPlayerJumps(gamedatas: GetOnBoardGamedatas) {
        dojo.place(`
        <div id="jump-toggle" class="jump-link toggle">
            ⇔
        </div>
        <div id="jump-0" class="jump-link">
            <div class="eye"></div> ${gamedatas.map === 'big' ? 'London' : 'New-York'}
        </div>`, `jump-controls`);
        document.getElementById(`jump-toggle`).addEventListener('click', () => this.jumpToggle());
        document.getElementById(`jump-0`).addEventListener('click', () => this.jumpToPlayer(0));
        
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => {
            dojo.place(`<div id="jump-${player.id}" class="jump-link" style="color: #${player.color}; border-color: #${player.color};"><div class="eye" style="background: #${player.color};"></div> ${player.name}</div>`, `jump-controls`);
            document.getElementById(`jump-${player.id}`).addEventListener('click', () => this.jumpToPlayer(Number(player.id)));	
        });

        const jumpDiv = document.getElementById(`jump-controls`);
        jumpDiv.style.marginTop = `-${Math.round(jumpDiv.getBoundingClientRect().height / 2)}px`;
    }
    
    private jumpToggle(): void {
        document.getElementById(`jump-controls`).classList.toggle('folded');
    }
    
    private jumpToPlayer(playerId: number): void {
        const elementId = playerId === 0 ? `map` : `player-table-${playerId}`;
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    private placeFirstPlayerToken(playerId: number) {
        const firstPlayerBoardToken = document.getElementById('firstPlayerBoardToken');
        if (firstPlayerBoardToken) {
            slideToObjectAndAttach(this, firstPlayerBoardToken, `player_board_${playerId}_firstPlayerWrapper`);
        } else {
            dojo.place('<div id="firstPlayerBoardToken" class="first-player-token"></div>', `player_board_${playerId}_firstPlayerWrapper`);

            (this as any).addTooltipHtml('firstPlayerBoardToken', _("Inspector pawn. This player is the first player of the round."));
        }

        const firstPlayerTableToken = document.getElementById('firstPlayerTableToken');
        if (firstPlayerTableToken) {
            slideToObjectAndAttach(this, firstPlayerTableToken, `player-table-${playerId}-first-player-wrapper`, this.zoom);
        } else {
            dojo.place('<div id="firstPlayerTableToken" class="first-player-token"></div>', `player-table-${playerId}-first-player-wrapper`);

            (this as any).addTooltipHtml('firstPlayerTableToken', _("Inspector pawn. This player is the first player of the round."));
        }
    }

    private getTooltip(element: number) {
        switch (element) {
            case 0: return '[GreenLight] : ' + _("If your route ends at an intersection with a [GreenLight], you place an additional marker.");
            case 1: return _("<strong>Number:</strong> Possible starting point. You choose between 2 numbers at the beginning of the game to place your Departure Pawn.");
            case 20: return '[OldLady] : ' + _("When a marker reach an [OldLady], check a box on the [OldLady] zone. Add the number next to each checked box at the end.");
            case 30: return '[Student] : ' + _("When a marker reach an [Student], check a box on the [Student] zone. Multiply [Student] with [School] at the end.");
            case 32: return '[School] : ' + _("When a marker reach a [School], check a box on the [School] zone. Multiply [Student] with [School] at the end.") + `<br><i>${_("If the [School] is marked with a Star, write the number of [Student] you have checked when a marker reach it.")}</i>`;
            case 40: return '[Tourist] : ' + _("When a marker reach a [Tourist], check a box on the first available row on the [Tourist] zone. You will score when you drop the [Tourist] to [MonumentLight]/[MonumentDark]. If the current row is full and you didn't reach [MonumentLight]/[MonumentDark], nothing happens.");
            case 41: return '[MonumentLight][MonumentDark] : ' +  _("When a marker reach [MonumentLight]/[MonumentDark], write the score on the column of the [Tourist] at the end of the current row. If the current row is empty, nothing happen.") + `<br><i>${_("If [MonumentLight]/[MonumentDark] is marked with a Star, write the number of [Tourist] you have checked when a marker reach it.")}</i>`;
            case 50: return '[Businessman] : ' + _("When a marker reach [Businessman], check a box on the first available row on the [Businessman] zone. You will score when you drop the [Businessman] to [Office]. If the current row is full and you didn't reach [Office], nothing happens.");
            case 51: return '[Office] : ' + _("When a marker reach [Office], write the score on the column of the [Businessman] at the end of the current row, and check the associated symbol ([OldLady], [Tourist] or [Student]) as if you reached it with a marker. If the current row is empty, nothing happen.") + `<br><i>${_("If the [Office] is marked with a Star, write the number of [Businessman] you have checked when a marker reach it.")}</i>`;
            case 90: return _("<strong>Common Objective:</strong> Score 10 points when you complete the objective, or 6 points if another player completed it on a previous round.");
            case 91: return _("<strong>Personal Objective:</strong> Score 10 points when your markers link the 3 Letters of your personal objective.");
            case 92: return _("<strong>Turn Zone:</strong> If you chose to change a turn into a straight line or a straight line to a turn, check a box on the Turn Zone. The score here is negative, and you only have 5 of them!");
            case 93: return _("<strong>Traffic Jam:</strong> For each marker already in place when you add a marker on a route, check a box on the Turn Zone. If the road is black, check an extra box. The score here is negative!");
            case 94: return _("<strong>Total score:</strong> Sum of all green zone totals, with substraction of all red zone totals.");
            case 95: return _("<strong>Tickets:</strong> The red check indicates the current round ticket. It defines the shape of the route you have to place. The black checks indicates the past rounds.");
            case 97: return _("<strong>Letter:</strong> Used to define your personal objective.");

        }
    }

    private addTooltips() {
        document.querySelectorAll(`[data-tooltip]`).forEach((element: HTMLElement) => {
            const tooltipsIds = JSON.parse(element.dataset.tooltip);
            let tooltip = ``;
            tooltipsIds.forEach(id => tooltip += `<div class="tooltip-section">${formatTextIcons(this.getTooltip(id))}</div>`);
            (this as any).addTooltipHtml(element.id, tooltip);
        });
    }
    
    private eliminatePlayer(playerId: number) {
        this.gamedatas.players[playerId].eliminated = 1;
        document.getElementById(`overall_player_board_${playerId}`).classList.add('eliminated-player');
        dojo.addClass(`player-table-${playerId}`, 'eliminated');
    }

    private cutZone(pipDiv: HTMLElement, zone: number) {
        const zoneDiv = pipDiv.querySelector(`[data-zone="${zone}"]`) as HTMLDivElement;
        const zoneStyle = window.getComputedStyle(zoneDiv);
        pipDiv.style.width = zoneStyle.width;
        pipDiv.style.height = zoneStyle.height;
        pipDiv.scrollTo(
            Number(zoneStyle.left.match(/\d+/)[0]), 
            77 + Number(zoneStyle.top.match(/\d+/)[0]),
        );
    }
    
    private isElementIntoViewport(el: HTMLElement) {
        var rect = el.getBoundingClientRect();
        var elemTop = rect.top;
        var elemBottom = rect.bottom;
    
        // Only completely visible elements return true:
        var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
        // Partially visible elements return true:
        //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
        return isVisible;
    }

    private showZone(playerId: number, zone: number, position: number) {
        const pipSide = this.tableCenter.getSide(position) === 'left' ? 'right' : 'left';
        (Array.from(document.getElementsByClassName('pips')) as HTMLDivElement[]).forEach(pipDiv => pipDiv.dataset.side = pipSide);

        const playerTableZoneDiv = document.getElementById(`player-table-${playerId}`).querySelector(`[data-zone="${zone}"]`) as HTMLDivElement;



        const pipId = `pip-${playerId}-${zone}-${position}`;
        dojo.place(`<div class="pip" id="${pipId}" style="border-color: #${this.getPlayerColor(playerId)}"></div>`,  zone >=6 ? 'pips-bottom' : 'pips-top');
        const pipDiv = document.getElementById(`pip-${playerId}-${zone}-${position}`);
        const pipTable = new PlayerTable(this.gamedatas.players[playerId], pipId, pipDiv);
        this.registeredTablesByPlayerId[playerId].push(pipTable);

        this.cutZone(pipDiv, zone);

        const originBR = playerTableZoneDiv.getBoundingClientRect();
        const pipBR = pipDiv.getBoundingClientRect();

        const deltaX = originBR.left - pipBR.left - 8;
        const deltaY = originBR.top - pipBR.top - 8;

        pipDiv.style.transform = `translate(${deltaX/this.zoom}px, ${deltaY/this.zoom}px)`;
        if (!this.isElementIntoViewport(playerTableZoneDiv)) {
            pipDiv.classList.add('animated');
            setTimeout(() => pipDiv.style.transform = '', 0);
        }

        setTimeout(() => {
            const index = this.registeredTablesByPlayerId[playerId].indexOf(pipTable);
            this.registeredTablesByPlayerId[playerId].splice(index, 1);
            pipDiv.parentElement?.removeChild(pipDiv);
        }, 3000);
    }

    public placeDeparturePawn(position: number) {
        if(!(this as any).checkAction('placeDeparturePawn')) {
            return;
        }

        this.takeAction('placeDeparturePawn', {
            position
        });
    }

    public placeRoute(from: number, to: number) {

        const args: EnteringPlaceRouteArgs = this.gamedatas.gamestate.args;
        const route = args.possibleRoutes?.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
        if (!route) {
            return;
        }

        if(!(this as any).checkAction('placeRoute')) {
            return;
        }

        const eliminationWarning = route.isElimination && args.possibleRoutes.some(r => !r.isElimination);

        if (eliminationWarning) {
            (this as any).confirmationDialog(_('Are you sure you want to place that marker? You will be eliminated!'), () => {
                this.takeAction('placeRoute', {
                    from, 
                    to,
                });
            });
        } else {
            this.takeAction('placeRoute', {
                from, 
                to,
            });
        }
    }

    public cancelLast() {
        if(!(this as any).checkAction('cancelLast')) {
            return;
        }

        this.takeAction('cancelLast');
    }

    public resetTurn() {
        if(!(this as any).checkAction('resetTurn')) {
            return;
        }

        this.takeAction('resetTurn');
    }

    public confirmTurn() {
        if(!(this as any).checkAction('confirmTurn', true)) {
            return;
        }

        this.takeAction('confirmTurn');
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/getonboard/getonboard/${action}.html`, data, this, () => {});
    }

    private startActionTimer(buttonId: string, time: number) {
        if (Number((this as any).prefs[202]?.value) === 2) {
            return;
        }

        const button = document.getElementById(buttonId);
 
        let actionTimerId = null;
        const _actionTimerLabel = button.innerHTML;
        let _actionTimerSeconds = time;
        const actionTimerFunction = () => {
          const button = document.getElementById(buttonId);
          if (button == null || button.classList.contains('disabled')) {
            window.clearInterval(actionTimerId);
          } else if (_actionTimerSeconds-- > 1) {
            button.innerHTML = _actionTimerLabel + ' (' + _actionTimerSeconds + ')';
          } else {
            window.clearInterval(actionTimerId);
            button.click();
          }
        };
        actionTimerFunction();
        actionTimerId = window.setInterval(() => actionTimerFunction(), 1000);
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        const notifs = [
            ['newRound', ANIMATION_MS],
            ['newFirstPlayer', ANIMATION_MS],
            ['placedRoute', ANIMATION_MS*2],
            ['confirmTurn', ANIMATION_MS],
            ['flipObjective', ANIMATION_MS],
            ['placedDeparturePawn', ANIMATION_MS],
            ['removeMarkers', 1],
            ['updateScoreSheet', 1],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_newRound(notif: Notif<NotifNewRoundArgs>) {
        this.tableCenter.setRound(notif.args.validatedTickets, notif.args.currentTicket);
        this.playersTables.forEach(playerTable => playerTable.setRound(notif.args.validatedTickets, notif.args.currentTicket));
        this.roundNumberCounter.toValue(notif.args.round);
    }

    notif_newFirstPlayer(notif: Notif<NotifNewFirstPlayerArgs>) {
        this.placeFirstPlayerToken(notif.args.playerId);
    }

    notif_updateScoreSheet(notif: Notif<NotifUpdateScoreSheetArgs>) {
        const playerId = notif.args.playerId;
        this.registeredTablesByPlayerId[playerId].forEach(table => table.updateScoreSheet(notif.args.scoreSheets));
        (this as any).scoreCtrl[playerId]?.toValue(notif.args.scoreSheets.current.total);
    }

    notif_placedDeparturePawn(notif: Notif<NotifPlacedDeparturePawnArgs>) {
        this.tableCenter.addDeparturePawn(notif.args.playerId, notif.args.position);
    }

    notif_placedRoute(notif: Notif<NotifPlacedRouteArgs>) {
        const playerId = notif.args.playerId;
        this.tableCenter.addMarker(playerId, notif.args.marker);

        notif.args.zones.forEach(zone => this.showZone(playerId, zone, notif.args.position));
    }

    notif_confirmTurn(notif: Notif<NotifConfirmTurnArgs>) {
        notif.args.markers.forEach(marker => this.tableCenter.setMarkerValidated(notif.args.playerId, marker));
    }

    notif_removeMarkers(notif: Notif<NotifConfirmTurnArgs>) {
        notif.args.markers.forEach(marker => this.tableCenter.removeMarker(notif.args.playerId, marker));
    }

    notif_playerEliminated(notif: Notif<any>) {
        const playerId = Number(notif.args.who_quits);
        (this as any).scoreCtrl[playerId]?.toValue(0);
        this.eliminatePlayer(playerId);
    }

    notif_flipObjective(notif: Notif<NotifFlipObjectiveArgs>) {
        document.getElementById(`common-objective-${notif.args.objective.id}`).dataset.side = '1';
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                if (args.shape && args.shape[0] != '<') {
                    args.shape = `<div class="shape" data-shape="${JSON.stringify(args.shape)}" data-step="${args.step}"></div>`
                }

                if (args.elements && typeof args.elements !== 'string') {
                    args.elements = args.elements.map(element => 
                        `<div class="map-icon" data-element="${element}"></div>`
                    ).join('');
                }
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}