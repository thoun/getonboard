/**
 * Your game interfaces
 */


interface Card {
    id: number;
    type: number;
    location: string;
    location_arg: number;
}

interface GetOnBoardPlayer extends Player {
    player_no: string;
    sheetType: number;
    departurePosition: number;
    personalObjective?: number;
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
    commonObjectives: Card[],
}

interface GetOnBoardGame extends Game {
    getPlayerId: () => number;
    getZoom(): number;
}

interface EnteringPlaceDeparturePawnArgs {
    _private?: {
        tickets: number[];
    };
}

interface EnteringPlaceRouteArgs {
    playerId: number;
}

interface NotifNewFirstPlayerArgs {
    playerId: number;
}