class PlayerTableLoversBlock extends PlayerTableBlock {
    constructor(playerId: string, scoreSheets: ScoreSheets, visibleScoring: boolean) {
        super(playerId);

        let html = `
        <div id="lovers-block-${playerId}" data-tooltip="[50,51]" class="lovers block" data-zone="5">`;
        for(let row=1; row<=3; row++) {
            for(let i=1; i<=3; i++) {
                html += `
                        <div id="player-table-${playerId}-lovers-checkmark${row}-${i}" class="checkmark" data-row="${row}" data-number="${i}"></div>`;
            }
        }
        html += `
                    <div id="player-table-${playerId}-lovers-subtotal1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${playerId}-lovers-subtotal2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${playerId}-lovers-subtotal3" class="subtotal" data-number="3"></div>
                    <div id="player-table-${playerId}-lovers-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets, visibleScoring);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets, visibleScoring: boolean) {
        const current = scoreSheets.current.lovers;
        const validated = scoreSheets.validated.lovers;
        
        for(let row=1; row<=3; row++) {
            for(let i=1; i<=3; i++) {
                this.setContentAndValidation(`lovers-checkmark${row}-${i}`, current.checkedLovers[row-1] >= i ? '✔' : (current.subTotals[row-1] ? '⎯⎯' : ''), current.checkedLovers[row-1] >= i && validated.checkedLovers[row-1] < i);
            }

            this.setContentAndValidation(`lovers-subtotal${row}`, current.subTotals[row-1], current.subTotals[row-1] != validated.subTotals[row-1]);
        }
        
        if (visibleScoring) {
            this.setContentAndValidation(`lovers-total`, current.total, current.total != validated.total);
        }
    }

}