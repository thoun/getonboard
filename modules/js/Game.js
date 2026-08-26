const BgaZoom = await globalThis.importEsmLib('bga-zoom', '1.x');
const BgaJumpTo = await globalThis.importEsmLib('bga-jump-to', '1.x');

class PlayerTableBlock {
    constructor(playerId) {
        this.playerId = playerId;
    }
    setContentAndValidation(id, content, unvalidated) {
        const div = document.getElementById(`player-table-${this.playerId}-${id}`);
        let contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        }
        else if (typeof content === 'number') {
            contentStr = '' + content;
        }
        div.innerHTML = contentStr;
        div.dataset.unvalidated = unvalidated.toString();
    }
}

class PlayerTableBusinessmenBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="businessmen-block-${playerId}" data-tooltip="[50,51]" class="businessmen block" data-zone="5">
                    <div id="player-table-${playerId}-businessmen-special" class="special"></div>`;
        for (let row = 1; row <= 3; row++) {
            for (let i = 1; i <= 3; i++) {
                html += `
                        <div id="player-table-${playerId}-businessmen-checkmark${row}-${i}" class="checkmark" data-row="${row}" data-number="${i}"></div>`;
            }
        }
        html += `
                    <div id="player-table-${playerId}-businessmen-subtotal1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${playerId}-businessmen-subtotal2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${playerId}-businessmen-subtotal3" class="subtotal" data-number="3"></div>
                    <div id="player-table-${playerId}-businessmen-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.businessmen;
        const validated = scoreSheets.validated.businessmen;
        this.setContentAndValidation(`businessmen-special`, current.specialOffice, current.specialOffice !== validated.specialOffice);
        for (let row = 1; row <= 3; row++) {
            for (let i = 1; i <= 3; i++) {
                this.setContentAndValidation(`businessmen-checkmark${row}-${i}`, current.checkedBusinessmen[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedBusinessmen[row - 1] >= i && validated.checkedBusinessmen[row - 1] < i);
            }
            this.setContentAndValidation(`businessmen-subtotal${row}`, current.subTotals[row - 1], current.subTotals[row - 1] != validated.subTotals[row - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation(`businessmen-total`, current.total, current.total != validated.total);
        }
    }
}

class PlayerTableCommonObjectivesBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="common-objectives-block-${playerId}" data-tooltip="[90]" class="common-objectives block">
            <div id="player-table-${playerId}-common-objectives-objective1" class="subtotal" data-number="1"></div>
            <div id="player-table-${playerId}-common-objectives-objective2" class="subtotal" data-number="2"></div>
            <div id="player-table-${playerId}-common-objectives-total" class="total"></div>
        </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.commonObjectives;
        const validated = scoreSheets.validated.commonObjectives;
        for (let i = 1; i <= 2; i++) {
            this.setContentAndValidation(`common-objectives-objective${i}`, current.subTotals[i - 1], current.subTotals[i - 1] != validated.subTotals[i - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation(`common-objectives-total`, current.total, current.total != validated.total);
        }
    }
}

class PlayerTableOldLadiesBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="old-ladies-block-${playerId}" data-tooltip="[20]" class="old-ladies block" data-zone="2">`;
        for (let i = 1; i <= 8; i++) {
            html += `
                <div id="player-table-${playerId}-old-ladies-checkmark${i}" class="checkmark" data-number="${i}"></div>
            `;
        }
        html += `        
                    <div id="player-table-${playerId}-old-ladies-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.oldLadies;
        const validated = scoreSheets.validated.oldLadies;
        for (let i = 1; i <= 8; i++) {
            this.setContentAndValidation(`old-ladies-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation(`old-ladies-total`, current.total, current.total !== validated.total);
        }
    }
}

class PlayerTablePersonalObjectiveBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="personal-objective-block-${playerId}" data-tooltip="[91]" class="personal-objective block">
            <div id="player-table-${playerId}-personal-objective-total" class="total"></div>
        </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.personalObjective;
        const validated = scoreSheets.validated.personalObjective;
        if (visibleScoring) {
            this.setContentAndValidation(`personal-objective-total`, current.total, current.total != validated.total);
        }
    }
}

class PlayerTableStudentsBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="students-block-${playerId}" data-tooltip="[30,32]" class="students block" data-zone="3">
                `;
        for (let i = 1; i <= 6; i++) {
            html += `
                    <div id="player-table-${playerId}-students-checkmark${i}" class="students checkmark" data-number="${i}"></div>`;
        }
        for (let i = 1; i <= 3; i++) {
            html += `
                    <div id="player-table-${playerId}-internships-checkmark${i}" class="internships checkmark" data-number="${i}"></div>`;
        }
        for (let i = 1; i <= 4; i++) {
            html += `
                    <div id="player-table-${playerId}-schools-checkmark${i}" class="schools checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${playerId}-students-special" class="special"></div>
                    <div id="player-table-${playerId}-students-subtotal" class="subtotal"></div>
                    <div id="player-table-${playerId}-students-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.students;
        const validated = scoreSheets.validated.students;
        for (let i = 1; i <= 6; i++) {
            this.setContentAndValidation(`students-checkmark${i}`, current.checkedStudents >= i ? '✔' : '', current.checkedStudents >= i && validated.checkedStudents < i);
        }
        for (let i = 1; i <= 3; i++) {
            this.setContentAndValidation(`internships-checkmark${i}`, current.checkedInternships >= i ? '✔' : '', current.checkedInternships >= i && validated.checkedInternships < i);
        }
        for (let i = 1; i <= 4; i++) {
            this.setContentAndValidation(`schools-checkmark${i}`, current.checkedSchools >= i ? '✔' : '', current.checkedSchools >= i && validated.checkedSchools < i);
        }
        this.setContentAndValidation(`students-special`, current.specialSchool, current.specialSchool !== validated.specialSchool);
        if (visibleScoring) {
            this.setContentAndValidation(`students-subtotal`, current.subTotal, current.subTotal !== validated.subTotal);
            this.setContentAndValidation(`students-total`, current.total, current.total !== validated.total);
        }
    }
}

class PlayerTableTouristsBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="tourists-block-${playerId}" data-tooltip="[40,41]" class="tourists block" data-zone="4">`;
        for (let i = 1; i <= 3; i++) {
            html += `
                    <div id="player-table-${playerId}-tourists-light-checkmark${i}" class="monument light checkmark" data-number="${i}"></div>`;
        }
        for (let i = 1; i <= 3; i++) {
            html += `
                    <div id="player-table-${playerId}-tourists-dark-checkmark${i}" class="monument dark checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${playerId}-tourists-specialLight" class="special" data-style="Light"></div>
                    <div id="player-table-${playerId}-tourists-specialDark" class="special" data-style="Dark"></div>
                    <div id="player-table-${playerId}-tourists-specialMax" class="special"></div>`;
        for (let row = 1; row <= 3; row++) {
            for (let i = 1; i <= 4; i++) {
                html += `
                        <div id="player-table-${playerId}-tourists-checkmark${row}-${i}" class="tourists checkmark" data-row="${row}" data-number="${i}"></div>`;
            }
        }
        html += ` 
                    <div id="player-table-${playerId}-tourists-subtotal1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${playerId}-tourists-subtotal2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${playerId}-tourists-subtotal3" class="subtotal" data-number="3"></div>
                    <div id="player-table-${playerId}-tourists-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.tourists;
        const validated = scoreSheets.validated.tourists;
        for (let i = 1; i <= 3; i++) {
            this.setContentAndValidation(`tourists-light-checkmark${i}`, current.checkedMonumentsLight >= i ? '✔' : '', current.checkedMonumentsLight >= i && validated.checkedMonumentsLight < i);
        }
        for (let i = 1; i <= 3; i++) {
            this.setContentAndValidation(`tourists-dark-checkmark${i}`, current.checkedMonumentsDark >= i ? '✔' : '', current.checkedMonumentsDark >= i && validated.checkedMonumentsDark < i);
        }
        this.setContentAndValidation(`tourists-specialLight`, current.specialMonumentLight, current.specialMonumentLight !== validated.specialMonumentLight);
        this.setContentAndValidation(`tourists-specialDark`, current.specialMonumentDark, current.specialMonumentDark !== validated.specialMonumentDark);
        if (visibleScoring) {
            this.setContentAndValidation(`tourists-specialMax`, current.specialMonumentMax, current.specialMonumentMax !== validated.specialMonumentMax);
        }
        for (let row = 1; row <= 3; row++) {
            for (let i = 1; i <= 4; i++) {
                this.setContentAndValidation(`tourists-checkmark${row}-${i}`, current.checkedTourists[row - 1] >= i ? '✔' : (current.subTotals[row - 1] ? '⎯⎯' : ''), current.checkedTourists[row - 1] >= i && validated.checkedTourists[row - 1] < i);
            }
            this.setContentAndValidation(`tourists-subtotal${row}`, current.subTotals[row - 1], current.subTotals[row - 1] != validated.subTotals[row - 1]);
        }
        if (visibleScoring) {
            this.setContentAndValidation(`tourists-total`, current.total, current.total != validated.total);
        }
    }
}

class PlayerTableTrafficJamBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="traffic-jam-block-${playerId}" data-tooltip="[93]" class="traffic-jam block" data-zone="7">`;
        for (let i = 1; i <= 19; i++) {
            html += `
                    <div id="player-table-${playerId}-traffic-jam-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${playerId}-traffic-jam-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.trafficJam;
        const validated = scoreSheets.validated.trafficJam;
        for (let i = 1; i <= 19; i++) {
            this.setContentAndValidation(`traffic-jam-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation(`traffic-jam-total`, -current.total, current.total !== validated.total);
        }
    }
}

class PlayerTableTurnZonesBlock extends PlayerTableBlock {
    constructor(playerId, scoreSheets, visibleScoring) {
        super(playerId);
        let html = `
        <div id="turn-zones-block-${playerId}" data-tooltip="[92]" class="turn-zones block" data-zone="6">`;
        for (let i = 1; i <= 5; i++) {
            html += `
                    <div id="player-table-${playerId}-turn-zones-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${playerId}-turn-zones-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);
        this.updateScoreSheet(scoreSheets, visibleScoring);
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        const current = scoreSheets.current.turnZones;
        const validated = scoreSheets.validated.turnZones;
        for (let i = 1; i <= 5; i++) {
            this.setContentAndValidation(`turn-zones-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }
        if (visibleScoring) {
            this.setContentAndValidation(`turn-zones-total`, -current.total, current.total !== validated.total);
        }
    }
}

class PlayerTable {
    constructor(game, player, id = player.id, insertIn = document.getElementById('full-table')) {
        this.playerId = id;
        const eliminated = Number(player.eliminated) > 0;
        let html = `
        <div id="player-table-${this.playerId}" class="player-table ${eliminated ? 'eliminated' : ''}" style="box-shadow: 0 0 3px 3px #${player.color};">
            <div id="player-table-${this.playerId}-top" data-tooltip="[95]" class="top" data-type="${player.sheetType}">
            `;
        for (let i = 1; i <= 12; i++) {
            html += `
                    <div id="player-table-${this.playerId}-top-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += ` 
            </div>
            <div id="player-table-${this.playerId}-main" class="main">
                <div id="player-table-${this.playerId}-total-score" data-tooltip="[94]" class="total score"></div>
            </div>
            <div class="name" style="color: #${player.color};">${player.name}</div>
            <div id="player-table-${this.playerId}-first-player-wrapper" class="first-player-wrapper"></div>
        </div>
        `;
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
    setRound(validatedTickets, currentTicket) {
        if (!currentTicket) {
            return;
        }
        for (let i = 1; i <= 12; i++) {
            this.setContentAndValidation(`top-checkmark${i}`, currentTicket === i || validatedTickets.includes(i) ? '✔' : '', currentTicket === i);
        }
    }
    updateScoreSheet(scoreSheets, visibleScoring) {
        this.oldLadies.updateScoreSheet(scoreSheets, visibleScoring);
        this.students.updateScoreSheet(scoreSheets, visibleScoring);
        this.tourists.updateScoreSheet(scoreSheets, visibleScoring);
        this.businessmen.updateScoreSheet(scoreSheets, visibleScoring);
        this.commonObjectives.updateScoreSheet(scoreSheets, visibleScoring);
        this.personalObjective.updateScoreSheet(scoreSheets, visibleScoring);
        this.turnZones.updateScoreSheet(scoreSheets, visibleScoring);
        this.trafficJam.updateScoreSheet(scoreSheets, visibleScoring);
        if (visibleScoring) {
            this.setContentAndValidation(`total-score`, scoreSheets.current.total, scoreSheets.current.total != scoreSheets.validated.total);
        }
    }
    setContentAndValidation(id, content, unvalidated) {
        const div = document.getElementById(`player-table-${this.playerId}-${id}`);
        let contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        }
        else if (typeof content === 'number') {
            contentStr = '' + content;
        }
        div.innerHTML = contentStr;
        div.dataset.unvalidated = unvalidated.toString();
    }
}

function slideToObjectAndAttach(game, object, destinationId, zoom = 1) {
    const destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(resolve => {
        const originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        const objectCR = object.getBoundingClientRect();
        const destinationCR = destination.getBoundingClientRect();
        const deltaX = destinationCR.left - objectCR.left;
        const deltaY = destinationCR.top - objectCR.top;
        const attachToNewParent = () => {
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
            object.style.transition = `transform 0.5s ease-in`;
            object.style.transform = `translate(${deltaX / zoom}px, ${deltaY / zoom}px)`;
            let securityTimeoutId = null;
            const transitionend = () => {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend);
                object.removeEventListener('transitioncancel', transitionend);
                resolve(true);
                if (securityTimeoutId) {
                    clearTimeout(securityTimeoutId);
                }
            };
            object.addEventListener('transitionend', transitionend);
            object.addEventListener('transitioncancel', transitionend);
            // security check : if transition fails, we force tile to destination
            securityTimeoutId = setTimeout(() => {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend);
                    object.removeEventListener('transitioncancel', transitionend);
                    resolve(true);
                }
            }, 700);
        }
    });
}
function slideToObjectTicketSlot2(game, object, destinationId, keepTransform) {
    const destination = document.getElementById(destinationId);
    if (destination.contains(object)) {
        return Promise.resolve(true);
    }
    return new Promise(resolve => {
        const originalZIndex = Number(object.style.zIndex);
        object.style.zIndex = '10';
        const slot1left = Number(window.getComputedStyle(document.getElementById('ticket-slot-1')).left.match(/\d+/)[0]);
        const slot2left = Number(window.getComputedStyle(document.getElementById('ticket-slot-2')).left.match(/\d+/)[0]);
        const deltaX = slot2left - slot1left;
        const attachToNewParent = () => {
            object.style.zIndex = originalZIndex ? '' + originalZIndex : 'unset';
            object.style.transform = keepTransform ?? 'unset';
            object.style.transition = 'unset';
            destination.appendChild(object);
        };
        if (document.visibilityState === 'hidden' || game.instantaneousMode) {
            // if tab is not visible, we skip animation (else they could be delayed or cancelled by browser)
            attachToNewParent();
        }
        else {
            object.style.transition = `transform 0.5s ease-in`;
            object.style.transform = `translateX(${deltaX}px) ${keepTransform ?? ''}`;
            let securityTimeoutId = null;
            const transitionend = () => {
                attachToNewParent();
                object.removeEventListener('transitionend', transitionend);
                object.removeEventListener('transitioncancel', transitionend);
                resolve(true);
                if (securityTimeoutId) {
                    clearTimeout(securityTimeoutId);
                }
            };
            object.addEventListener('transitionend', transitionend);
            object.addEventListener('transitioncancel', transitionend);
            // security check : if transition fails, we force tile to destination
            securityTimeoutId = setTimeout(() => {
                if (!destination.contains(object)) {
                    attachToNewParent();
                    object.removeEventListener('transitionend', transitionend);
                    object.removeEventListener('transitioncancel', transitionend);
                    resolve(true);
                }
            }, 700);
        }
    });
}

const COMMON_OBJECTIVES = [
    null,
    [20, 5],
    [30, 5],
    [40, 5],
    [50, 5],
    [41, 3],
    [42, 3],
];
class TableCenter {
    constructor(game, gamedatas) {
        this.game = game;
        this.gamedatas = gamedatas;
        const map = document.getElementById('map');
        map.dataset.size = gamedatas.map;
        const mapElements = document.getElementById('map-elements');
        // intersections
        Object.keys(gamedatas.MAP_POSITIONS).forEach(key => {
            const position = Number(key);
            const elements = gamedatas.MAP_POSITIONS[position];
            const tooltipsIds = [];
            if (elements.includes(0)) {
                tooltipsIds.push(0);
            }
            if (elements.some(element => element >= 1 && element <= 12)) {
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
            if (elements.some(element => element >= 97 && element <= 122)) {
                tooltipsIds.push(97);
            }
            const departure = elements.find(element => element >= 1 && element <= 12);
            const coordinates = this.getCoordinatesFromPosition(position);
            let html = `<div id="intersection${position}" class="intersection ${elements.some(element => element == 0) ? 'green-light' : ''}`;
            if (departure > 0) {
                html += ` departure" data-departure=${departure}`;
            }
            html += `" data-tooltip="${JSON.stringify(tooltipsIds)}" style="left: ${coordinates[0]}px; top: ${coordinates[1]}px;"></div>`;
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
                let html = `<div id="route${position}-${destination}" class="route" style="left: ${coordinates[0]}px; top: ${coordinates[1]}px;" data-direction="${Math.abs(position - destination) <= 1 ? 0 : 1}"></div>`;
                dojo.place(html, mapElements);
                document.getElementById(`route${position}-${destination}`).addEventListener('click', () => this.game.placeRoute(position, destination));
            });
        });
        // departure pawns
        Object.values(gamedatas.players).filter(player => player.departurePosition).forEach(player => this.addDeparturePawn(Number(player.id), player.departurePosition));
        // markers
        Object.values(gamedatas.players).forEach(player => player.markers.forEach(marker => this.addMarker(Number(player.id), marker)));
        const currentPlayer = gamedatas.players[this.game.getPlayerId()];
        // common objectives
        gamedatas.commonObjectives.forEach(commonObjective => this.placeCommonObjective(commonObjective, !!currentPlayer));
        // personal objective
        Object.keys(gamedatas.MAP_POSITIONS).filter(key => gamedatas.MAP_POSITIONS[key].some(element => element >= 97 && element <= 122)).forEach(position => 
        //currentPlayer?.personalObjectivePositions.forEach(position => 
        dojo.place(`<div class="objective-letter" data-position="${position}"></div>`, `intersection${position}`));
        // tickets
        this.setRound(gamedatas.validatedTickets, gamedatas.currentTicket, true);
        ['top', 'bottom', 'left', 'right'].forEach(side => dojo.place(`<div class="position-indicator ${side}"></div>`, 'map'));
    }
    addDeparturePawn(playerId, position) {
        dojo.place(`<div id="departure-pawn-${playerId}" class="departure-pawn"></div>`, `intersection${position}`);
        document.getElementById(`departure-pawn-${playerId}`).style.setProperty('--background', `#${this.game.getPlayerColor(playerId)}`);
    }
    addMarker(playerId, marker) {
        const min = Math.min(marker.from, marker.to);
        const max = Math.max(marker.from, marker.to);
        dojo.place(`<div id="marker-${playerId}-${min}-${max}" class="marker ${marker.validated ? '' : 'unvalidated'}" style="background: #${this.game.getPlayerColor(playerId)};"></div>`, `route${min}-${max}`);
        const ghost = document.getElementById(`ghost-marker-${min}-${max}`);
        ghost?.parentElement?.removeChild(ghost);
    }
    setMarkerValidated(playerId, marker) {
        const min = Math.min(marker.from, marker.to);
        const max = Math.max(marker.from, marker.to);
        document.getElementById(`marker-${playerId}-${min}-${max}`).classList.remove('unvalidated');
    }
    removeMarker(playerId, marker) {
        const min = Math.min(marker.from, marker.to);
        const max = Math.max(marker.from, marker.to);
        const div = document.getElementById(`marker-${playerId}-${min}-${max}`);
        div?.parentElement.removeChild(div);
    }
    addGhostMarker(route) {
        const min = Math.min(route.from, route.to);
        const max = Math.max(route.from, route.to);
        let ghostClass = '';
        if (route.isElimination) {
            ghostClass = 'elimination';
        }
        else if (route.useTurnZone) {
            ghostClass = 'turn-zone';
        }
        else if (route.trafficJam > 0) {
            ghostClass = 'traffic-jam';
        }
        dojo.place(`<div id="ghost-marker-${min}-${max}" class="ghost marker ${ghostClass}"></div>`, `route${min}-${max}`);
    }
    removeGhostMarkers() {
        Array.from(document.getElementsByClassName('ghost')).forEach(element => element.parentElement?.removeChild(element));
    }
    getCoordinatesFromNumberAndDigit(number, digit) {
        if (this.gamedatas.map === 'big') {
            const space = 63.2;
            return [
                38 + space * number,
                179 + space * digit,
            ];
        }
        else if (this.gamedatas.map === 'small') {
            const space = 57.4;
            return [
                213 + space * digit,
                20 + space * number,
            ];
        }
    }
    getCoordinatesFromPosition(position) {
        const number = Math.floor(position / 10) - 1;
        const digit = (position % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit(number, digit);
    }
    getCoordinatesFromPositions(from, to) {
        const fromNumber = Math.floor(from / 10) - 1;
        const fromDigit = (from % 10) - 1;
        const toNumber = Math.floor(to / 10) - 1;
        const toDigit = (to % 10) - 1;
        return this.getCoordinatesFromNumberAndDigit((fromNumber + toNumber) / 2, (fromDigit + toDigit) / 2);
    }
    getSide(position) {
        if (this.gamedatas.map === 'big') {
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        }
        else if (this.gamedatas.map === 'small') {
            // TODO handle angle
            return this.getCoordinatesFromPosition(position)[0] > 370 ? 'right' : 'left';
        }
    }
    placeCommonObjective(objective, isPlayer) {
        dojo.place(`<div id="common-objective-${objective.id}" class="common-objective card-inner" data-side="${objective.completed ? '1' : '0'}">
            <div class="card-side front"></div>
            <div class="card-side back"></div>
        </div>
        `, `common-objective-slot-${objective.number}`);
        const commonObjectiveInfos = COMMON_OBJECTIVES[objective.id];
        this.game.bga.gameui.addTooltipHtml(`common-objective-slot-${objective.number}`, `${this.game.getTooltip(90)}<br><br>${_("To complete this objective, you need to check ${number} ${element}").replace('${number}', `<strong>${commonObjectiveInfos[1]}</strong>`).replace('${element}', `<div class="map-icon" data-element="${commonObjectiveInfos[0]}"></div>`)}`);
        if (isPlayer) { // objective progress counter only if player is not a spectator
            dojo.place(`
            <div class="common-objective-counter"><span id="common-objective-${objective.number}-counter" data-type="${objective.id}">0</span>/${commonObjectiveInfos[1]}</div>
            `, `common-objective-slot-${objective.number}`);
        }
    }
    setRound(validatedTickets, currentTicket, initialization = false) {
        const roundNumber = Math.min(12, validatedTickets.length + (!currentTicket ? 0 : 1));
        if (initialization) {
            for (let i = 1; i <= 12; i++) {
                const visible = i <= roundNumber;
                dojo.place(`<div id="ticket-${i}" class="ticket card-inner" data-side="${visible ? '1' : '0'}" data-ticket="${i === roundNumber ? currentTicket : 0}">
                    <div class="card-side front"></div>
                    <div class="card-side back"></div>
                </div>`, `ticket-slot-${visible ? 2 : 1}`);
            }
        }
        else {
            const roundTicketDiv = document.getElementById(`ticket-${roundNumber}`);
            roundTicketDiv.dataset.ticket = `${currentTicket}`;
            slideToObjectTicketSlot2(this.game, roundTicketDiv, `ticket-slot-2`, `rotateY(180deg)`);
            roundTicketDiv.dataset.side = `1`;
        }
    }
}

/// <reference path="../../bga-framework.d.ts" />
/// <reference path="./types.d.ts" />
const ANIMATION_MS = 500;
const LOCAL_STORAGE_ZOOM_KEY = 'GetOnBoard-zoom';
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'GetOnBoard-jump-to-folded';
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
class Game {
    constructor(bga) {
        this.playersTables = [];
        this.registeredTablesByPlayerId = [];
        this.bga = bga;
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
    setup(gamedatas) {
        const players = Object.values(gamedatas.players);
        // ignore loading of some pictures
        if (players.length > 3) {
            this.bga.images.dontPreloadImage(`map-small-no-grid.jpg`);
        }
        else {
            this.bga.images.dontPreloadImage(`map-big-no-grid.jpg`);
        }
        this.bga.images.dontPreloadImage(`map-small.jpg`);
        this.bga.images.dontPreloadImage(`map-big.jpg`);
        this.bga.images.dontPreloadImage(`map-small-no-grid-no-building.jpg`);
        this.bga.images.dontPreloadImage(`map-big-no-grid-no-building.jpg`);
        this.bga.images.dontPreloadImage(`map-small-no-building.jpg`);
        this.bga.images.dontPreloadImage(`map-big-no-building.jpg`);
        console.log("Starting game setup");
        this.gamedatas = gamedatas;
        console.log('gamedatas', gamedatas);
        if (Number(gamedatas.gamestate.id) >= 90) { // score or end. before createPlayerTables so full score is written if game has ended even if hide score is on
            this.onEnteringShowScore();
        }
        this.createPlayerPanels(gamedatas);
        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerTables(gamedatas);
        const entries = [
            new BgaJumpTo.Entry(gamedatas.map === 'big' ? 'London' : 'New-York', 'map', {
                color: '#000000',
                backgroundImage: `url('${this.bga.images.getImgUrl(gamedatas.map === 'big' ? 'map-big.jpg' : 'map-small.jpg')}')`,
                backgroundSize: 'cover',
            }),
            ...BgaJumpTo.BgaPlayerEntries(this.bga, {
                playerOrder: this.getOrderedPlayers(gamedatas).map(player => player.id),
                entrySettings: (playerId) => ({ id: `bga-jump-to_player-table-${playerId}` }),
            }),
        ];
        new BgaJumpTo.Manager({
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            entries,
        });
        Object.values(gamedatas.players).forEach(player => {
            this.highlightObjectiveLetters(player);
            this.setObjectivesCounters(Number(player.id), player.scoreSheets.current);
        });
        this.placeFirstPlayerToken(gamedatas.firstPlayerTokenPlayerId);
        document.getElementById('round-panel').innerHTML = `${_('Round')}&nbsp;<span id="round-number-counter"></span>&nbsp;/&nbsp;12`;
        this.roundNumberCounter = new ebg.counter();
        this.roundNumberCounter.create(`round-number-counter`);
        this.roundNumberCounter.setValue(gamedatas.roundNumber);
        this.zoomManager = new BgaZoom.Manager({
            element: document.getElementById('full-table'),
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            onZoomChange: (zoom) => document.getElementById('map').classList.toggle('hd', zoom > 1)
        });
        this.setupNotifications();
        this.setupPreferences();
        this.addTooltips();
        console.log("Ending game setup");
    }
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState(stateName, args) {
        console.log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            case 'placeRoute':
                this.onEnteringPlaceRoute(args.args);
                break;
            case 'endScore':
                this.onEnteringShowScore();
                break;
        }
    }
    setGamestateDescription(property = '') {
        const originalState = this.gamedatas.gamestates[this.gamedatas.gamestate.id];
        this.gamedatas.gamestate.description = `${originalState['description' + property]}`;
        this.gamedatas.gamestate.descriptionmyturn = `${originalState['descriptionmyturn' + property]}`;
        this.bga.gameui.updatePageTitle();
    }
    onEnteringPlaceRoute(args) {
        if (args.canConfirm) {
            this.setGamestateDescription('Confirm');
        }
        const activePlayerColor = this.getPlayerColor(this.bga.players.getActivePlayerId());
        const currentPositionIntersection = document.getElementById(`intersection${args.currentPosition}`);
        currentPositionIntersection.classList.add('glow');
        currentPositionIntersection.style.setProperty('--background-lighter', `#${activePlayerColor}66`);
        currentPositionIntersection.style.setProperty('--background-darker', `#${activePlayerColor}CC`);
        const map = document.getElementById('map');
        if (this.gamedatas.map == 'small') {
            const elemBR = currentPositionIntersection.getBoundingClientRect();
            const mapBR = map.getBoundingClientRect();
            console.log(currentPositionIntersection.getBoundingClientRect(), map.getBoundingClientRect());
            const left = (elemBR.left - mapBR.left) / mapBR.width * 740;
            const top = (elemBR.top - mapBR.top) / mapBR.height * 740;
            map.style.setProperty('--position-indicator-left', `${left}px`);
            map.style.setProperty('--position-indicator-top', `${top}px`);
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
        map.style.setProperty('--position-indicator-color', `#${activePlayerColor}`);
        if (this.bga.players.isCurrentPlayerActive()) {
            args.possibleRoutes.forEach(route => this.tableCenter.addGhostMarker(route));
        }
    }
    onEnteringShowScore() {
        Object.keys(this.gamedatas.players).forEach(playerId => this.bga.playerPanels.getScoreCounter(Number(playerId)).setValue(0));
        this.gamedatas.hiddenScore = false;
    }
    onLeavingState(stateName) {
        console.log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'placeDeparturePawn':
                this.onLeavingPlaceDeparturePawn();
                break;
            case 'placeRoute':
                this.onLeavingPlaceRoute();
                break;
        }
    }
    onLeavingPlaceDeparturePawn() {
        Array.from(document.getElementsByClassName('intersection')).forEach(element => element.classList.remove('selectable'));
    }
    onLeavingPlaceRoute() {
        document.querySelectorAll('.intersection.glow').forEach(element => element.classList.remove('glow'));
        if (this.bga.players.isCurrentPlayerActive()) {
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
    onUpdateActionButtons(stateName, args) {
        if (this.bga.players.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'placeDeparturePawn':
                    const placeDeparturePawnArgs = args;
                    placeDeparturePawnArgs._private.positions.forEach((position, index) => {
                        document.getElementById(`intersection${position}`).classList.add('selectable');
                        const ticketDiv = `<div class="ticket" data-ticket="${placeDeparturePawnArgs._private.tickets[index]}"></div>`;
                        this.bga.gameui.addActionButton(`placeDeparturePawn${position}_button`, dojo.string.substitute(_("Start at ${ticket}"), { ticket: ticketDiv }), () => this.placeDeparturePawn(position));
                    });
                    break;
                case 'placeRoute':
                    const placeRouteArgs = args;
                    this.bga.statusBar.addActionButton(_("Confirm turn"), () => this.confirmTurn(), {
                        disabled: !placeRouteArgs.canConfirm,
                        autoclick: placeRouteArgs.canConfirm,
                    });
                    this.bga.statusBar.addActionButton(_("Cancel last marker"), () => this.cancelLast(), {
                        color: 'secondary',
                        disabled: !placeRouteArgs.canCancel,
                    });
                    this.bga.statusBar.addActionButton(_("Reset the whole turn"), () => this.resetTurn(), {
                        color: 'secondary',
                        disabled: !placeRouteArgs.canCancel,
                    });
                    break;
            }
        }
        else {
            this.onLeavingPlaceDeparturePawn();
        }
    }
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    isVisibleScoring() {
        return !this.gamedatas.hiddenScore;
    }
    getPlayerId() {
        return this.bga.gameui.player_id;
    }
    getPlayerColor(playerId) {
        return this.gamedatas.players[playerId].color;
    }
    setupPreferences() {
        this.bga.userPreferences.onChange = (prefId, prefValue) => this.onPreferenceChange(prefId, prefValue);
        this.bga.userPreferences.toggleVisibility(203, false);
    }
    onPreferenceChange(prefId, prefValue) {
        switch (prefId) {
            case 204:
                document.getElementsByTagName('html')[0].dataset.noBuilding = (prefValue == 2).toString();
                break;
            case 205:
                document.getElementsByTagName('html')[0].dataset.noGrid = (prefValue == 2).toString();
                break;
        }
    }
    expandObjectiveClick() {
        const wrappers = document.querySelectorAll(`.personal-objective-wrapper`);
        const expanded = this.bga.userPreferences.get(203) == 1;
        wrappers.forEach((wrapper) => wrapper.dataset.expanded = (!expanded).toString());
        this.bga.userPreferences.set(203, expanded ? 2 : 1);
    }
    showPersonalObjective(playerId) {
        if (document.getElementById(`personal-objective-wrapper-${playerId}`).childElementCount > 0) {
            return;
        }
        const player = this.gamedatas.players[playerId];
        let html = `
            <div class="personal-objective collapsed">
                ${player.personalObjectiveLetters.map((letter, letterIndex) => `<div class="letter" data-player-id="${playerId}" data-position="${player.personalObjectivePositions[letterIndex]}">${letter}</div>`).join('')}
            </div>
            <div class="personal-objective expanded ${this.gamedatas.map}" data-type="${player.personalObjective}"></div>
            <div id="toggle-objective-expand-${playerId}" class="arrow"></div>
        `;
        dojo.place(html, `personal-objective-wrapper-${playerId}`);
        document.getElementById(`toggle-objective-expand-${playerId}`).addEventListener('click', () => this.expandObjectiveClick());
    }
    createPlayerPanels(gamedatas) {
        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);
            const eliminated = Number(player.eliminated) > 0;
            if (playerId === this.getPlayerId()) {
                this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `<div class="personal-objective-label">${_("Your personal objective:")}</div>`);
            }
            let html = `
            <div id="personal-objective-wrapper-${playerId}" class="personal-objective-wrapper" data-expanded="${(this.bga.userPreferences.get(203) != 2).toString()}"></div>`;
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', html);
            if (player.personalObjective) {
                this.showPersonalObjective(playerId);
            }
            if (eliminated) {
                setTimeout(() => this.eliminatePlayer(playerId), 200);
            }
            // first player token
            this.bga.playerPanels.getElement(playerId).insertAdjacentHTML('beforeend', `<div id="player-board-${player.id}-firstPlayerWrapper" class="firstPlayerWrapper"></div>`);
            this.setNewScore(playerId, Number(player.score));
        });
    }
    getOrderedPlayers(gamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === this.bga.gameui.player_id);
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }
    createPlayerTables(gamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach(player => this.createPlayerTable(gamedatas, Number(player.id)));
    }
    createPlayerTable(gamedatas, playerId) {
        const table = new PlayerTable(this, gamedatas.players[playerId]);
        table.setRound(gamedatas.validatedTickets, gamedatas.currentTicket);
        this.playersTables.push(table);
        this.registeredTablesByPlayerId[playerId] = [table];
    }
    placeFirstPlayerToken(playerId) {
        const firstPlayerBoardToken = document.getElementById('firstPlayerBoardToken');
        if (firstPlayerBoardToken) {
            slideToObjectAndAttach(this, firstPlayerBoardToken, `player-board-${playerId}-firstPlayerWrapper`);
        }
        else {
            dojo.place('<div id="firstPlayerBoardToken" class="first-player-token"></div>', `player-board-${playerId}-firstPlayerWrapper`);
            this.bga.gameui.addTooltipHtml('firstPlayerBoardToken', _("Inspector pawn. This player is the first player of the round."));
        }
        const firstPlayerTableToken = document.getElementById('firstPlayerTableToken');
        if (firstPlayerTableToken) {
            slideToObjectAndAttach(this, firstPlayerTableToken, `player-table-${playerId}-first-player-wrapper`, this.zoomManager.zoom);
        }
        else {
            dojo.place('<div id="firstPlayerTableToken" class="first-player-token"></div>', `player-table-${playerId}-first-player-wrapper`);
            this.bga.gameui.addTooltipHtml('firstPlayerTableToken', _("Inspector pawn. This player is the first player of the round."));
        }
    }
    getTooltip(element) {
        switch (element) {
            case 0: return '[GreenLight] : ' + _("If your route ends at an intersection with a [GreenLight], you place an additional marker.");
            case 1: return _("<strong>Number:</strong> Possible starting point. You choose between 2 numbers at the beginning of the game to place your Departure Pawn.");
            case 20: return '[OldLady] : ' + _("When a marker reaches [OldLady], check a box on the [OldLady] zone. Add the number next to each checked box at game end.");
            case 30: return '[Student] : ' + _("When a marker reaches [Student], check a box on the [Student] zone. Multiply [Student] with [School] at game end.");
            case 32: return '[School] : ' + _("When a marker reaches [School], check a box on the [School] zone. Multiply [Student] with [School] at game end.") + `<br><i>${_("If the [School] is marked with a Star, write the number of [Student] you have checked when a marker reaches it.")}</i>`;
            case 40: return '[Tourist] : ' + _("When a marker reaches [Tourist], check a box on the first available row on the [Tourist] zone. You will score when you drop off the [Tourist] to [MonumentLight]/[MonumentDark]. If the current row is full and you didn't reach [MonumentLight]/[MonumentDark], nothing happens.");
            case 41: return '[MonumentLight][MonumentDark] : ' + _("When a marker reaches [MonumentLight]/[MonumentDark], write the score on the column of the [Tourist] at the end of the current row. If the current row is empty, nothing happens.") + `<br><i>${_("If [MonumentLight]/[MonumentDark] is marked with a Star, write the number of [Tourist] you have checked When a marker reaches it.")}</i>`;
            case 50: return '[Businessman] : ' + _("When a marker reaches [Businessman], check a box on the first available row on the [Businessman] zone. You will score when you drop off the [Businessman] to [Office]. If the current row is full and you didn't reach [Office], nothing happens.");
            case 51: return '[Office] : ' + _("When a marker reaches [Office], write the score on the column of the [Businessman] at the end of the current row, and check the corresponding symbol ([OldLady], [Tourist] or [Student]) as if you reached it with a marker. If the current row is empty, nothing happens.") + `<br><i>${_("If the [Office] is marked with a Star, write the number of [Businessman] you have checked When a marker reaches it.")}</i>`;
            case 90: return _("<strong>Common Objective:</strong> Score 10 points when you complete the objective, or 6 points if another player completed it on a previous round.");
            case 91: return _("<strong>Personal Objective:</strong> Score 10 points when your markers link the 3 Letters of your personal objective.");
            case 92: return _("<strong>Turn Zone:</strong> If you choose to change a turn into a straight line or a straight line to a turn, check a box on the Turn Zone. The score here is negative, and you only have 5 of them!");
            case 93: return _("<strong>Traffic Jam:</strong> For each marker already in place when you add a marker on a route, check a Traffic Jam box. If the road is black, check an extra box. The score here is negative!");
            case 94: return _("<strong>Total score:</strong> Add sum of all green zone totals, subtract sum of all red zone totals.");
            case 95: return _("<strong>Tickets:</strong> The red check indicates the current round ticket. It defines the shape of the route you have to place. The black checks indicates past rounds.");
            case 97: return _("<strong>Letter:</strong> Used to define your personal objective.");
        }
    }
    addTooltips() {
        document.querySelectorAll(`[data-tooltip]`).forEach((element) => {
            const tooltipsIds = JSON.parse(element.dataset.tooltip);
            let tooltip = ``;
            tooltipsIds.forEach(id => tooltip += `<div class="tooltip-section">${formatTextIcons(this.getTooltip(id))}</div>`);
            this.bga.gameui.addTooltipHtml(element.id, tooltip);
        });
    }
    eliminatePlayer(playerId) {
        this.gamedatas.players[playerId].eliminated = 1;
        document.getElementById(`overall_player_board_${playerId}`).classList.add('eliminated-player');
        dojo.addClass(`player-table-${playerId}`, 'eliminated');
        this.setNewScore(playerId, 0);
    }
    setNewScore(playerId, score) {
        if (this.gamedatas.players[playerId].eliminated) {
            this.bga.playerPanels.getScoreCounter(playerId).setValue(0);
        }
        else {
            if (this.gamedatas.hiddenScore) {
                setTimeout(() => {
                    Object.keys(this.gamedatas.players).filter(pId => this.gamedatas.players[pId].eliminated == 0).forEach(pId => document.getElementById(`player_score_${pId}`).innerHTML = '-');
                }, 100);
            }
            else {
                if (!isNaN(score)) {
                    this.bga.playerPanels.getScoreCounter(playerId).toValue(this.gamedatas.players[playerId].eliminated != 0 ? 0 : score);
                }
            }
        }
    }
    cutZone(pipDiv, zone) {
        const zoneDiv = pipDiv.querySelector(`[data-zone="${zone}"]`);
        const zoneStyle = window.getComputedStyle(zoneDiv);
        pipDiv.style.width = zoneStyle.width;
        pipDiv.style.height = zoneStyle.height;
        pipDiv.scrollTo(Number(zoneStyle.left.match(/\d+/)[0]), 77 + Number(zoneStyle.top.match(/\d+/)[0]));
    }
    isElementIntoViewport(el) {
        var rect = el.getBoundingClientRect();
        var elemTop = rect.top;
        var elemBottom = rect.bottom;
        // Only completely visible elements return true:
        var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
        // Partially visible elements return true:
        //isVisible = elemTop < window.innerHeight && elemBottom >= 0;
        return isVisible;
    }
    showZone(playerId, zone, position) {
        const pipSide = this.tableCenter.getSide(position) === 'left' ? 'right' : 'left';
        Array.from(document.getElementsByClassName('pips')).forEach(pipDiv => pipDiv.dataset.side = pipSide);
        const playerTableZoneDiv = document.getElementById(`player-table-${playerId}`).querySelector(`[data-zone="${zone}"]`);
        const pipId = `pip-${playerId}-${zone}-${position}`;
        dojo.place(`<div class="pip" id="${pipId}" style="border-color: #${this.getPlayerColor(playerId)}"></div>`, zone >= 6 ? 'pips-bottom' : 'pips-top');
        const pipDiv = document.getElementById(`pip-${playerId}-${zone}-${position}`);
        const pipTable = new PlayerTable(this, this.gamedatas.players[playerId], pipId, pipDiv);
        this.registeredTablesByPlayerId[playerId].push(pipTable);
        this.cutZone(pipDiv, zone);
        const originBR = playerTableZoneDiv.getBoundingClientRect();
        const pipBR = pipDiv.getBoundingClientRect();
        const deltaX = originBR.left - pipBR.left - 8;
        const deltaY = originBR.top - pipBR.top - 8;
        pipDiv.style.transform = `translate(${deltaX / this.zoomManager.zoom}px, ${deltaY / this.zoomManager.zoom}px)`;
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
    positionReached(position, playerMarkers) {
        return playerMarkers.some(marker => marker.from == position || marker.to == position);
    }
    highlightObjectiveLetters(player) {
        if (player.personalObjective) {
            const lettersPositions = player.personalObjectivePositions;
            lettersPositions.forEach(lettersPosition => {
                const reached = this.positionReached(lettersPosition, player.markers).toString();
                const mapLetter = document.querySelector(`.objective-letter[data-position="${lettersPosition}"]`);
                const panelLetter = document.querySelector(`.letter[data-player-id="${player.id}"][data-position="${lettersPosition}"]`);
                if (mapLetter) {
                    mapLetter.dataset.reached = reached;
                }
                if (panelLetter) {
                    panelLetter.dataset.reached = reached;
                }
            });
        }
    }
    setObjectivesCounters(playerId, scoreSheet) {
        if (playerId === this.getPlayerId()) {
            [1, 2].forEach(objectiveNumber => {
                const span = document.getElementById(`common-objective-${objectiveNumber}-counter`);
                const objective = COMMON_OBJECTIVES[Number(span.dataset.type)];
                let checked = 0;
                switch (objective[0]) {
                    case 20: //OLD_LADY
                        checked = scoreSheet.oldLadies.checked;
                        break;
                    case 30: //STUDENT
                        checked = scoreSheet.students.checkedStudents + scoreSheet.students.checkedInternships;
                        break;
                    case 40: //TOURIST
                        checked = scoreSheet.tourists.checkedTourists.reduce((a, b) => a + b, 0);
                        break;
                    case 50: //BUSINESSMAN
                        checked = scoreSheet.businessmen.checkedBusinessmen.reduce((a, b) => a + b, 0);
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
    }
    placeDeparturePawn(position) {
        if (!this.bga.actions.checkAction('placeDeparturePawn')) {
            return;
        }
        this.takeAction('placeDeparturePawn', {
            position
        });
    }
    placeRoute(from, to) {
        const args = this.gamedatas.gamestate.args;
        const route = args.possibleRoutes?.find(r => (r.from === from && r.to === to) || (r.from === to && r.to === from));
        if (!route) {
            return;
        }
        if (!this.bga.actions.checkAction('placeRoute')) {
            return;
        }
        const eliminationWarning = route.isElimination /* && args.possibleRoutes.some(r => !r.isElimination)*/;
        if (eliminationWarning) {
            this.bga.gameui.confirmationDialog(_('Are you sure you want to place that marker? You will be eliminated!'), () => {
                this.takeAction('placeRoute', {
                    from,
                    to,
                });
            });
        }
        else {
            this.takeAction('placeRoute', {
                from,
                to,
            });
        }
    }
    cancelLast() {
        if (!this.bga.actions.checkAction('cancelLast')) {
            return;
        }
        this.takeAction('cancelLast');
    }
    resetTurn() {
        if (!this.bga.actions.checkAction('resetTurn')) {
            return;
        }
        this.takeAction('resetTurn');
    }
    confirmTurn() {
        if (!this.bga.actions.checkAction('confirmTurn', true)) {
            return;
        }
        this.takeAction('confirmTurn');
    }
    takeAction(action, data) {
        data = data || {};
        this.bga.actions.performAction(action, data, { checkAction: false });
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
            ['placedRoute', ANIMATION_MS * 2],
            ['confirmTurn', ANIMATION_MS],
            ['flipObjective', ANIMATION_MS],
            ['placedDeparturePawn', ANIMATION_MS],
            ['removeMarkers', 1],
            ['revealPersonalObjective', 1],
            ['updateScoreSheet', 1],
            ['playerEliminated', 1],
        ];
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, `notif_${notif[0]}`);
            this.bga.gameui.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    }
    notif_newRound(notif) {
        this.tableCenter.setRound(notif.args.validatedTickets, notif.args.currentTicket);
        this.playersTables.forEach(playerTable => playerTable.setRound(notif.args.validatedTickets, notif.args.currentTicket));
        this.roundNumberCounter.toValue(notif.args.round);
    }
    notif_newFirstPlayer(notif) {
        this.placeFirstPlayerToken(notif.args.playerId);
    }
    notif_updateScoreSheet(notif) {
        const playerId = notif.args.playerId;
        this.registeredTablesByPlayerId[playerId].forEach(table => table.updateScoreSheet(notif.args.scoreSheets, !this.gamedatas.hiddenScore));
        this.setNewScore(playerId, notif.args.scoreSheets.current.total);
        this.setObjectivesCounters(playerId, notif.args.scoreSheets.current);
    }
    notif_placedDeparturePawn(notif) {
        this.tableCenter.addDeparturePawn(notif.args.playerId, notif.args.position);
    }
    notif_placedRoute(notif) {
        const playerId = notif.args.playerId;
        this.tableCenter.addMarker(playerId, notif.args.marker);
        this.gamedatas.players[notif.args.playerId].markers.push(notif.args.marker);
        const player = this.gamedatas.players[notif.args.playerId];
        this.highlightObjectiveLetters(player);
        notif.args.zones.forEach(zone => this.showZone(playerId, zone, notif.args.position));
    }
    notif_confirmTurn(notif) {
        notif.args.markers.forEach(marker => this.tableCenter.setMarkerValidated(notif.args.playerId, marker));
    }
    notif_removeMarkers(notif) {
        notif.args.markers.forEach(marker => {
            this.tableCenter.removeMarker(notif.args.playerId, marker);
            const markerIndex = this.gamedatas.players[notif.args.playerId].markers.findIndex(m => m.from == marker.from && m.to == marker.to);
            if (markerIndex !== -1) {
                this.gamedatas.players[notif.args.playerId].markers.splice(markerIndex, 1);
            }
        });
        const player = this.gamedatas.players[notif.args.playerId];
        this.highlightObjectiveLetters(player);
    }
    notif_playerEliminated(notif) {
        const playerId = Number(notif.args.who_quits);
        this.setNewScore(playerId, 0);
        this.eliminatePlayer(playerId);
    }
    notif_flipObjective(notif) {
        document.getElementById(`common-objective-${notif.args.objective.id}`).dataset.side = '1';
    }
    notif_revealPersonalObjective(notif) {
        const playerId = notif.args.playerId;
        const player = this.gamedatas.players[playerId];
        player.personalObjective = notif.args.personalObjective;
        player.personalObjectiveLetters = notif.args.personalObjectiveLetters;
        player.personalObjectivePositions = notif.args.personalObjectivePositions;
        this.showPersonalObjective(playerId);
        this.highlightObjectiveLetters(player);
    }
    bgaFormatText(log, args) {
        try {
            if (log && args && !args.processed) {
                if (args.shape && args.shape[0] != '<') {
                    args.shape = `<div class="shape" data-shape="${JSON.stringify(args.shape)}" data-step="${args.step}"></div>`;
                }
                if (args.elements && typeof args.elements !== 'string') {
                    args.elements = args.elements.map(element => `<div class="map-icon" data-element="${element}"></div>`).join('');
                }
                if (args.objectiveLetters && args.objectiveLetters[0] != '<') {
                    args.objectiveLetters = `<strong>${args.objectiveLetters}</strong>`;
                }
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return { log, args };
    }
}

export { ANIMATION_MS, Game };
