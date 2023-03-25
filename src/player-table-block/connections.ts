class PlayerTableConnectionsBlock extends PlayerTableBlock {
    constructor(playerId: string, scoreSheets: ScoreSheets, visibleScoring: boolean) {
        super(playerId);

        let html = `
        <div id="connections-block-${playerId}" data-tooltip="[93]" class="connections block" data-zone="7">`;
        for(let i=1; i<=19; i++) {
            html += `
                    <div id="player-table-${playerId}-connections-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${playerId}-connections-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets, visibleScoring);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets, visibleScoring: boolean) {
        const current = scoreSheets.current.connections;
        const validated = scoreSheets.validated.connections;

        for(let i=1; i<=19; i++) {
            this.setContentAndValidation(`connections-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }

        if (visibleScoring) {
            this.setContentAndValidation(`connections-total`, current.total, current.total !== validated.total);
        }
    }

}