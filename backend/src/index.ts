import express from "express"
import { createServer } from "node:http"
import { Server } from "socket.io"
import rateLimit from "express-rate-limit"
import { initIoEvents } from "./initIoEvents"
import { configDotenv } from "dotenv"

configDotenv()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*.online-reversi.xyz",
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
