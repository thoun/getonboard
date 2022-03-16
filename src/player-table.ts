const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    constructor(private game: GetOnBoardGame, private player: GetOnBoardPlayer) {
        this.playerId = Number(player.id);

        const eliminated = Number(player.eliminated) > 0;

        let html = `
        <div id="player-table-${player.id}" class="player-table ${eliminated ? 'eliminated' : ''}" style="box-shadow: 0 0 3px 3px #${player.color};">
            <div id="player-table-${player.id}-top" class="top" data-type="${player.sheetType}"></div>
            <div id="player-table-${player.id}-main" class="main">
                <div class="old-ladies block">`;
        for(let i=1; i<=8; i++) {
            html += `
                    <div id="player-table-${player.id}-old-ladies-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += `        
                    <div id="player-table-${player.id}-old-ladies-total" class="total"></div>
                </div>
                <div class="students block">
                    <div id="player-table-${player.id}-students-special" class="special"></div>
                    <div id="player-table-${player.id}-students-subtotal" class="subtotal"></div>
                    <div id="player-table-${player.id}-students-total" class="total"></div>
                </div>
                <div class="tourists block">
                    <div id="player-table-${player.id}-tourists-specialLight" class="special" data-style="Light"></div>
                    <div id="player-table-${player.id}-tourists-specialDark" class="special" data-style="Dark"></div>
                    <div id="player-table-${player.id}-tourists-specialMax" class="special"></div>
                    <div id="player-table-${player.id}-tourists-subtotal1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${player.id}-tourists-subtotal2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${player.id}-tourists-subtotal3" class="subtotal" data-number="3"></div>
                    <div id="player-table-${player.id}-tourists-total" class="total"></div>
                </div>
                <div class="businessmen block">
                    <div id="player-table-${player.id}-businessmen-specialMax" class="special"></div>
                    <div id="player-table-${player.id}-businessmen-subtotal1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${player.id}-businessmen-subtotal2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${player.id}-businessmen-subtotal3" class="subtotal" data-number="3"></div>
                    <div id="player-table-${player.id}-businessmen-total" class="total"></div>
                </div>
                <div class="common-objectives block">
                    <div id="player-table-${player.id}-common-objectives-objective1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${player.id}-common-objectives-objective2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${player.id}-common-objectives-total" class="total"></div>
                </div>
                <div class="personal-objective block">
                    <div id="player-table-${player.id}-personal-objective-total" class="total"></div>
                </div>
                <div class="turn-zones block">
                    <div id="player-table-${player.id}-turn-zones-total" class="total"></div>
                </div>
                <div class="traffic-jam block">
                    <div id="player-table-${player.id}-turn-zones-total" class="total"></div>
                </div>
                <div id="player-table-${player.id}-total-score" class="total score"></div>
            </div>
            <div class="name" style="color: #${player.color};">${player.name}</div>
        </div>
        `;
        dojo.place(html, 'player-tables');

        this.updateScoreSheet(player.scoreSheets);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
       this.updateOldLadiesScoreSheet(scoreSheets.current.oldLadies, scoreSheets.validated.oldLadies);

       this.setContentAndValidation(`total-score`, `${scoreSheets.current.total}`, scoreSheets.current.total != scoreSheets.validated.total);
    }

    private setContentAndValidation(id: string, content: string, unvalidated: boolean) {
        const div = document.getElementById(`player-table-${this.playerId}-${id}`);
        div.innerHTML = content;
        div.dataset.unvalidated = unvalidated.toString();
    }

    private updateOldLadiesScoreSheet(current: SimpleZoneScoreSheet, validated: SimpleZoneScoreSheet) {
        for(let i=1; i<=8; i++) {
            this.setContentAndValidation(`old-ladies-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }

        this.setContentAndValidation(`old-ladies-total`, `${current.total}`, current.total != validated.total);
    }
}