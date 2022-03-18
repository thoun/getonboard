
class TableCenter {

    constructor(private game: GetOnBoardGame, private gamedatas: GetOnBoardGamedatas) {
        const map = document.getElementById('map');
        map.dataset.size = gamedatas.map;

        // intersections
        Object.keys(gamedatas.MAP_POSITIONS).forEach(key => {
            const position = Number(key);
            const elements = gamedatas.MAP_POSITIONS[position];
            const departure = elements.find(element => element >= 1 && element <= 12);
            const coordinates = this.getCoordinatesFromPosition(position);

            let html = `<div id="intersection${position}" class="intersection`;
            if (departure > 0) {
                html += ` departure" data-departure=${departure}`;
            }
            html += `" style="top: ${coordinates[0]}px; left: ${coordinates[1]}px;"></div>`;
            dojo.place(html, map);
            
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
                let html = `<div id="route${position}-${destination}" class="route" style="top: ${coordinates[0]}px; left: ${coordinates[1]}px;"></div>`;
                dojo.place(html, map);
                document.getElementById(`route${position}-${destination}`).addEventListener('click', () => this.game.placeRoute(position, destination));
            });
        });

        // departure pawns
        Object.values(gamedatas.players).filter(player => player.departurePosition).forEach(player => this.addDeparturePawn(Number(player.id), player.departurePosition));

        // markers
        Object.values(gamedatas.players).forEach(player => player.markers.forEach(marker => this.addMarker(Number(player.id), marker)));
    }

    public addDeparturePawn(playerId: number, position: number) {
        dojo.place(`<div id="departure-pawn-${playerId}" class="departure-pawn" style="background: #${this.game.getPlayerColor(playerId)};"></div>`, `intersection${position}`);
    }

    public addMarker(playerId: number, marker: PlacedRoute) {
        const min = Math.min(marker.from, marker.to);
        const max = Math.max(marker.from, marker.to);
        dojo.place(`<div id="marker-${playerId}-${min}-${max}" class="marker ${marker.validated ? '' : 'unvalidated'}" style="background: #${this.game.getPlayerColor(playerId)};"></div>`, `route${min}-${max}`);
    }

    private getCoordinatesFromPosition(position: number): number[] {
        const digit = (position % 10) - 1;
        const number = Math.floor(position / 10) - 1;
        const space = 65;
        if (this.gamedatas.map === 'big') {
            return [
                165 + space * digit,
                26 + space * number,
            ];
        } else if (this.gamedatas.map === 'small') {
            return [
                26 + space * number,
                165 + space * digit,
            ];
        }
    }

    private getCoordinatesFromPositions(from: number, to: number): number[] {
        const fromDigit = (from % 10) - 1;
        const fromNumber = Math.floor(from / 10) - 1;
        const toDigit = (to % 10) - 1;
        const toNumber = Math.floor(to / 10) - 1;
        const space = 65;
        if (this.gamedatas.map === 'big') {
            return [
                165 + space * (fromDigit + toDigit)/2,
                26 + space * (fromNumber + toNumber)/2,
            ];
        } else if (this.gamedatas.map === 'small') {
            return [
                26 + space * (fromNumber + toNumber)/2,
                165 + space * (fromDigit + toDigit)/2,
            ];
        }
    }
}