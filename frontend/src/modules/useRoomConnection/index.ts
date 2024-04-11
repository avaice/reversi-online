import { useMemo } from "react"
import { io } from "socket.io-client"

export const useRoomConnection = (roomId?: string) => {
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  const socket = useMemo(() => {
    if (!SOCKET_URL || !roomId) {
      return null
    }
    const sock = io(SOCKET_URL)
    sock.emit("join room", roomId)
    return sock
  }, [SOCKET_URL, roomId])

  return socket
}
