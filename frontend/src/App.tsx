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
      <footer>
        {ENV.DEV_MODE ? <p>Development Mode</p> : <p>Build Date: {ENV.BUILD_DATE}</p>}
        <p>(C)2024 online-reversi.xyz all rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
