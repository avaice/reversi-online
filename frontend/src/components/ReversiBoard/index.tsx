import styles from "./ReversiBoard.module.css"

type PieceType = "black" | "white" | null

const board: PieceType[][] = Array.from({ length: 8 }, () =>
  Array(8).fill(null)
)
board[3][3] = "white"
board[3][4] = "black"
board[4][3] = "black"
board[4][4] = "white"

export const ReversiBoard = () => {
  return (
    <div className={styles.board}>
      {board.map((row, i) =>
        row.map((piece, j) => (
          <button
            className={`${styles.piece} ${styles[piece ?? "empty"]}`}
            key={`${i}-${j}-${piece ?? "null"}`}
            aria-label={`${i}, ${j}, ${piece ?? "コマなし"}`}
          />
        ))
      )}
    </div>
  )
}
