import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import * as Sentry from '@sentry/react';
import 'the-new-css-reset/css/reset.css';
import './index.css';
import { ENV } from './modules/env.ts';

if (!ENV.DEV_MODE) {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [/localhost:*/, 'online-reversi.xyz'],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
