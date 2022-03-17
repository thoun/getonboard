const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    constructor(player: GetOnBoardPlayer) {
        this.playerId = Number(player.id);

        const eliminated = Number(player.eliminated) > 0;

        let html = `
        <div id="player-table-${player.id}" class="player-table ${eliminated ? 'eliminated' : ''}" style="box-shadow: 0 0 3px 3px #${player.color};">
            <div id="player-table-${player.id}-top" class="top" data-type="${player.sheetType}">
            `;
        for(let i=1; i<=12; i++) {
            html += `
                    <div id="player-table-${player.id}-top-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += ` 
            </div>
            <div id="player-table-${player.id}-main" class="main">
                <div class="old-ladies block">`;
        for(let i=1; i<=8; i++) {
            html += `
                    <div id="player-table-${player.id}-old-ladies-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += `        
                    <div id="player-table-${player.id}-old-ladies-total" class="total"></div>
                </div>
                <div class="students block">
                `;
        for(let i=1; i<=6; i++) {
            html += `
                    <div id="player-table-${player.id}-students-checkmark${i}" class="students checkmark" data-number="${i}"></div>`;
        }
        for(let i=1; i<=3; i++) {
            html += `
                    <div id="player-table-${player.id}-internships-checkmark${i}" class="internships checkmark" data-number="${i}"></div>`;
        }
        for(let i=1; i<=4; i++) {
            html += `
                    <div id="player-table-${player.id}-schools-checkmark${i}" class="schools checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${player.id}-students-special" class="special"></div>
                    <div id="player-table-${player.id}-students-subtotal" class="subtotal"></div>
                    <div id="player-table-${player.id}-students-total" class="total"></div>
                </div>
                <div class="tourists block">`;
        for(let i=1; i<=3; i++) {
            html += `
                    <div id="player-table-${player.id}-tourists-light-checkmark${i}" class="monument light checkmark" data-number="${i}"></div>`;
        }
        for(let i=1; i<=3; i++) {
            html += `
                    <div id="player-table-${player.id}-tourists-dark-checkmark${i}" class="monument dark checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${player.id}-tourists-specialLight" class="special" data-style="Light"></div>
                    <div id="player-table-${player.id}-tourists-specialDark" class="special" data-style="Dark"></div>
                    <div id="player-table-${player.id}-tourists-specialMax" class="special"></div>`;
        for(let row=1; row<=3; row++) {
            for(let i=1; i<=4; i++) {
                html += `
                        <div id="player-table-${player.id}-tourists-checkmark${row}-${i}" class="tourists checkmark" data-row="${row}" data-number="${i}"></div>`;
            }
        }
        html += ` 
                    <div id="player-table-${player.id}-tourists-subtotal1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${player.id}-tourists-subtotal2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${player.id}-tourists-subtotal3" class="subtotal" data-number="3"></div>
                    <div id="player-table-${player.id}-tourists-total" class="total"></div>
                </div>
                <div class="businessmen block">
                    <div id="player-table-${player.id}-businessmen-special" class="special"></div>`;
        for(let row=1; row<=3; row++) {
            for(let i=1; i<=3; i++) {
                html += `
                        <div id="player-table-${player.id}-businessmen-checkmark${row}-${i}" class="checkmark" data-row="${row}" data-number="${i}"></div>`;
            }
        }
        html += `
                    <div id="player-table-${player.id}-businessmen-subtotal1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${player.id}-businessmen-subtotal2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${player.id}-businessmen-subtotal3" class="subtotal" data-number="3"></div>
                    <div id="player-table-${player.id}-businessmen-total" class="total"></div>
                </div>
                <div class="common-objectives block">
                    <div id="player-table-${player.id}-common-objectives-objective1" class="subtotal" data-number="1"></div>
                    <div id="player-table-${player.id}-common-objectives-objective2" class="subtotal" data-number="2"></div>
                    <div id="player-table-${player.id}-common-objectives-total" class="total"></div>
                </div>
                <div class="personal-objective block">
                    <div id="player-table-${player.id}-personal-objective-total" class="total"></div>
                </div>
                <div class="turn-zones block">`;
        for(let i=1; i<=5; i++) {
            html += `
                    <div id="player-table-${player.id}-turn-zones-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${player.id}-turn-zones-total" class="total"></div>
                </div>
                <div class="traffic-jam block">`;
        for(let i=1; i<=19; i++) {
            html += `
                    <div id="player-table-${player.id}-traffic-jam-checkmark${i}" class="checkmark" data-number="${i}"></div>`;
        }
        html += `
                    <div id="player-table-${player.id}-traffic-jam-total" class="total"></div>
                </div>
                <div id="player-table-${player.id}-total-score" class="total score"></div>
            </div>
            <div class="name" style="color: #${player.color};">${player.name}</div>
            <div id="player-table-${player.id}-first-player-wrapper" class="first-player-wrapper"></div>
        </div>
        `;
        dojo.place(html, 'player-tables');

        this.updateScoreSheet(player.scoreSheets);
    }

    public setRound(validatedTickets: number[], currentTicket: number) {
        if (!currentTicket) {
            return;
        }

        for(let i=1; i<=12; i++) {
            this.setContentAndValidation(`top-checkmark${i}`, currentTicket === i || validatedTickets.includes(i) ? '✔' : '', currentTicket === i);
        }
    }

    public updateScoreSheet(scoreSheets: ScoreSheets) {
       this.updateOldLadiesScoreSheet(scoreSheets.current.oldLadies, scoreSheets.validated.oldLadies);
       this.updateStudentsScoreSheet(scoreSheets.current.students, scoreSheets.validated.students);
       this.updateTouristsScoreSheet(scoreSheets.current.tourists, scoreSheets.validated.tourists);
       this.updateBusinessmenScoreSheet(scoreSheets.current.businessmen, scoreSheets.validated.businessmen);
       this.updateCommonObjectivesScoreSheet(scoreSheets.current.commonObjectives, scoreSheets.validated.commonObjectives);
       this.updatePersonalObjectiveScoreSheet(scoreSheets.current.personalObjective, scoreSheets.validated.personalObjective);
       this.updateTurnZonesScoreSheet(scoreSheets.current.turnZones, scoreSheets.validated.turnZones);
       this.updateTrafficJamScoreSheet(scoreSheets.current.trafficJam, scoreSheets.validated.trafficJam);

       this.setContentAndValidation(`total-score`, scoreSheets.current.total, scoreSheets.current.total != scoreSheets.validated.total);
    }

    private setContentAndValidation(id: string, content: string | number | undefined | null, unvalidated: boolean) {
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

    private updateOldLadiesScoreSheet(current: SimpleZoneScoreSheet, validated: SimpleZoneScoreSheet) {
        for(let i=1; i<=8; i++) {
            this.setContentAndValidation(`old-ladies-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }

        this.setContentAndValidation(`old-ladies-total`, current.total, current.total !== validated.total);
    }

    private updateStudentsScoreSheet(current: StudentsScoreSheet, validated: StudentsScoreSheet) {
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

    private updateTouristsScoreSheet(current: TouristsScoreSheet, validated: TouristsScoreSheet) {
        for(let i=1; i<=3; i++) {
            this.setContentAndValidation(`tourists-light-checkmark${i}`, current.checkedMonumentsLight >= i ? '✔' : '', current.checkedMonumentsLight >= i && validated.checkedMonumentsLight < i);
        }
        for(let i=1; i<=3; i++) {
            this.setContentAndValidation(`tourists-dark-checkmark${i}`, current.checkedMonumentsDark >= i ? '✔' : '', current.checkedMonumentsDark >= i && validated.checkedMonumentsDark < i);
        }

        this.setContentAndValidation(`tourists-specialLight`, current.specialMonumentLight, current.specialMonumentLight !== validated.specialMonumentLight);
        this.setContentAndValidation(`tourists-specialDark`, current.specialMonumentDark, current.specialMonumentDark !== validated.specialMonumentDark);
        this.setContentAndValidation(`tourists-specialMax`, current.specialMonumentMax, current.specialMonumentMax !== validated.specialMonumentMax);
        
        for(let row=1; row<=3; row++) {
            for(let i=1; i<=4; i++) {
                this.setContentAndValidation(`tourists-checkmark${row}-${i}`, current.checkedTourists[row-1] >= i ? '✔' : (current.subTotals[row-1] ? '⎯⎯' : ''), current.checkedTourists[row-1] >= i && validated.checkedTourists[row-1] < i);
            }
        }
        
        for(let i=1; i<=3; i++) {
            this.setContentAndValidation(`tourists-subtotal${i}`, current.subTotals[i-1], current.subTotals[i-1] != validated.subTotals[i-1]);
        }
        this.setContentAndValidation(`tourists-total`, current.total, current.total != validated.total);
    }

    private updateBusinessmenScoreSheet(current: BusinessmenScoreSheet, validated: BusinessmenScoreSheet) {
        this.setContentAndValidation(`businessmen-special`, current.specialBuilding, current.specialBuilding !== validated.specialBuilding);
        
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

    private updateCommonObjectivesScoreSheet(current: ObjectivesScoreSheet, validated: ObjectivesScoreSheet) {
        for(let i=1; i<=2; i++) {
            this.setContentAndValidation(`common-objectives-objective${i}`, current.subTotals[i-1], current.subTotals[i-1] != validated.subTotals[i-1]);
        }
        this.setContentAndValidation(`common-objectives-total`, current.total, current.total != validated.total);
    }

    private updatePersonalObjectiveScoreSheet(current: ObjectivesScoreSheet, validated: ObjectivesScoreSheet) {
        this.setContentAndValidation(`personal-objective-total`, current.total, current.total != validated.total);
    }

    private updateTurnZonesScoreSheet(current: SimpleZoneScoreSheet, validated: SimpleZoneScoreSheet) {
        for(let i=1; i<=5; i++) {
            this.setContentAndValidation(`turn-zones-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }

        this.setContentAndValidation(`turn-zones-total`, -current.total, current.total !== validated.total);
    }

    private updateTrafficJamScoreSheet(current: SimpleZoneScoreSheet, validated: SimpleZoneScoreSheet) {
        for(let i=1; i<=19; i++) {
            this.setContentAndValidation(`traffic-jam-checkmark${i}`, current.checked >= i ? '✔' : '', current.checked >= i && validated.checked < i);
        }

        this.setContentAndValidation(`traffic-jam-total`, -current.total, current.total !== validated.total);
    }

}