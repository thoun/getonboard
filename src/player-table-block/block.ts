abstract class PlayerTableBlock {
    constructor(protected playerId: string) {

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
    }

    public abstract updateScoreSheet(scoreSheets: ScoreSheets);

    protected setContentAndValidation(id: string, content: string | number | undefined | null, unvalidated: boolean) {
        const div = document.getElementById(`player-table-${this.playerId}-${id}`);
        let contentStr = '';
        if (typeof content === 'string') {
            contentStr = content;
        } else if (typeof content === 'number') {
            contentStr = ''+content;
        }
        div.innerHTML = contentStr;
        div.dataset.unvalidated = unvalidated.toString();
    }

}