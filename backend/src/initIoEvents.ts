import { Server } from 'socket.io';
import { Reversi } from './classes/Reversi';
import { serverLog } from './serverLog';
import { cpuTurn } from './cpu';

const joinedRoomList = new Map<string, string>();
export const BoardList = new Map<string, Reversi>();

export const initIoEvents = (io: Server) => {
  const sendBoard = (roomId: string, reversi: Reversi) => {
    io.to(roomId).emit('board update', {
      board: reversi.getBoard(),
      user: reversi.getUser(),
      turn: reversi.getTurn(),
    });

    const isEnd = () => {
      const flatBoard = reversi.getBoard().flat();
      if (
        flatBoard.filter((piece) => piece === null).length === 0 ||
        flatBoard.filter((piece) => piece === 'black').length === 0 ||
        flatBoard.filter((piece) => piece === 'white').length === 0 ||
        (!reversi.hasPuttablePlace('black') && !reversi.hasPuttablePlace('white'))
      ) {
        io.to(roomId).emit('result', reversi.count());
        serverLog(`game end: ${roomId}`);
      }
    };

    if (reversi.getUser()?.white === null && reversi.getTurn() === 'white') {
      (async () => {
        const cpuPutPos = await cpuTurn(reversi, 'minmax', 'white');
        if (!cpuPutPos) {
          reversi.pass();
        } else {
          reversi.putPiece(cpuPutPos.x, cpuPutPos.y);
        }

        setTimeout(() => {
          sendBoard(roomId, reversi);
          isEnd();
        }, 100);
      })();
    } else {
      isEnd();
    }
  };

  io.on('connection', (socket) => {
    // ルームに入室する
    socket.on('join room', (roomId) => {
      serverLog(`join room: ${socket.id}(${socket.handshake.address}) to ${roomId}`);
      // もし部屋に２名以上いたら入室できない
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room && room.size >= 2) {
        socket.emit('full room', roomId);
        return;
      }

      socket.join(roomId);
      // 部屋に入ることができたことを通知
      joinedRoomList.set(socket.id, roomId);
      socket.emit('joined room', roomId);

      // もし入室者が２人ならゲームを開始
      if (room && room.size === 2) {
        if (!BoardList.has(roomId)) {
          // ボードがなければ新規
          const reversi = new Reversi({
            black: Array.from(room)[0],
            white: Array.from(room)[1],
          });
          BoardList.set(roomId, reversi);
          sendBoard(roomId, reversi);
          serverLog(`create board: ${roomId}`);
        } else {
          // あれば再開
          const reversi = BoardList.get(roomId)!;
          if (reversi.getUser()!.black === Array.from(room)[0]) {
            reversi.updateUser(Array.from(room)[1], 'white');
          } else {
            reversi.updateUser(Array.from(room)[1], 'black');
          }

          sendBoard(roomId, reversi);
          serverLog(`resume game: ${roomId}`);
        }
      }
    });

    // シングルプレイ
    socket.on('start single play', () => {
      const roomId = joinedRoomList.get(socket.id);
      if (!roomId) {
        serverLog('single: roomId is not found');
        return;
      }

      serverLog('start single play');

      if (!BoardList.has(roomId)) {
        const reversi = new Reversi({
          black: socket.id,
          white: null,
        });
        BoardList.set(roomId, reversi);
        sendBoard(roomId, reversi);
        serverLog(`create board: ${roomId}`);
      } else {
        const reversi = BoardList.get(roomId)!;
        sendBoard(roomId, reversi);
        serverLog(`resume game: ${roomId}`);
      }
    });

    // ピースを置く
    socket.on('put piece', ({ x, y }: { x: number; y: number }) => {
      const roomId = joinedRoomList.get(socket.id);
      if (!roomId) {
        return;
      }
      // console.log('roomId', roomId);
      const reversi = BoardList.get(roomId);
      if (!reversi) {
        return;
      }

      if (reversi.putPiece(x, y)) {
        sendBoard(roomId, reversi);
      } else {
        socket.emit('message', "can't put piece");
      }
    });
    // パスする
    socket.on('pass', () => {
      const roomId = joinedRoomList.get(socket.id);
      if (!roomId) {
        return;
      }
      const reversi = BoardList.get(roomId);
      if (!reversi || !reversi.getUser() || reversi.getUser()![reversi.getTurn()] !== socket.id) {
        return;
      }
      if (reversi.pass()) {
        sendBoard(roomId, reversi);
      } else {
        socket.emit('message', "can't pass");
      }
    });
    // 再戦する
    socket.on('replay', () => {
      const roomId = joinedRoomList.get(socket.id);
      if (!roomId) {
        return;
      }
      const reversi = BoardList.get(roomId);
      if (!reversi) {
        return;
      }
      reversi.reset();
      sendBoard(roomId, reversi);
    });

    // ルームから誰かが退室した時
    socket.on('disconnect', () => {
      serverLog(`disconnect: ${socket.id}`);
      const joinedRoom = joinedRoomList.get(socket.id);
      if (joinedRoom) {
        socket.to(joinedRoom).emit('opponent disconnected');
      }
      joinedRoomList.delete(socket.id);

      // 消失した部屋のボードは削除する
      if (joinedRoom && !io.sockets.adapter.rooms.get(joinedRoom)) {
        serverLog(`delete board: ${joinedRoom}`);
        BoardList.delete(joinedRoom);
      }
    });
  });
};
