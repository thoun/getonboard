
class TableCenter {

    constructor(private game: GetOnBoardGame) {

        // TODO TEMP
        const center = document.getElementById('center');
        Object.keys((game as any).gamedatas.MAP_ROUTES).forEach(key => {
            const position = Number(key);
            const destinations = (game as any).gamedatas.MAP_ROUTES[position];

            dojo.place(`<div id="position${position}"></div>`, center);
            dojo.place(`<button id="position${position}-placeDeparturePawn" class="bgabutton bgabutton_blue disabled">&gt; ${position}</button>`, `position${position}`);
            document.getElementById(`position${position}-placeDeparturePawn`).addEventListener('click', () => this.game.placeDeparturePawn(position));

            destinations.forEach(destination => {
                dojo.place(`<button id="position${position}-placeRoute-to${destination}" class="bgabutton bgabutton_blue placeRoute-button disabled">${position} - ${destination}</button>`, `position${position}`);
                document.getElementById(`position${position}-placeRoute-to${destination}`).addEventListener('click', () => this.game.placeRoute(position, destination));
            });
        });
        // TODO TEMP
    }
}