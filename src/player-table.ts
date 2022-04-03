const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: string;
    
    private oldLadies: PlayerTableOldLadiesBlock;
    private students: PlayerTableStudentsBlock;
    private tourists: PlayerTableTouristsBlock;
    private businessmen: PlayerTableBusinessmenBlock;
    private commonObjectives: PlayerTableCommonObjectivesBlock;
    private personalObjective: PlayerTablePersonalObjectiveBlock;
    private turnZones: PlayerTableTurnZonesBlock;
    private trafficJam: PlayerTableTrafficJamBlock;

    constructor(player: GetOnBoardPlayer, id: string = player.id, insertIn: HTMLElement = document.getElementById('full-table')) {
        this.playerId = id;

        const eliminated = Number(player.eliminated) > 0;

        let html = `
        <div id="player-table-${this.playerId}" class="player-table ${eliminated ? 'eliminated' : ''}" style="box-shadow: 0 0 3px 3px #${player.color};">
            <div id="player-table-${this.playerId}-top" class="top" data-type="${player.sheetType}">
            `;
        for(let i=1; i<=12; i++) {
            html += `
                    <div id="player-table-${this.playerId}-top-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += ` 
            </div>
            <div id="player-table-${this.playerId}-main" class="main">
                <div id="player-table-${this.playerId}-total-score" class="total score"></div>
            </div>
            <div class="name" style="color: #${player.color};">${player.name}</div>
            <div id="player-table-${this.playerId}-first-player-wrapper" class="first-player-wrapper"></div>
        </div>
        `;
        dojo.place(html, insertIn);

        this.oldLadies = new PlayerTableOldLadiesBlock(this.playerId, player.scoreSheets);
        this.students = new PlayerTableStudentsBlock(this.playerId, player.scoreSheets);
        this.tourists = new PlayerTableTouristsBlock(this.playerId, player.scoreSheets);
        this.businessmen = new PlayerTableBusinessmenBlock(this.playerId, player.scoreSheets);
        this.commonObjectives = new PlayerTableCommonObjectivesBlock(this.playerId, player.scoreSheets);
        this.personalObjective = new PlayerTablePersonalObjectiveBlock(this.playerId, player.scoreSheets);
        this.turnZones = new PlayerTableTurnZonesBlock(this.playerId, player.scoreSheets);
        this.trafficJam = new PlayerTableTrafficJamBlock(this.playerId, player.scoreSheets);

        this.updateScoreSheet(player.scoreSheets);
    }

    public setRound(validatedTickets: number[], currentTicket: number) {
        if (!currentTicket) {
            return;
        }

        for(let i=1; i<=12; i++) {
            this.setContentAndValidation(`top-checkmark${i}`, currentTicket === i || validatedTickets.includes(i) ? '✔' : '', currentTicket === i);
        }
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
       this.oldLadies.updateScoreSheet(scoreSheets);
       this.students.updateScoreSheet(scoreSheets);
       this.tourists.updateScoreSheet(scoreSheets);
       this.businessmen.updateScoreSheet(scoreSheets);
       this.commonObjectives.updateScoreSheet(scoreSheets);
       this.personalObjective.updateScoreSheet(scoreSheets);
       this.turnZones.updateScoreSheet(scoreSheets);
       this.trafficJam.updateScoreSheet(scoreSheets);

       this.setContentAndValidation(`total-score`, scoreSheets.current.total, scoreSheets.current.total != scoreSheets.validated.total);
    }

    private setContentAndValidation(id: string, content: string | number | undefined | null, unvalidated: boolean) {
        const div = document.getElementById(`player-table-${this.playerId}-${id}`);
        let contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        } else if (typeof content === 'number') {
            contentStr = ''+content;
        }
        div.innerHTML = contentStr;
        div.dataset.unvalidated = unvalidated.toString();
    }

}