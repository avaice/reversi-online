import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { BoardList, initIoEvents } from './initIoEvents';

import basicAuth from 'express-basic-auth';
import { ENV } from './modules/env';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.CORS_ORIGIN,
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 200,
});
app.use(apiLimiter);

app.get('/', (req, res) => {
  res.send('Online Reversi Server');
});

// インデックス登録を防ぐ
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

app.use('/ping', cors());
app.get('/ping', (req, res) => {
  res.send('pong');
});

// logs, healthをBASIC認証
app.use(
  '/admin/*',
  basicAuth({
    users: { [ENV.BASIC_AUTH_USER]: ENV.BASIC_AUTH_PASS },
    challenge: true,
  })
);
// サーバーログ
app.get('/admin/logs', (req, res) => {
  // ../log.txtを表示
  res.sendFile('log.txt', { root: __dirname + '/../' });
});

// ヘルスチェック
app.get('/admin/health', (req, res) => {
  res.json({
    date: new Date().toISOString(),
    status: 'ok',
    connections: io.engine.clientsCount,
    roomCount: io.sockets.adapter.rooms.size,
    boardCount: BoardList.size,
    server: {
      usage: {
        // CPU使用量(.00%) 小数点以下2桁
        cpu: (process.cpuUsage().system / 1000 / 1000).toFixed(2),
        // メモリ使用量(.00%) 小数点以下2桁
        memory: ((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(
          2
        ),
      },
    },
  });
});

initIoEvents(io);

server.listen(ENV.PORT, () => {
  console.log(`server running at http://localhost:${ENV.PORT}`);
});
