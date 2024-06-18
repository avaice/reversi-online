import { useState } from 'react';
import styles from './ModeSelect.module.css';
import { ReversiBoard } from '../Game/components/ReversiBoard';

export const useModeSelect = () => {
  const [playMode, setPlayMode] = useState<'single' | 'multi' | null>(null);
  const selectUi = (
    <div className={styles.selector}>
      <h2>ゲームモードを選択！</h2>
      <div>
        <ReversiBoard gameData={undefined} myUserId={undefined} onClickPiece={() => {}} />
        <button onClick={() => setPlayMode('single')}>シングルプレイ</button>
        <button onClick={() => setPlayMode('multi')}>マルチプレイ</button>
      </div>
    </div>
  );

  return { playMode, selectUi };
};
