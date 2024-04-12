export type PieceType = 'black' | 'white' | null;
export type GameDataType = {
  board: PieceType[][];
  user: {
    black: string;
    white: string;
  };
  turn: 'black' | 'white';
};

export type GameStateType =
  | 'refused'
  | 'server_error'
  | 'init'
  | 'matchmaking'
  | 'playing'
  | 'done'
  | 'leave'
  | 'disconnected';
