import { Game } from './components/Game';
import { ENV } from './modules/env';

function App() {
  return (
    <>
      <header>
        <h1>
          <img src="/logo.png" alt="オンラインリバーシ" width="250px" />
        </h1>
      </header>
      <Game />
      <div>
        <section>
          <h2>友達とプレイする方法</h2>
          <p>まず、招待リンクをコピーしてください。</p>
          <p>コピーしたリンクを、LINEやインスタのDM等で友達に共有してください。</p>
          <p>友達がリンクをクリックすると、ゲームが始まります。</p>
        </section>
        <section>
          <h2>リバーシの遊び方</h2>
          <p>オンラインリバーシは、2人で対戦するボードゲームです。</p>
          <p>
            黒と白の石を交互に置いていき、石を挟んでひっくり返すことで自分の石を増やしていきます。
          </p>
          <p>石を置ける場所がなくなったら、パスして相手にターンを渡します。</p>
          <p>両者がパスをするか、盤面が全て埋まったらゲーム終了です。</p>
          <p>石の数が多い方が勝ちです。</p>
          <p>
            詳しいルールは、
            <a href="https://ja.wikipedia.org/wiki/%E3%82%AA%E3%82%BB%E3%83%AD_(%E3%83%9C%E3%83%BC%E3%83%89%E3%82%B2%E3%83%BC%E3%83%A0)">
              Wikipedia
            </a>
            を参照してください。
          </p>
        </section>
      </div>
      <footer>
        {ENV.DEV_MODE ? <p>Development Mode</p> : <p>Build Date: {ENV.BUILD_DATE}</p>}
        <p>(C)2024 online-reversi.xyz all rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
