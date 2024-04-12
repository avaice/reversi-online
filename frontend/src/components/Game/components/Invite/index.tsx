import { useCallback, useState } from 'react';
import styles from './Invite.module.css';

export const Invite = ({ shareLink }: { shareLink: string }) => {
  const [copyButtonText, setCopyButtonText] = useState('コピー');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopyButtonText('OK👍');
      setTimeout(() => {
        setCopyButtonText('コピー');
      }, 1000);
    });
  }, [shareLink]);
  return (
    <div className={styles.invite}>
      <label>
        <span className={styles.inviteMessage}>対戦相手にURLを共有してください！</span>
        <div className={styles.copieableBox}>
          <input type="text" readOnly value={shareLink} />
          <button onClick={handleCopy} disabled={copyButtonText !== 'コピー'}>
            {copyButtonText}
          </button>
        </div>
      </label>
    </div>
  );
};
