import { Game } from './Game';
import { PlayerTableBusinessmenBlock } from './player-table-block/businessmen';
import { PlayerTableCommonObjectivesBlock } from './player-table-block/common-objectives';
import { PlayerTableOldLadiesBlock } from './player-table-block/old-ladies';
import { PlayerTablePersonalObjectiveBlock } from './player-table-block/personal-objective';
import { PlayerTableStudentsBlock } from './player-table-block/students';
import { PlayerTableTouristsBlock } from './player-table-block/tourists';
import { PlayerTableTrafficJamBlock } from './player-table-block/traffic-jam';
import { PlayerTableTurnZonesBlock } from './player-table-block/turn-zones';

export class PlayerTable {
    public playerId: string;
    
    private oldLadies: PlayerTableOldLadiesBlock;
    private students: PlayerTableStudentsBlock;
    private tourists: PlayerTableTouristsBlock;
    private businessmen: PlayerTableBusinessmenBlock;
    private commonObjectives: PlayerTableCommonObjectivesBlock;
    private personalObjective: PlayerTablePersonalObjectiveBlock;
    private turnZones: PlayerTableTurnZonesBlock;
    private trafficJam: PlayerTableTrafficJamBlock;

    constructor(game: Game, player: GetOnBoardPlayer, id: string = player.id, insertIn: HTMLElement = document.getElementById('full-table')) {
        this.playerId = id;

        const eliminated = Number(player.eliminated) > 0;

        let html = `
        <div id="player-table-${this.playerId}" class="player-table ${eliminated ? 'eliminated' : ''}" style="box-shadow: 0 0 3px 3px #${player.color};">
            <div id="player-table-${this.playerId}-top" data-tooltip="[95]" class="top" data-type="${player.sheetType}">
            `;
        for(let i=1; i<=12; i++) {
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
        (dojo as any).place(html, insertIn);

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

    public setRound(validatedTickets: number[], currentTicket: number) {
        if (!currentTicket) {
            return;
        }

        for(let i=1; i<=12; i++) {
            this.setContentAndValidation(`top-checkmark${i}`, currentTicket === i || validatedTickets.includes(i) ? '✔' : '', currentTicket === i);
        }
    }

    public updateScoreSheet(scoreSheets: ScoreSheets, visibleScoring: boolean) {
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
