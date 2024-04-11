import { GameDataType, PieceType } from "../../types"
import styles from "./ReversiBoard.module.css"

const createBoard = () => {
  const board: PieceType[][] = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  )
  board[3][3] = "white"
  board[3][4] = "black"
  board[4][3] = "black"
  board[4][4] = "white"
  return board
}

export const ReversiBoard = ({
  gameData,
  myUserId,
  onClickPiece,
}: {
  gameData: GameDataType | undefined
  myUserId: string | undefined
  onClickPiece: (x: number, y: number) => void
}) => {
  const board = gameData?.board ?? createBoard()
  return (
    <div className={styles.board}>
      {board.map((row, i) =>
        row.map((piece, j) => (
          <button
            onClick={() => onClickPiece(j, i)}
            disabled={
              !!piece || !myUserId || gameData?.user[gameData.turn] !== myUserId
            }
            className={`${styles.piece} ${styles[piece ?? "empty"]}`}
            key={`${i}-${j}-${piece ?? "null"}`}
            aria-label={`${i}, ${j}, ${piece ?? "コマなし"}`}
          />
        ))
      )}
    </div>
  )
}
