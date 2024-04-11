if (!process.env.BASIC_AUTH_USER || !process.env.BASIC_AUTH_PASS) {
  console.error("BASIC_AUTH_USER or BASIC_AUTH_PASS is not set")
  process.exit(1)
}

export const ENV = {
  BASIC_AUTH_USER: process.env.BASIC_AUTH_USER!,
  BASIC_AUTH_PASS: process.env.BASIC_AUTH_PASS!,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
} as const
