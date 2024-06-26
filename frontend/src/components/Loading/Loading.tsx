import styles from './Loading.module.css';

export const Loading = ({ msg, fill }: { msg: string; fill?: boolean }) => {
  return (
    <div className={`${styles.loading} ${fill ? styles.fill : ''}`} aria-live="assertive">
      <div className={styles.loadingSpinner} />
      <p>{msg}</p>
    </div>
  );
};
