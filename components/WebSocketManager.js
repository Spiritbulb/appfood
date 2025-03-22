import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Create a context for WebSocket management
const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0); // Track reconnect attempts
  const reconnectTimeout = useRef(null); // Track reconnect timeout

  // Function to establish WebSocket connection
  const connect = (url) => {
    if (socket.current) {
      console.log('WebSocket is already connected.');
      return;
    }

    socket.current = new WebSocket(url);

    socket.current.onopen = () => {
      console.log('WebSocket connection opened');
      setIsConnected(true);
      reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
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

      // Attempt to reconnect if the connection was closed unexpectedly
      if (reconnectAttempts.current < 5) { // Limit reconnect attempts to 5
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * reconnectAttempts.current, 5000); // Exponential backoff
        console.log(`Attempting to reconnect in ${delay}ms...`);
        reconnectTimeout.current = setTimeout(() => connect(url), delay);
      } else {
        console.error('Max reconnect attempts reached. Giving up.');
      }
    };
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (socket.current) {
      socket.current.close();
      socket.current = null;
      setIsConnected(false);
      clearTimeout(reconnectTimeout.current); // Clear any pending reconnect attempts
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
      clearTimeout(reconnectTimeout.current); // Clear any pending reconnect attempts
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