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
    objective: Card[];
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

/*
interface EnteringChangeDieArgs {
    playerId: number;
    hasHerdCuller: boolean;
}

interface NotifPickMonsterArgs {
    playerId: number;
    monster: number;
} */