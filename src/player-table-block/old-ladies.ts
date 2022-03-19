class PlayerTableOldLadiesBlock extends PlayerTableBlock {
    constructor(playerId: number, scoreSheets: ScoreSheets) {
        super(playerId);

        let html = `
        <div class="old-ladies block">`;
        for(let i=1; i<=8; i++) {
            html += `
                <div id="player-table-${playerId}-old-ladies-checkmark${i}" class="checkmark" data-number="${i}"></div>
            `;
        }
        html += `        
                    <div id="player-table-${playerId}-old-ladies-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
        const current = scoreSheets.current.oldLadies;
        const validated = scoreSheets.validated.oldLadies;

        for(let i=1; i<=8; i++) {
            this.setContentAndValidation(`old-ladies-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }

        this.setContentAndValidation(`old-ladies-total`, current.total, current.total !== validated.total);
    }

}