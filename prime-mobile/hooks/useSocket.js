import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../services/api';

const SOCKET_SERVER_URL = API_BASE_URL.replace('/api', '');

export const useSocket = (fieldId = null) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (fieldId) {
        socket.emit('join-field', fieldId);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fieldId]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
