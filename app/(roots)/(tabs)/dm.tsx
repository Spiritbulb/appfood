import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';
import { useLocalSearchParams } from 'expo-router';
import ChatHistory from '@/components/chathistory';
import { useWebSocket } from '@/components/WebSocketManager';

interface Recipient {
  recepientId: string;
  latestMessage?: { timestamp: number };
}

const ChatsPage = () => {
  const { user } = useGlobalContext();
  const { recepientId } = useLocalSearchParams(); // Extract recepientId from query params
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { connect, disconnect } = useWebSocket();

  // Set selectedChat if recepientId is provided in query params
  useEffect(() => {
    if (recepientId) {
      setSelectedChat(recepientId);
    }
  }, [recepientId]);

  // Fetch active chats (recipients)
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await fetch(`https://chat.spiritbulb.workers.dev/dm/recipients?userId=${user.email}`);
        const data = await response.json();
        setRecipients(data);
      } catch (error) {
        console.error('Error fetching recipients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchRecipients();
    }
  }, [user?.email]);

  // Generate DM channel ID
  const getDmChannelId = (recepientId: string): string => {
    return [user.email, recepientId].sort().join('-');
  };

  // Reopen WebSocket connection when a user starts typing
  useEffect(() => {
    if (selectedChat) {
      const dmChannelId = getDmChannelId(selectedChat);
      const wsUrl = `wss://chat.spiritbulb.workers.dev/dm/${dmChannelId}/ws?userId=${user.email}`;
      connect(wsUrl);
    }

    return () => {
      disconnect();
    };
  }, [selectedChat]);

  // Render a single recipient item
  const renderRecipient = ({ item }: { item: Recipient }) => (
    <TouchableOpacity
      style={styles.recipientItem}
      onPress={() => setSelectedChat(item.recepientId)}
    >
      <Text style={styles.recipientText}>Chat with: {item.recepientId}</Text>
      {item.latestMessage && (
        <Text style={styles.timestampText}>
          Last message: {new Date(item.latestMessage.timestamp).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#eab620" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedChat ? (
        <ChatHistory
          user={user}
          recepientId={selectedChat}
          dmChannelId={getDmChannelId(selectedChat)}
          onGoBack={() => setSelectedChat(null)} // Add onGoBack prop
        />
      ) : (
        <FlatList
          data={recipients}
          keyExtractor={(item) => item.recepientId}
          renderItem={renderRecipient}
          contentContainerStyle={styles.recipientList}
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
  recipientList: {
    padding: 10,
  },
  recipientItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  recipientText: {
    fontSize: 16,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ChatsPage;