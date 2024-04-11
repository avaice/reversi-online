import express from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"
import rateLimit from "express-rate-limit"
import { initIoEvents } from "./initIoEvents"
import { configDotenv } from "dotenv"

import basicAuth from "express-basic-auth"
import { ENV } from "./modules/env"

configDotenv()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ENV.CORS_ORIGIN,
  },
})

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 200,
})
app.use(apiLimiter)

app.get("/", (req, res) => {
  res.send("Online Reversi Server")
})
app.get("/ping", (req, res) => {
  res.send("pong")
})

//BASIC認証
app.use(
  "/logs",
  basicAuth({
    users: { [ENV.BASIC_AUTH_USER]: ENV.BASIC_AUTH_PASS },
    challenge: true,
  })
)
app.get("/logs", (req, res) => {
  // ../log.txtを表示
  res.sendFile("log.txt", { root: __dirname + "/../" })
})

initIoEvents(io)

server.listen(3000, () => {
  console.log("server running at http://localhost:3000")
})
