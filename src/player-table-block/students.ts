class PlayerTableStudentsBlock extends PlayerTableBlock {
    constructor(playerId: number, scoreSheets: ScoreSheets) {
        super(playerId);

        let html = `
        <div class="students block">
                `;
        for(let i=1; i<=6; i++) {
            html += `
                    <div id="player-table-${playerId}-students-checkmark${i}" class="students checkmark" data-number="${i}"></div>`;
        }
        for(let i=1; i<=3; i++) {
            html += `
                    <div id="player-table-${playerId}-internships-checkmark${i}" class="internships checkmark" data-number="${i}"></div>`;
        }
        for(let i=1; i<=4; i++) {
            html += `
                    <div id="player-table-${playerId}-schools-checkmark${i}" class="schools checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${playerId}-students-special" class="special"></div>
                    <div id="player-table-${playerId}-students-subtotal" class="subtotal"></div>
                    <div id="player-table-${playerId}-students-total" class="total"></div>
                </div>
        `;
        dojo.place(html, `player-table-${playerId}-main`);

        this.updateScoreSheet(scoreSheets);
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
        const current = scoreSheets.current.students;
        const validated = scoreSheets.validated.students;

        for(let i=1; i<=6; i++) {
            this.setContentAndValidation(`students-checkmark${i}`, current.checkedStudents >= i ? '✔' : '', current.checkedStudents >= i && validated.checkedStudents < i);
        }
        for(let i=1; i<=3; i++) {
            this.setContentAndValidation(`internships-checkmark${i}`, current.checkedInternships >= i ? '✔' : '', current.checkedInternships >= i && validated.checkedInternships < i);
        }
        for(let i=1; i<=3; i++) {
            this.setContentAndValidation(`schools-checkmark${i}`, current.checkedSchools >= i ? '✔' : '', current.checkedSchools >= i && validated.checkedSchools < i);
        }

        this.setContentAndValidation(`students-special`, current.specialSchool, current.specialSchool !== validated.specialSchool);
        this.setContentAndValidation(`students-subtotal`, current.subTotal, current.subTotal !== validated.subTotal);
        this.setContentAndValidation(`students-total`, current.total, current.total !== validated.total);
    }

}