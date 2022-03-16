
class TableCenter {

    constructor(private game: GetOnBoardGame) {

        // TODO TEMP
        const center = document.getElementById('center');

        dojo.place(`<div id="departures"></div>`, center);
        Object.keys((game as any).gamedatas.TODO_TEMP_MAP_POSITIONS).forEach(key => {
            const position = Number(key);
            const elements = (game as any).gamedatas.TODO_TEMP_MAP_POSITIONS[position];

            const departure = elements.some(element => element >= 1 && element <= 12);

            if (departure) {
                dojo.place(`<button id="position${position}-placeDeparturePawn" class="bgabutton bgabutton_blue disabled">Start at ${position}</button>`, `departures`);
                document.getElementById(`position${position}-placeDeparturePawn`).addEventListener('click', () => this.game.placeDeparturePawn(position));
            }
        });

        Object.keys((game as any).gamedatas.MAP_ROUTES).forEach(key => {
            const position = Number(key);
            const destinations = (game as any).gamedatas.MAP_ROUTES[position];

            dojo.place(`<div id="position${position}"></div>`, center);

            destinations.forEach(destination => {
                let label = '';
                const elements = (game as any).gamedatas.TODO_TEMP_MAP_POSITIONS[position];

                if (elements.some(element => element == 0)) {
                    label += '🟢';
                }
                if (elements.some(element => element == 20)) {
                    label += '👵';
                }
                if (elements.some(element => element == 30)) {
                    label += '🎓';
                }
                if (elements.some(element => element == 32)) {
                    label += '🏫';
                }
                if (elements.some(element => element == 40)) {
                    label += '🕶';
                }
                if (elements.some(element => element == 41 || element == 42)) {
                    label += '🗼';
                }
                if (elements.some(element => element == 50)) {
                    label += '🕴';
                }
                if (elements.some(element => element == 51)) {
                    label += '🏢';
                }

                if (elements.some(element => [35, 45, 46, 55].includes(element))) {
                    label += '★';
                }


                dojo.place(`<button id="position${position}-placeRoute-to${destination}" class="bgabutton bgabutton_blue placeRoute-button disabled">${label}</button>`, `position${position}`);
                //dojo.place(`<button id="position${position}-placeRoute-to${destination}" class="bgabutton bgabutton_blue placeRoute-button disabled">${position} - ${destination}</button>`, `position${position}`);
                document.getElementById(`position${position}-placeRoute-to${destination}`).addEventListener('click', () => this.game.placeRoute(position, destination));
            });
        });
        // TODO TEMP
    }
}