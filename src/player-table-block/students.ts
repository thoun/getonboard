class PlayerTableStudentsBlock extends PlayerTableBlock {
    constructor(playerId: string, scoreSheets: ScoreSheets, visibleScoring: boolean) {
        super(playerId);

        let html = `
        <div id="students-block-${playerId}" data-tooltip="[30,32]" class="students block" data-zone="3">
                `;
        for(let i=1; i<=6; i++) {
            html += `
                    <div id="player-table-${playerId}-students-checkmark${i}" class="students checkmark" data-number="${i}"></div>`;
        }
        for(let i=1; i<=4; i++) {
            html += `
                    <div id="player-table-${playerId}-cinemas-checkmark${i}" class="cinemas checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${playerId}-students-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets, visibleScoring);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets, visibleScoring: boolean) {
        const current = scoreSheets.current.students;
        const validated = scoreSheets.validated.students;

        for(let i=1; i<=6; i++) {
            this.setContentAndValidation(`students-checkmark${i}`, current.checkedStudents >= i ? '✔' : '', current.checkedStudents >= i && validated.checkedStudents < i);
        }
        for(let i=1; i<=4; i++) {
            this.setContentAndValidation(`cinemas-checkmark${i}`, current.checkedCinemas >= i ? '✔' : '', current.checkedCinemas >= i && validated.checkedCinemas < i);
        }
        
        if (visibleScoring) {
            this.setContentAndValidation(`students-total`, current.total, current.total !== validated.total);
        }
    }

}