class PlayerTableStationsBlock extends PlayerTableBlock {
    constructor(playerId: string, scoreSheets: ScoreSheets, visibleScoring: boolean) {
        super(playerId);

        let html = `
        <div id="stations-block-${playerId}" data-tooltip="[0]" class="stations block" data-zone="0">`;
        for(let i=1; i<=8; i++) {
            html += `
                <div id="player-table-${playerId}-stations-circles${i}" class="circle" data-number="${i}"></div>
                <div id="player-table-${playerId}-stations-checkmark${i}" class="checkmark" data-number="${i}"></div>
            `;
        }
        html += `        
                    <div id="player-table-${playerId}-stations-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets, visibleScoring);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets, visibleScoring: boolean) {
        const current = scoreSheets.current.stations;
        const validated = scoreSheets.validated.stations;

        for(let i=1; i<=6; i++) {
            const div = document.getElementById(`player-table-${this.playerId}-stations-circles${i}`);
            div.dataset.encircled = (current.encircled >= i).toString();
            div.dataset.unvalidated = (current.encircled >= i && validated.encircled < i).toString();
            
            this.setContentAndValidation(`stations-checkmark${i}`, current.checked >= i ? '✗' : '', current.checked >= i && validated.checked < i);
        }

        if (visibleScoring) {
            this.setContentAndValidation(`stations-total`, current.total, current.total !== validated.total);
        }
    }

}