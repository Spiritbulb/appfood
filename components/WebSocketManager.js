import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Create a context for WebSocket management
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to WebSocket
  const connect = (url) => {
    if (socket.current) {
      console.log('WebSocket is already connected.');
      return;
    }

    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      console.log('WebSocket connection opened');
      setIsConnected(true);
    };

    socket.current.onmessage = (event) => {
      console.log('Message received:', event.data);
      const message = JSON.parse(event.data);
      if (onMessageCallback.current) {
        onMessageCallback.current(message);
      }
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.current.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      socket.current = null;
    };
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (socket.current) {
      socket.current.close();
      socket.current = null;
      setIsConnected(false);
    }
  };

  // Send a message through WebSocket
  const sendMessage = (message) => {
    if (socket.current && isConnected) {
      socket.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  // Callback for incoming messages
  const onMessageCallback = useRef(null);
  const setOnMessageCallback = (callback) => {
    onMessageCallback.current = callback;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        connect,
        disconnect,
        sendMessage,
        isConnected,
        setOnMessageCallback,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};