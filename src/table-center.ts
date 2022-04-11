
class TableCenter {

    constructor(private game: GetOnBoardGame, private gamedatas: GetOnBoardGamedatas) {
        const map = document.getElementById('map');
        map.dataset.size = gamedatas.map;
        const mapElements = document.getElementById('map-elements');

        // intersections
        Object.keys(gamedatas.MAP_POSITIONS).forEach(key => {
            const position = Number(key);
            const elements = gamedatas.MAP_POSITIONS[position];
            const departure = elements.find(element => element >= 1 && element <= 12);
            const coordinates = this.getCoordinatesFromPosition(position);

            let html = `<div id="intersection${position}" class="intersection ${elements.some(element => element == 0) ? 'green-light' : ''}`;
            if (departure > 0) {
                html += ` departure" data-departure=${departure}`;
            }
            html += `" style="left: ${coordinates[0]}px; top: ${coordinates[1]}px;"></div>`;
            dojo.place(html, mapElements);
            
            if (departure > 0) {
                document.getElementById(`intersection${position}`).addEventListener('click', () => this.game.placeDeparturePawn(position));
            }
        });

        // routes
        Object.keys(gamedatas.MAP_ROUTES).forEach(key => {
            const position = Number(key);
            const destinations = gamedatas.MAP_ROUTES[position];

            destinations.forEach(destination => {
                const coordinates = this.getCoordinatesFromPositions(position, destination);

                let html = `<div id="route${position}-${destination}" class="route" style="left: ${coordinates[0]}px; top: ${coordinates[1]}px;" data-direction="${Math.abs(position-destination) <= 1 ? 0 : 1}"></div>`;
                dojo.place(html, mapElements);
                document.getElementById(`route${position}-${destination}`).addEventListener('click', () => this.game.placeRoute(position, destination));
            });
        });

        // departure pawns
        Object.values(gamedatas.players).filter(player => player.departurePosition).forEach(player => this.addDeparturePawn(Number(player.id), player.departurePosition));

        // markers
        Object.values(gamedatas.players).forEach(player => player.markers.forEach(marker => this.addMarker(Number(player.id), marker)));

        // common objectives
        gamedatas.commonObjectives.forEach(commonObjective => this.placeCommonObjective(commonObjective));

        // personal objective
        const currentPlayer = gamedatas.players[this.game.getPlayerId()];
        currentPlayer?.personalObjectivePositions.forEach(position => 
            dojo.place(`<div class="objective-letter" style="box-shadow: 0 0 5px 5px #${currentPlayer.color};"></div>`, `intersection${position}`)
        );

        // tickets
        this.setRound(gamedatas.validatedTickets, gamedatas.currentTicket, true);
    }

    public addDeparturePawn(playerId: number, position: number) {
        dojo.place(`<div id="departure-pawn-${playerId}" class="departure-pawn" style="background: #${this.game.getPlayerColor(playerId)};"></div>`, `intersection${position}`);
    }

    public addMarker(playerId: number, marker: PlacedRoute) {
        const min = Math.min(marker.from, marker.to);
        const max = Math.max(marker.from, marker.to);
        dojo.place(`<div id="marker-${playerId}-${min}-${max}" class="marker ${marker.validated ? '' : 'unvalidated'}" style="background: #${this.game.getPlayerColor(playerId)};"></div>`, `route${min}-${max}`);
        const ghost = document.getElementById(`ghost-marker-${min}-${max}`);
        ghost?.parentElement?.removeChild(ghost);
    }

    public setMarkerValidated(playerId: number, marker: PlacedRoute): void {
        const min = Math.min(marker.from, marker.to);
        const max = Math.max(marker.from, marker.to);
        document.getElementById(`marker-${playerId}-${min}-${max}`).classList.remove('unvalidated')
    }

    public removeMarker(playerId: number, marker: PlacedRoute) {
        const min = Math.min(marker.from, marker.to);
        const max = Math.max(marker.from, marker.to);
        const div = document.getElementById(`marker-${playerId}-${min}-${max}`);
        div?.parentElement.removeChild(div);
    }

    public addGhostMarker(route: PossibleRoute) {
        const min = Math.min(route.from, route.to);
        const max = Math.max(route.from, route.to);

        let ghostClass = '';
        if (route.isElimination) {
            ghostClass = 'elimination';
        } else if (route.useTurnZone) {
            ghostClass = 'turn-zone';
        } else if (route.trafficJam > 0) {
            ghostClass = 'traffic-jam';
        }

        dojo.place(`<div id="ghost-marker-${min}-${max}" class="ghost marker ${ghostClass}"></div>`, `route${min}-${max}`);
    }

    public removeGhostMarkers() {
        Array.from(document.getElementsByClassName('ghost')).forEach(element => element.parentElement?.removeChild(element));
    }

    private getCoordinatesFromNumberAndDigit(number: number, digit: number): number[] {
        if (this.gamedatas.map === 'big') {
            const space = 63.2;
            return [
                38 + space * number,
                179 + space * digit,
            ];
        } else if (this.gamedatas.map === 'small') {
            const space = 57.4;
            return [
                213 + space * digit,
                20 + space * number,
            ];
        }
    }


    private getCoordinatesFromPosition(position: number): number[] {
        const number = Math.floor(position / 10) - 1;
        const digit = (position % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit(number, digit);
    }

    private getCoordinatesFromPositions(from: number, to: number): number[] {
        const fromNumber = Math.floor(from / 10) - 1;
        const fromDigit = (from % 10) - 1;
        const toNumber = Math.floor(to / 10) - 1;
        const toDigit = (to % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit((fromNumber + toNumber) / 2, (fromDigit + toDigit) / 2);
    }

    public getSide(position: number): 'left' | 'right' {
        if (this.gamedatas.map === 'big') {
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        } else if (this.gamedatas.map === 'small') {
            // TODO handle angle
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        }
    }

    private placeCommonObjective(objective: CommonObjective) {
        dojo.place(`<div id="common-objective-${objective.id}" class="common-objective card-inner" data-side="${objective.completed ? '1' : '0'}">
            <div class="card-side front"></div>
            <div class="card-side back"></div>
        </div>`, `common-objective-slot-${objective.number}`);
    }

    public setRound(validatedTickets: number[], currentTicket: number, initialization: boolean = false) {
        const roundNumber = Math.min(12, validatedTickets.length + (!currentTicket ? 0 : 1));
        if (initialization) {
            for(let i=1; i<=12; i++) {
                const visible = i <= roundNumber;
                dojo.place(`<div id="ticket-${i}" class="ticket card-inner" data-side="${visible ? '1' : '0'}" data-ticket="${i === roundNumber ? currentTicket : 0}">
                    <div class="card-side front"></div>
                    <div class="card-side back"></div>
                </div>`, `ticket-slot-${visible ? 2 : 1}`);
            }
        } else {
            const roundTicketDiv = document.getElementById(`ticket-${roundNumber}`);
            roundTicketDiv.dataset.ticket = `${currentTicket}`;
            slideToObjectTicketSlot2(this.game, roundTicketDiv, `ticket-slot-2`, `rotateY(180deg)`);
            roundTicketDiv.dataset.side = `1`;
        }
    }
}