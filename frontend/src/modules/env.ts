export const ENV = {
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000',
  BUILD_DATE: import.meta.env.VITE_BUILD_DATE ?? 'unknown',
  DEV_MODE: !!import.meta.env.VITE_DEV_MODE,
} as const;
