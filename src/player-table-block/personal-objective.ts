class PlayerTablePersonalObjectiveBlock extends PlayerTableBlock {
    constructor(playerId: number, scoreSheets: ScoreSheets) {
        super(playerId);

        let html = `
        <div class="personal-objective block">
            <div id="player-table-${playerId}-personal-objective-total" class="total"></div>
        </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
        const current = scoreSheets.current.personalObjective;
        const validated = scoreSheets.validated.personalObjective;

        this.setContentAndValidation(`personal-objective-total`, current.total, current.total != validated.total);
    }

}