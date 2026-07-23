import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    let socketInstance;

    // Establish Socket.io connection only if user is logged in
    if (user && user.id) {
      const socketUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '') 
        : 'http://localhost:5000';

      socketInstance = io(socketUrl, {
        withCredentials: true,
      });

      socketInstance.on('connect', () => {
        setConnected(true);
        if (import.meta.env.MODE === 'development') {
          console.log('Socket.io connected on client side:', socketInstance.id);
        }
        
        // Auto join user notifications channel room
        socketInstance.emit('join_user', user.id);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
        if (import.meta.env.MODE === 'development') {
          console.log('Socket.io disconnected on client side');
        }
      });

      setSocket(socketInstance);
    }

    // Clean up connections on logout/unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
