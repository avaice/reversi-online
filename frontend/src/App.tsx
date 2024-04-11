import styles from "./App.module.css"
import { ReversiBoard } from "./components/ReversiBoard"

function App() {
  return (
    <>
      <header>
        <h1>オンラインリバーシ</h1>
      </header>
      <main>
        <div className={styles.invite}>
          <label>
            <span className={styles.inviteMessage}>友達を招待する</span>
            <div className={styles.copieableBox}>
              <input type="text" readOnly value={window.location.href} />
              <button>コピー</button>
            </div>
          </label>
        </div>
        <ReversiBoard />
        <p className={styles.information}>あなたの番です</p>
      </main>
    </>
  )
}

export default App
