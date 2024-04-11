import express from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"
import { Reversi } from "./classes/Reversi"
import rateLimit from "express-rate-limit"
import { initIoEvents } from "./initIoEvents"

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
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

initIoEvents(io)

server.listen(3000, () => {
  console.log("server running at http://localhost:3000")
})
