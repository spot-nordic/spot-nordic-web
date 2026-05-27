import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/utils/helpers';

export const useSocket = (namespace?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001', {
      auth: { token },
      transports: ['websocket']
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};