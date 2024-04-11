import { Server } from "socket.io"
import { Reversi } from "./classes/Reversi"
import { serverLog } from "./serverLog"

const joinedRoomList = new Map<string, string>()
const BoardList = new Map<string, Reversi>()

export const initIoEvents = (io: Server) => {
  const sendBoard = (roomId: string, reversi: Reversi) => {
    io.to(roomId).emit("board update", {
      board: reversi.getBoard(),
      user: reversi.getUser(),
      turn: reversi.getTurn(),
    })
  }

  io.on("connection", (socket) => {
    // ルームに入室する
    socket.on("join room", (roomId) => {
      serverLog(`join room: ${roomId}`)
      // もし部屋に２名以上いたら入室できない
      const room = io.sockets.adapter.rooms.get(roomId)
      if (room && room.size >= 2) {
        socket.emit("full room", roomId)
        return
      }

      socket.join(roomId)
      // 部屋に入ることができたことを通知
      joinedRoomList.set(socket.id, roomId)
      socket.emit("joined room", roomId)

      // もし入室者が２人ならゲームを開始
      if (room && room.size === 2) {
        const reversi = new Reversi({
          black: Array.from(room)[0],
          white: Array.from(room)[1],
        })
        BoardList.set(roomId, reversi)
        sendBoard(roomId, reversi)
        serverLog(`create board: ${roomId}`)
      }
    })
    socket.on("put piece", ({ x, y }: { x: number; y: number }) => {
      const roomId = joinedRoomList.get(socket.id)
      if (!roomId) {
        return
      }
      const reversi = BoardList.get(roomId)
      if (!reversi) {
        return
      }
      if (reversi.putPiece(x, y)) {
        sendBoard(roomId, reversi)
        const flatBoard = reversi.getBoard().flat()
        if (
          flatBoard.filter((piece) => piece === null).length === 0 ||
          flatBoard.filter((piece) => piece === "black").length === 0 ||
          flatBoard.filter((piece) => piece === "white").length === 0
        ) {
          io.to(roomId).emit("result", reversi.count())
        }
      } else {
        socket.emit("message", "can't put piece")
      }
    })
    socket.on("pass", () => {
      const roomId = joinedRoomList.get(socket.id)
      if (!roomId) {
        return
      }
      const reversi = BoardList.get(roomId)
      if (
        !reversi ||
        !reversi.getUser() ||
        reversi.getUser()![reversi.getTurn()] !== socket.id
      ) {
        return
      }
      if (reversi.pass()) {
        sendBoard(roomId, reversi)
      } else {
        socket.emit("message", "can't pass")
      }
    })

    // ルームから誰かが退室した時
    socket.on("disconnect", () => {
      serverLog(`disconnect: ${socket.id}`)
      const joinedRoom = joinedRoomList.get(socket.id)
      if (joinedRoom) {
        socket.to(joinedRoom).emit("opponent disconnected")
      }
      joinedRoomList.delete(socket.id)

      // ボードがあったら削除する
      if (joinedRoom && BoardList.has(joinedRoom)) {
        serverLog(`delete board: ${joinedRoom}`)
        BoardList.delete(joinedRoom)
      }
    })
  })
}