import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';
import { useLocalSearchParams } from 'expo-router';
import NewChat from '@/components/newchat';
import ChatHistory from '@/components/chathistory';

const ChatScreen = () => {
  const { user } = useGlobalContext();
  const { recepientId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate DM channel ID (only if recepientId is available)
  const dmChannelId = recepientId && user?.email ? [user.email, recepientId].sort().join('-') : null;

  // Fetch chat history on mount (only if recepientId is available)
  useEffect(() => {
    if (!recepientId || !dmChannelId) {
      setLoading(false); // Skip fetching if recepientId or dmChannelId is missing
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`https://chat.spiritbulb.workers.dev/dm/${dmChannelId}/history`);
        const history = await response.json();
        setMessages(history);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [dmChannelId, recepientId]);

  // Handle sending the first message
  const handleSendFirstMessage = (message) => {
    setMessages([message]); // Add the first message to the chat history
  };

  // Render loading spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#eab620" />
      </View>
    );
  }

  // Render NewChat if there are no messages, otherwise render ChatHistory
  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        <NewChat
          user={user}
          recepientId={recepientId}
          onSendFirstMessage={handleSendFirstMessage}
        />
      ) : (
        <ChatHistory
          user={user}
          recepientId={recepientId}
          messages={messages}
          setMessages={setMessages}
          dmChannelId={dmChannelId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;