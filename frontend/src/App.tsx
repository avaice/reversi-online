import styles from "./App.module.css"
import { ReversiBoard } from "./components/ReversiBoard"
import { useCallback, useEffect, useState } from "react"
import { useRoomConnection } from "./modules/useRoomConnection"
import { v4 } from "uuid"
import { GameDataType } from "./types"

function App() {
  const [roomId, setRoomId] = useState<string | undefined>(undefined)
  const socket = useRoomConnection(roomId)
  const [gameState, setGameState] = useState<
    "matchmaking" | "playing" | "done" | "leave"
  >("matchmaking")
  const [gameData, setGameData] = useState<GameDataType | undefined>()
  const [result, setResult] = useState<
    { black: number; white: number } | undefined
  >()

  const [copyButtonText, setCopyButtonText] = useState("コピー")

  const createRoom = useCallback((_roomId?: string) => {
    setRoomId(_roomId ?? v4())
  }, [])

  const handlePass = useCallback(() => {
    if (!socket) {
      return
    }
    socket.emit("pass")
  }, [socket])

  const getShareLink = useCallback(() => {
    if (!roomId) {
      return ""
    }
    const url = new URL(window.location.href)
    // 余計なパラメータを削除
    url.search = ""

    url.searchParams.set("roomId", roomId)
    return url.toString()
  }, [roomId])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(getShareLink()).then(() => {
      setCopyButtonText("OK👍")
      setTimeout(() => {
        setCopyButtonText("コピー")
      }, 1000)
    })
  }, [getShareLink])

  useEffect(() => {
    if (!roomId) {
      //URLパラメータのroomIdを取得
      const searchParams = new URLSearchParams(window.location.search)
      const _roomId = searchParams.get("roomId")
      createRoom(_roomId ?? undefined)
      // パラメータを削除
      window.history.replaceState(null, "", window.location.pathname)
    }

    if (!socket) {
      return
    }

    // 入室時の処理
    socket.on("joined room", (roomId: string) => {
      console.log(`joined room: ${roomId}`)
    })
    // 満室時の処理
    socket.on("full room", () => {
      alert("このルームは他の人たちがプレイ中です。新しいルームを作成します。")
      createRoom()
    })
    // 他のユーザーが退室した時の処理
    socket.on("opponent disconnected", () => {
      alert("相手が退出しました")
      setGameState("leave")
      // 接続を切断
      socket.disconnect()
    })

    // 盤面の更新
    socket.on("board update", (data: GameDataType) => {
      console.log(data)
      setGameState("playing")
      setGameData(data)
    })

    // 盤面の更新
    socket.on("result", (data: { black: number; white: number }) => {
      console.log(data)
      setGameState("done")
      setResult(data)
    })

    // メッセージの受信時
    socket.on("message", (message: string) => {
      console.log(message)
      if (message === "can't pass") {
        alert("置く場所があるので、パスできません")
      }
    })
  }, [createRoom, roomId, socket])

  if (!socket) {
    return <div>Connecting...</div>
  }

  return (
    <>
      <header>
        <h1>
          <img src="/logo.png" alt="オンラインリバーシ" width="250px" />
        </h1>
      </header>
      <main>
        {gameState === "matchmaking" && (
          <div className={styles.invite}>
            <label>
              <span className={styles.inviteMessage}>
                対戦相手にURLを共有してください！
              </span>
              <div className={styles.copieableBox}>
                <input type="text" readOnly value={getShareLink()} />
                <button
                  onClick={handleCopy}
                  disabled={copyButtonText !== "コピー"}
                >
                  {copyButtonText}
                </button>
              </div>
            </label>
          </div>
        )}
        <p className={styles.information}>
          {(() => {
            switch (gameState) {
              case "matchmaking":
                return "対戦相手を待っています..."
              case "playing": {
                const turn = gameData?.turn === "black" ? "黒" : "白"
                if (gameData?.user[gameData.turn] === socket.id) {
                  return `あなたのターン(${turn})です`
                }
                return `相手のターン(${turn})です`
              }
              case "done": {
                if (!result) return "不正なゲーム終了"
                let winner = "draw"
                const myColor =
                  gameData?.user.black === socket.id ? "black" : "white"
                if (result?.black > result?.white) {
                  winner = "black"
                } else if (result?.black < result?.white) {
                  winner = "white"
                }
                if (winner == "draw") {
                  return "ゲーム終了: 引き分け"
                }
                if (winner === myColor) {
                  return "ゲーム終了: あなたの勝ち"
                } else {
                  return "ゲーム終了: あなたの負け"
                }
              }
              case "leave":
                return "相手が退出しました"
            }
          })()}
        </p>

        <ReversiBoard
          gameData={gameData}
          myUserId={socket.id}
          onClickPiece={(x: number, y: number) => {
            if (gameData?.user[gameData.turn] !== socket.id) {
              return
            }
            socket.emit("put piece", { x, y })
          }}
        />
        <button className={styles.passButton} onClick={handlePass}>
          パス
        </button>
      </main>
    </>
  )
}

export default App
