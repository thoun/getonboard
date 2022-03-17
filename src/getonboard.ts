declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;

const ANIMATION_MS = 500;

class GetOnBoard implements GetOnBoardGame {
    private gamedatas: GetOnBoardGamedatas;
    //private healthCounters: Counter[] = [];
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];

    constructor() {
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
            (this as any).dontPreloadImage(`map23.jpg`);
        } else {            
            (this as any).dontPreloadImage(`map45.jpg`);
        }

        log( "Starting game setup" );
        
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
    
    private onEnteringPlaceRoute(args: EnteringPlaceRouteArgs) {
        args.possibleDestinations.forEach(destination => {
            const min = Math.min(args.currentPosition, destination);
            const max = Math.max(args.currentPosition, destination);
            document.getElementById(`position${min}-placeRoute-to${max}`).classList.remove('disabled');
        });
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

        switch (stateName) {
            case 'placeRoute':                
                Array.from(document.getElementsByClassName('placeRoute-button')).forEach(element => element.classList.add('disabled'));
                break;
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

        switch (stateName) {
            /*case 'changeActivePlayerDie': case 'psychicProbeRollDie':
                this.setDiceSelectorVisibility(true);
                this.onEnteringPsychicProbeRollDie(args); // because it's multiplayer, enter action must be set here
                break;*/
        }

        if((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeDeparturePawn':
                    const placeDeparturePawnArgs = args as EnteringPlaceDeparturePawnArgs;
                    /*placeDeparturePawnArgs._private.tickets.forEach(ticket => 
                        (this as any).addActionButton(`placeDeparturePawn${ticket}_button`, dojo.string.substitute(_("Start at ${ticket}"), { ticket }), () => this.placeDeparturePawn(ticket))
                    );*/
                    placeDeparturePawnArgs._private.positions.forEach(position => 
                        document.getElementById(`position${position}-placeDeparturePawn`).classList.remove('disabled')
                    );
                    break;
                case 'placeRoute':
                    (this as any).addActionButton(`confirmTurn_button`, _("Confirm turn"), () => this.confirmTurn());
                    const placeRouteArgs = args as EnteringPlaceRouteArgs;
                    if (!placeRouteArgs.canConfirm) {
                        dojo.addClass(`confirmTurn_button`, `disabled`);
                    }
                    (this as any).addActionButton(`cancelLast_button`, _("Cancel last marker"), () => this.cancelLast(), null, null, 'grey');
                    (this as any).addActionButton(`resetTurn_button`, _("Reset the whole turn"), () => this.resetTurn(), null, null, 'grey');
                    if (!placeRouteArgs.canCancel) {
                        dojo.addClass(`cancelLast_button`, `disabled`);
                        dojo.addClass(`resetTurn_button`, `disabled`);
                    }
                    break;
            }

        }
    } 
    

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    private createPlayerPanels(gamedatas: GetOnBoardGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);  

            const eliminated = Number(player.eliminated) > 0;

            // health & energy counters
            let html = `<div class="counters">
                <div id="health-counter-wrapper-${player.id}" class="counter">
                    <div class="icon health"></div> 
                    <span id="health-counter-${player.id}"></span>
                </div>
                <div id="energy-counter-wrapper-${player.id}" class="counter">
                    <div class="icon energy"></div> 
                    <span id="energy-counter-${player.id}"></span>
                </div>`;
            html += `</div>`;
            dojo.place(html, `player_board_${player.id}`);

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
            dojo.place(`<div id="player_board_${player.id}_firstPlayerWrapper" class="firstPlayerWrapper"></div>`, `player_board_${player.id}`);
        });

        //(this as any).addTooltipHtmlToClass('shrink-ray-tokens', this.SHINK_RAY_TOKEN_TOOLTIP);
        //(this as any).addTooltipHtmlToClass('poison-tokens', this.POISON_TOKEN_TOOLTIP);
    }

    private createPlayerTables(gamedatas: GetOnBoardGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private createPlayerTable(gamedatas: GetOnBoardGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        table.setRound(gamedatas.validatedTickets, gamedatas.currentTicket);
        this.playersTables.push(table);
    }

    /*private getPlayerTable(playerId: number): PlayerTable {
        return this.playerTables.find(playerTable => playerTable.playerId === Number(playerId));
    }*/

    public getZoom() {
        //return this.tableManager.zoom;
        return 1; // TODO
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
            slideToObjectAndAttach(this, firstPlayerTableToken, `player-table-${playerId}-first-player-wrapper`);
        } else {
            dojo.place('<div id="firstPlayerTableToken" class="first-player-token"></div>', `player-table-${playerId}-first-player-wrapper`);

            (this as any).addTooltipHtml('firstPlayerTableToken', _("Inspector pawn. This player is the first player of the round."));
        }
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
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
        if(!(this as any).checkAction('placeRoute')) {
            return;
        }

        this.takeAction('placeRoute', {
            from, 
            to,
        });
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
        if(!(this as any).checkAction('confirmTurn')) {
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
        if ((this as any).prefs[202]?.value === 2) {
            return;
        }

        const button = document.getElementById(buttonId);
 
        let actionTimerId = null;
        const _actionTimerLabel = button.innerHTML;
        let _actionTimerSeconds = time;
        const actionTimerFunction = () => {
          const button = document.getElementById(buttonId);
          if (button == null) {
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
            ['newRound', 1],
            ['newFirstPlayer', ANIMATION_MS],
            ['updateScoreSheet', 1], // TODO TEMP
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }

    notif_newRound(notif: Notif<NotifNewRoundArgs>) {
        console.log(notif.args);
        this.playersTables.forEach(playerTable => playerTable.setRound(notif.args.validatedTickets, notif.args.currentTicket));
    }

    notif_newFirstPlayer(notif: Notif<NotifNewFirstPlayerArgs>) {
        this.placeFirstPlayerToken(notif.args.playerId);
    }

    notif_updateScoreSheet(notif: Notif<NotifUpdateScoreSheetArgs>) {
        const playerId = notif.args.playerId;
        this.getPlayerTable(playerId).updateScoreSheet(notif.args.scoreSheets);
        (this as any).scoreCtrl[playerId]?.toValue(notif.args.scoreSheets.current.total);
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
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
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}