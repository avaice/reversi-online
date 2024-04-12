import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { BoardList, initIoEvents } from './initIoEvents';
import * as Sentry from '@sentry/node';

import basicAuth from 'express-basic-auth';
import { ENV } from './modules/env';
import cors from 'cors';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

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

if (!ENV.DEV) {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

app.get('/', (req, res) => {
  res.send('Online Reversi Server');
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
