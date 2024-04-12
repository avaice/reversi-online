import { useMemo } from 'react';
import { io } from 'socket.io-client';
import { ENV } from '../env';

export const useRoomConnection = (roomId?: string) => {
  const SOCKET_URL = ENV.SOCKET_URL;
  const socket = useMemo(() => {
    if (!SOCKET_URL || !roomId) {
      return null;
    }
    const sock = io(SOCKET_URL);
    sock.emit('join room', roomId);
    return sock;
  }, [SOCKET_URL, roomId]);

  return socket;
};
