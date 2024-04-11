import styles from "./Game.module.css"
import { useState, useCallback, useEffect, useMemo } from "react"
import { v4 } from "uuid"
import { Loading } from "../Loading/Loading"
import { ReversiBoard } from "./components/ReversiBoard"
import { useRoomConnection } from "../../modules/useRoomConnection"
import { GameStateType, GameDataType } from "../../types"
import { Invite } from "./components/Invite"

export const Game = () => {
  const [roomId, setRoomId] = useState<string | undefined>(undefined)
  const socket = useRoomConnection(roomId)
  const [gameState, setGameState] = useState<GameStateType>("init")
  const [gameData, setGameData] = useState<GameDataType | undefined>()
  const [result, setResult] = useState<
    { black: number; white: number } | undefined
  >()

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

  const handleReplay = useCallback(() => {
    if (!socket) {
      return
    }
    setGameState("playing")
    // リプレイ要求
    socket.emit("replay")
  }, [socket])

  const onClickPiece = useCallback(
    (x: number, y: number) => {
      if (!socket) {
        return
      }
      if (gameState !== "playing") {
        return
      }
      if (gameData?.user[gameData.turn] !== socket.id) {
        return
      }
      socket.emit("put piece", { x, y })
    },
    [gameData?.turn, gameData?.user, gameState, socket]
  )

  const describeEvents = useCallback(() => {
    if (!socket) {
      return
    }

    socket.on("connect_error", () => {
      if (gameState === "init") {
        setGameState("server_error")
        return
      }
      setGameState("refused")
    })

    // 入室時の処理
    socket.on("joined room", (roomId: string) => {
      console.log(`joined room: ${roomId}`)
      setGameState("matchmaking")
    })
    // 満室時の処理
    socket.on("full room", () => {
      alert("このルームは他の人たちがプレイ中です。新しいルームを作成します。")
      createRoom()
    })
    // 他のユーザーの接続が途切れた時
    socket.on("opponent disconnected", () => {
      if (gameState === "done") {
        setGameState("leave")
        socket.disconnect()
      } else {
        setGameState("disconnected")
      }
    })

    // 盤面の更新
    socket.on("board update", (data: GameDataType) => {
      setGameState("playing")
      setGameData(data)
    })

    // ゲーム終了時
    socket.on("result", (data: { black: number; white: number }) => {
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
  }, [createRoom, gameState, socket])

  const unDescribeEvents = useCallback(() => {
    if (!socket) {
      return
    }
    socket.off("connect_error")
    socket.off("joined room")
    socket.off("full room")
    socket.off("opponent disconnected")
    socket.off("board update")
    socket.off("result")
    socket.off("message")
  }, [socket])

  const gameInformation = useMemo(() => {
    if (!socket) {
      return "接続中.."
    }
    switch (gameState) {
      case "matchmaking":
        return "対戦相手を待っています..."
      case "playing":
      case "disconnected": {
        const turn = gameData?.turn === "black" ? "黒" : "白"
        if (gameData?.user[gameData.turn] === socket.id) {
          return `あなたのターン(${turn})です`
        }
        return `相手のターン(${turn})です`
      }
      case "done": {
        if (!result) return "不正なゲーム終了"
        let winner = "draw"
        const myColor = gameData?.user.black === socket.id ? "black" : "white"
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
        return "相手が退室しました"
    }
  }, [gameData?.turn, gameData?.user, gameState, result, socket])

  useEffect(() => {
    if (!roomId) {
      //URLパラメータのroomIdを取得
      const searchParams = new URLSearchParams(window.location.search)
      const _roomId = searchParams.get("roomId")
      createRoom(_roomId ?? undefined)
      // パラメータを削除
      window.history.replaceState(null, "", window.location.pathname)
    }

    describeEvents()

    const ping = setInterval(() => {
      if (socket?.connected) {
        fetch(import.meta.env.VITE_API_URL + "/ping").catch(() => {
          clearInterval(ping)
          setGameState("refused")
          setTimeout(() => {
            location.href = getShareLink()
          }, 3000)
        })
      }
    }, 5000)

    return () => {
      unDescribeEvents()
      clearInterval(ping)
    }
  }, [
    createRoom,
    describeEvents,
    gameState,
    getShareLink,
    roomId,
    socket,
    unDescribeEvents,
  ])

  if (gameState === "init" || !socket) {
    return <Loading msg="接続中.." />
  }

  if (gameState === "server_error") {
    return (
      <p className={styles.error}>
        サーバーと接続できませんでした。
        <br />
        時間をおいて、再度お試しください。
      </p>
    )
  }
  if (gameState === "refused") {
    return <Loading msg="ゲームから切断されました。再接続中.." />
  }

  return (
    <main>
      {gameState === "matchmaking" && <Invite shareLink={getShareLink()} />}
      <p className={styles.information}>
        {gameInformation}
        {gameState === "done" && (
          <button className={styles.replay} onClick={handleReplay}>
            再戦する
          </button>
        )}
      </p>

      <div className={styles.reversiBoardWrapper}>
        <ReversiBoard
          gameData={gameData}
          myUserId={socket.id}
          onClickPiece={onClickPiece}
        />
        {gameState === "disconnected" && (
          <Loading msg="相手の通信が不安定です" fill />
        )}
      </div>
      <button className={styles.passButton} onClick={handlePass}>
        パス
      </button>
    </main>
  )
}
