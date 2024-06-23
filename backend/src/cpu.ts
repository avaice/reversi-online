import { Reversi } from './classes/Reversi';

type CPUType = 'minmax';

// 人間様を気持ち良くさせるCPU
export const cpuTurn = async (board: Reversi, type: CPUType, color: 'white') => {
  const puttable = getPuttablePlaces(board, color).sort((a, b) => a.cnt - b.cnt);
  if (puttable.length === 0) {
    return null;
  }

  // 角を全く取らないのは舐めてるので一応取る
  const kado = puttable.filter(
    (p) =>
      (p.x === 0 && p.y === 0) ||
      (p.x === 7 && p.y === 0) ||
      (p.x === 0 && p.y === 7) ||
      (p.x === 7 && p.y === 7)
  );

  const cnt = board.count();
  const progress = (cnt.black + cnt.white) / 64;

  return kado.length > 0 ? kado[0] : puttable[Math.floor(progress * puttable.length)];
};

const getPuttablePlaces = (board: Reversi, color: 'black' | 'white') => {
  const puttablePlaces: { x: number; y: number; cnt: number }[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const cnt = board.canPutPiece(x, y, color);
      if (cnt) {
        puttablePlaces.push({ x, y, cnt });
      }
    }
  }
  return puttablePlaces;
};
