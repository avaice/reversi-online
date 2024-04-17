import styles from './Game.module.css';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 } from 'uuid';
import { Loading } from '../Loading/Loading';
import { ReversiBoard } from './components/ReversiBoard';
import { useRoomConnection } from '../../modules/useRoomConnection';
import { GameStateType, GameDataType } from '../../types';
import { Invite } from './components/Invite';
import { printLog } from '../../modules/dev';
import { ENV } from '../../modules/env';
import { captureException } from '@sentry/react';

const getShareLink = (roomId: string) => {
  if (!roomId) {
    return '';
  }
  const url = new URL(window.location.href);
  // 余計なパラメータを削除
  url.search = '';

  url.searchParams.set('roomId', roomId);
  return url.toString();
};

export const Game = () => {
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const socket = useRoomConnection(roomId);
  const [gameState, setGameState] = useState<GameStateType>('init');
  const [gameData, setGameData] = useState<GameDataType | undefined>();
  const [result, setResult] = useState<{ black: number; white: number } | undefined>();
  const turnSound = useRef(new Audio('/turn.mp3'));
  const [isSoundEnabled, setIsSoundEnabled] = useState(!localStorage.getItem('reversi_sound_mute'));

  const createRoom = useCallback((_roomId?: string) => {
    setRoomId(_roomId ?? v4());
  }, []);

  const handlePass = useCallback(() => {
    if (!socket) {
      return;
    }
    socket.emit('pass');
  }, [socket]);

  const handleReplay = useCallback(() => {
    if (!socket) {
      return;
    }
    setGameState('playing');
    // リプレイ要求
    socket.emit('replay');
  }, [socket]);

  const onClickPiece = useCallback(
    (x: number, y: number) => {
      if (!socket) {
        return;
      }
      if (gameState !== 'playing') {
        return;
      }
      if (gameData?.user[gameData.turn] !== socket.id) {
        return;
      }
      socket.emit('put piece', { x, y });
    },
    [gameData?.turn, gameData?.user, gameState, socket]
  );

  const describeEvents = useCallback(() => {
    if (!socket) {
      return;
    }

    socket.on('connect_error', () => {
      if (gameState === 'init') {
        setGameState('server_error');
        captureException(new Error('connect_error in init state'));
        return;
      }
      if (gameState === 'server_error') {
        return;
      }
      setGameState('refused');
    });

    // 入室時の処理
    socket.on('joined room', (roomId: string) => {
      printLog(`joined room: ${roomId}`);
      setGameState('matchmaking');
    });
    // 満室時の処理
    socket.on('full room', () => {
      alert('このルームは他の人たちがプレイ中です。新しいルームを作成します。');
      createRoom();
    });
    // 他のユーザーの接続が途切れた時
    socket.on('opponent disconnected', () => {
      if (gameState === 'done') {
        setGameState('leave');
        socket.disconnect();
      } else {
        setGameState('disconnected');
      }
    });

    // 盤面の更新
    socket.on('board update', (data: GameDataType) => {
      if (gameState === 'playing' && isSoundEnabled) {
        turnSound.current.pause();
        turnSound.current.currentTime = 0;
        // turnSound.current.volume = 0.5;
        turnSound.current.play();
      }
      setGameState('playing');
      localStorage.setItem('playing_room', roomId!);
      setGameData(data);
    });

    // ゲーム終了時
    socket.on('result', (data: { black: number; white: number }) => {
      setGameState('done');
      localStorage.removeItem('playing_room');
      setResult(data);
    });

    // メッセージの受信時
    socket.on('message', (message: string) => {
      printLog(message);
      if (message === "can't pass") {
        alert('置く場所があるので、パスできません');
      }
    });
  }, [createRoom, gameState, isSoundEnabled, roomId, socket]);

  const unDescribeEvents = useCallback(() => {
    if (!socket) {
      return;
    }
    socket.off('connect_error');
    socket.off('joined room');
    socket.off('full room');
    socket.off('opponent disconnected');
    socket.off('board update');
    socket.off('result');
    socket.off('message');
  }, [socket]);

  const gameInformation = useMemo(() => {
    if (!socket) {
      return '接続中..';
    }
    switch (gameState) {
      case 'matchmaking':
        return '対戦相手を待っています...';
      case 'playing':
      case 'disconnected': {
        const turn = gameData?.turn === 'black' ? '黒' : '白';
        if (gameData?.user[gameData.turn] === socket.id) {
          return `あなたのターン(${turn})です`;
        }
        return `相手のターン(${turn})です`;
      }
      case 'done': {
        if (!result) {
          captureException(new Error('unexpected result in done state'));
          return '不正なゲーム終了';
        }
        let winner = 'draw';
        const myColor = gameData?.user.black === socket.id ? 'black' : 'white';
        if (result?.black > result?.white) {
          winner = 'black';
        } else if (result?.black < result?.white) {
          winner = 'white';
        }
        if (winner == 'draw') {
          return `黒:${result.black} 白:${result.white} | 引き分け`;
        }
        if (winner === myColor) {
          return `黒:${result.black} 白:${result.white} | あなたの勝ち`;
        } else {
          return `黒:${result.black} 白:${result.white} | あなたの負け`;
        }
      }
      case 'leave':
        return '相手が退室しました';
    }
  }, [gameData?.turn, gameData?.user, gameState, result, socket]);

  useEffect(() => {
    if (!roomId) {
      //URLパラメータのroomIdを取得
      const searchParams = new URLSearchParams(window.location.search);
      const _roomId =
        searchParams.get('roomId') ?? localStorage.getItem('playing_room') ?? undefined;
      createRoom(_roomId);
      // パラメータを削除
      window.history.replaceState(null, '', window.location.pathname);
    }

    describeEvents();

    const ping = setInterval(() => {
      if (socket?.connected && roomId) {
        fetch(ENV.SOCKET_URL + '/ping').catch(() => {
          clearInterval(ping);
          setGameState('refused');
          setTimeout(() => {
            location.href = getShareLink(roomId);
          }, 3000);
        });
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        socket?.connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unDescribeEvents();
      clearInterval(ping);
    };
  }, [createRoom, describeEvents, gameState, roomId, socket, unDescribeEvents]);

  if (gameState === 'init' || !socket || !roomId) {
    return <Loading msg="接続中.." />;
  }

  if (gameState === 'server_error') {
    return (
      <p className={styles.error}>
        サーバーと接続できませんでした。
        <br />
        時間をおいて、再度お試しください。
      </p>
    );
  }
  if (gameState === 'refused') {
    return <Loading msg="ゲームから切断されました。再接続中.." />;
  }

  console.log('gameData', gameData);

  return (
    <div className={styles.game}>
      {gameState === 'matchmaking' && <Invite shareLink={getShareLink(roomId)} />}
      <p className={styles.information} aria-live="polite">
        {gameInformation}
        {gameState === 'done' && (
          <button className={styles.replay} onClick={handleReplay}>
            再戦する
          </button>
        )}
      </p>
      <div className={styles.reversiBoardWrapper}>
        <ReversiBoard gameData={gameData} myUserId={socket.id} onClickPiece={onClickPiece} />
        {gameState === 'disconnected' && <Loading msg="相手の通信が不安定です" fill />}
      </div>
      <div className={styles.controls}>
        <button
          className={styles.soundTrigger}
          onClick={() => {
            const newValue = !isSoundEnabled;
            setIsSoundEnabled(newValue);
            if (newValue) {
              localStorage.removeItem('reversi_sound_mute');
            } else {
              localStorage.setItem('reversi_sound_mute', '1');
            }
          }}
        >
          {isSoundEnabled ? (
            <img src="/sound_on.svg" alt="音をオフにする" />
          ) : (
            <img src="/sound_off.svg" alt="音をオンにする" />
          )}
        </button>
        <button
          className={styles.passButton}
          onClick={handlePass}
          disabled={!(gameData?.user[gameData.turn] === socket.id)}
        >
          パスする
        </button>
      </div>
    </div>
  );
};
