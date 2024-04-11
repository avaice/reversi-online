export type PieceType = "black" | "white" | null
export type GameDataType = {
  board: PieceType[][]
  user: {
    black: string
    white: string
  }
  turn: "black" | "white"
}
