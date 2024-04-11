import styles from "./Loading.module.css"

export const Loading = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner} />
      <p>接続中...</p>
    </div>
  )
}
