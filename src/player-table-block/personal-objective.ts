const PERSONAL_OBJECTIVE_POINTS = [0, 2, 5, 10];

class PlayerTablePersonalObjectiveBlock extends PlayerTableBlock {
    constructor(playerId: string, scoreSheets: ScoreSheets, visibleScoring: boolean) {
        super(playerId);

        let html = `
        <div id="personal-objective-block-${playerId}" data-tooltip="[91]" class="personal-objective block">`;
        for(let i=1; i<=3; i++) {
            html += `
                <div id="player-table-${playerId}-personal-objective-checkmark${i}" class="checkmark" data-number="${i}"></div>
            `;
        }
        html += ` 
            <div id="player-table-${playerId}-personal-objective-total" class="total"></div>
        </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets, visibleScoring);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets, visibleScoring: boolean) {
        const current = scoreSheets.current.personalObjective;
        const validated = scoreSheets.validated.personalObjective;

        if (visibleScoring) {
            for(let i=1; i<=3; i++) {
                this.setContentAndValidation(`personal-objective-checkmark${i}`, current.total >= PERSONAL_OBJECTIVE_POINTS[i]  ? '✔' : '', current.total >= PERSONAL_OBJECTIVE_POINTS[i] && validated.total < PERSONAL_OBJECTIVE_POINTS[i]);
            }

            this.setContentAndValidation(`personal-objective-total`, current.total, current.total != validated.total);
        }
    }

}