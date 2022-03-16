const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    constructor(private game: GetOnBoardGame, private player: GetOnBoardPlayer) {
        this.playerId = Number(player.id);

        const eliminated = Number(player.eliminated) > 0;

        let html = `
        <div id="player-table-${player.id}" class="player-table ${eliminated ? 'eliminated' : ''}">
            <div id="player-table-${player.id}-top" class="top" data-type="${player.sheetType}"></div>
            <div id="player-table-${player.id}-main" class="main"></div>
            <div class="name" style="color: #${player.color};">${player.name}</div>
        </div>
        `;
        dojo.place(html, 'player-tables');
    }
}