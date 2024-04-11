import { ENV } from "./env"

export const printLog = (message?: unknown) => {
  if (!ENV.DEV_MODE) {
    return
  }
  console.log(`[DEV] ${message}`)
}
