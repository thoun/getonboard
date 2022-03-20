class PlayerTableCommonObjectivesBlock extends PlayerTableBlock {
    constructor(playerId: string, scoreSheets: ScoreSheets) {
        super(playerId);

        let html = `
        <div class="common-objectives block">
            <div id="player-table-${playerId}-common-objectives-objective1" class="subtotal" data-number="1"></div>
            <div id="player-table-${playerId}-common-objectives-objective2" class="subtotal" data-number="2"></div>
            <div id="player-table-${playerId}-common-objectives-total" class="total"></div>
        </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
        const current = scoreSheets.current.commonObjectives;
        const validated = scoreSheets.validated.commonObjectives;

        for(let i=1; i<=2; i++) {
            this.setContentAndValidation(`common-objectives-objective${i}`, current.subTotals[i-1], current.subTotals[i-1] != validated.subTotals[i-1]);
        }
        this.setContentAndValidation(`common-objectives-total`, current.total, current.total != validated.total);
    }

}