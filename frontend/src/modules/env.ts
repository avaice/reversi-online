export const ENV = {
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000',
  BUILD_DATE: import.meta.env.VITE_BUILD_DATE ?? 'unknown',
  DEV_MODE: !!import.meta.env.VITE_DEV_MODE,
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN ?? undefined,
  PUBLIC_URL: import.meta.env.VITE_PUBLIC_URL ?? 'http://localhost:5173',
} as const;
