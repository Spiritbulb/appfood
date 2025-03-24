import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';
import { useLocalSearchParams } from 'expo-router';
import ChatHistory from '@/components/chathistory';

const ChatScreen = () => {
  const { user } = useGlobalContext();
  const { recepientId } = useLocalSearchParams<{ recepientId: string }>();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const dmChannelId = recepientId && user?.email ? [user.email, recepientId].sort().join('-') : null;

  useEffect(() => {
    if (!recepientId || !dmChannelId) {
      setLoading(false);
      return;
    }

    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`https://chatter.ws.spiritbulb.com/dm/${dmChannelId}/history`);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#eab620" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user && (
        <ChatHistory
          user={user}
          recepientId={recepientId}
          dmChannelId={dmChannelId || ''}
          onGoBack={() => {
            // Define what should happen when onGoBack is called
            console.log('Go back');
          }}
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