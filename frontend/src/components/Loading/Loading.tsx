import styles from "./Loading.module.css"

export const Loading = ({ msg }: { msg: string }) => {
  return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner} />
      <p>{msg}</p>
    </div>
  )
}
