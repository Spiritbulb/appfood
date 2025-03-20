import React, { useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import ChatMessage from './chatmessage'; // Assuming you have a ChatMessage component for rendering individual messages

const ChatHistory = ({ user, recepientId, messages, setMessages, dmChannelId }) => {
  const socket = useRef<WebSocket | null>(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!recepientId || !user?.email || !dmChannelId) return;

    const wsUrl = `wss://chat.spiritbulb.workers.dev/dm/${dmChannelId}/ws?userId=${user.email}`;
    socket.current = new WebSocket(wsUrl);

    socket.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [user?.email, dmChannelId, recepientId]);

  // Render a single chat message
  const renderMessage = ({ item }) => (
    <ChatMessage
      message={item}
      isCurrentUser={item.from === user?.email}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        inverted // Start from the bottom
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

export default ChatHistory;