type PieceType = 'black' | 'white' | null;
type UserType = { black: string; white: string | null };

const newBoard = () => {
  const board: PieceType[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
};

export class Reversi {
  private board = newBoard();
  private user: UserType | null = null;
  private turn: 'black' | 'white' = 'black';

  constructor(user: UserType) {
    this.user = user;
  }

  getTurn() {
    return this.turn;
  }
  getBoard() {
    return this.board;
  }
  getUser() {
    return this.user;
  }

  updateUser(id: string, role: 'black' | 'white') {
    if (this.user === null) {
      return;
    }
    this.user[role] = id;
  }

  pass() {
    if (this.hasPuttablePlace()) {
      return false;
    }

    this.turn = this.turn === 'black' ? 'white' : 'black';
    return true;
  }

  hasPuttablePlace(role: 'black' | 'white' = this.turn) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (this.canPutPiece(x, y, role)) {
          return true;
        }
      }
    }
    return false;
  }

  putPiece(x: number, y: number) {
    if (
      this.board[y][x] !== null ||
      this.user === null ||
      this.canPutPiece(x, y, this.turn === 'black' ? 'black' : 'white') === 0
    ) {
      return false;
    }
    this.turnOver(x, y, this.turn);
    this.board[y][x] = this.turn;
    this.turn = this.turn === 'black' ? 'white' : 'black';
    return true;
  }

  canPutPiece(x: number, y: number, color: 'black' | 'white'): number {
    if (this.board[y][x] !== null) {
      return 0;
    }

    const dx = [0, 1, 1, 1, 0, -1, -1, -1];
    const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
    let count = 0;
    for (let i = 0; i < 8; i++) {
      let nx = x + dx[i];
      let ny = y + dy[i];
      let flag = false;
      while (0 <= nx && nx < 8 && 0 <= ny && ny < 8) {
        if (this.board[ny][nx] === null) {
          break;
        }
        if (this.board[ny][nx] === color) {
          if (flag) {
            count++;
            break;
          }
          break;
        }
        flag = true;
        nx += dx[i];
        ny += dy[i];
      }
    }

    return count;
  }

  turnOver(x: number, y: number, color: 'black' | 'white') {
    const dx = [0, 1, 1, 1, 0, -1, -1, -1];
    const dy = [-1, -1, 0, 1, 1, 1, 0, -1];
    for (let i = 0; i < 8; i++) {
      let nx = x + dx[i];
      let ny = y + dy[i];
      let flag = false;
      while (0 <= nx && nx < 8 && 0 <= ny && ny < 8) {
        if (this.board[ny][nx] === null) {
          break;
        }
        if (this.board[ny][nx] === color) {
          if (flag) {
            nx = x + dx[i];
            ny = y + dy[i];
            while (0 <= nx && nx < 8 && 0 <= ny && ny < 8) {
              if (this.board[ny][nx] === color) {
                break;
              }
              this.board[ny][nx] = color;
              nx += dx[i];
              ny += dy[i];
            }
            break;
          }
          break;
        }
        flag = true;
        nx += dx[i];
        ny += dy[i];
      }
    }
  }

  count() {
    let black = 0;
    let white = 0;
    this.board.forEach((row) => {
      row.forEach((piece) => {
        if (piece === 'black') {
          black++;
        } else if (piece === 'white') {
          white++;
        }
      });
    });
    return { black, white };
  }

  reset() {
    this.board = newBoard();
    this.turn = 'black';
  }
}
