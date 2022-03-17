/**
 * Your game interfaces
 */


interface Card {
    id: number;
    type: number;
    location: string;
    location_arg: number;
}

interface PossibleRoute {
    from: number;
    to: number;
    trafficJam: number;
    useTurnZone: boolean;
    isElimination: boolean;
}

interface SimpleZoneScoreSheet {
    checked: number;

    total: number;
}

interface StudentsScoreSheet {
    checkedStudents: number;
    checkedInternships: number;
    checkedSchools: number;
    specialSchool: number;

    subTotal: number;
    total: number;
}

interface TouristsScoreSheet {
    checkedTourists: number[];
    checkedMonumentsLight: number;
    checkedMonumentsDark: number; 
    specialMonumentLight: number;
    specialMonumentDark: number;
    specialMonumentMax: number;

    subTotals: number[];
    total: number;
}

interface BusinessmenScoreSheet {
    checkedBusinessmen: number[];
    specialBuilding: number;

    subTotals: number[];
    total: number;
}

interface ObjectivesScoreSheet {
    subTotals: number[];
    total: number;
}

interface ScoreSheet {
    oldLadies: SimpleZoneScoreSheet;
    students: StudentsScoreSheet;
    tourists: TouristsScoreSheet;
    businessmen: BusinessmenScoreSheet;
    commonObjectives: ObjectivesScoreSheet;
    personalObjective: ObjectivesScoreSheet;
    turnZones: SimpleZoneScoreSheet;
    trafficJam: SimpleZoneScoreSheet;

    total: number;
}

interface ScoreSheets {
    validated: ScoreSheet;
    current: ScoreSheet;
}

interface GetOnBoardPlayer extends Player {
    playerNo: number;
    sheetType: number;
    departurePosition: number;
    personalObjective?: number;
    scoreSheets: ScoreSheets;
}

interface GetOnBoardGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: GetOnBoardPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    commonObjectives: Card[];
    firstPlayerTokenPlayerId: number;
    validatedTickets: number[];
    currentTicket: number | null;
    round: number;
    map: 'small' | 'big';
    MAP_ROUTES: { [position: number]: number[] };

    TODO_TEMP_MAP_POSITIONS: { [position: number]: [] };
}

interface GetOnBoardGame extends Game {
    getPlayerId(): number;
    getZoom(): number;    

    placeDeparturePawn(position: number): void;
    placeRoute(from: number, to: number): void;
}

interface EnteringPlaceDeparturePawnArgs {
    _private?: {
        tickets: number[];
        positions: number[];
    };
}

interface EnteringPlaceRouteArgs {
    playerId: number;
    canConfirm: boolean;
    canCancel: boolean;
    currentPosition: number;
    possibleRoutes: PossibleRoute[];
}

interface NotifNewRoundArgs {
    validatedTickets: number[];
    currentTicket: number | null;
}

interface NotifNewFirstPlayerArgs {
    playerId: number;
}

interface NotifUpdateScoreSheetArgs {
    playerId: number;
    scoreSheets: ScoreSheets;
}