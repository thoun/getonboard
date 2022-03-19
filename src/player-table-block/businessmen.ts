class PlayerTableBusinessmenBlock extends PlayerTableBlock {
    constructor(playerId: number, scoreSheets: ScoreSheets) {
        super(playerId);

        let html = `
        <div class="businessmen block">
                    <div id="player-table-${playerId}-businessmen-special" class="special"></div>`;
        for(let row=1; row<=3; row++) {
            for(let i=1; i<=3; i++) {
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

        this.updateScoreSheet(scoreSheets);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
        const current = scoreSheets.current.businessmen;
        const validated = scoreSheets.validated.businessmen;

        this.setContentAndValidation(`businessmen-special`, current.specialOffice, current.specialOffice !== validated.specialOffice);
        
        for(let row=1; row<=3; row++) {
            for(let i=1; i<=3; i++) {
                this.setContentAndValidation(`businessmen-checkmark${row}-${i}`, current.checkedBusinessmen[row-1] >= i ? '✔' : (current.subTotals[row-1] ? '⎯⎯' : ''), current.checkedBusinessmen[row-1] >= i && validated.checkedBusinessmen[row-1] < i);
            }
        }
        
        for(let i=1; i<=3; i++) {
            this.setContentAndValidation(`businessmen-subtotal${i}`, current.subTotals[i-1], current.subTotals[i-1] != validated.subTotals[i-1]);
        }
        this.setContentAndValidation(`businessmen-total`, current.total, current.total != validated.total);
    }

}