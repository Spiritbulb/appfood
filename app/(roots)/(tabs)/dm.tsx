import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useGlobalContext } from '@/lib/global-provider';
import { useLocalSearchParams } from 'expo-router';
import ChatHistory from '@/components/chathistory';
import { useWebSocket } from '@/components/WebSocketManager';

interface Recipient {
  recepientId: string;
  latestMessage?: { timestamp: number; text: string };
}

interface RecipientDetails {
  [key: string]: { name: string; image: string };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ChatsPage = () => {
  const { user } = useGlobalContext();
  const { recepientId } = useLocalSearchParams<{ recepientId: string }>();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientDetails, setRecipientDetails] = useState<RecipientDetails>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastNotifiedMessage, setLastNotifiedMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  interface Message {
    sender: string;
    text: string;
    timestamp: number;
  }

  const { connect, disconnect, messages = [] as Message[], isConnected } = useWebSocket() as {
    connect: (url: string) => void;
    disconnect: () => void;
    messages: Message[];
    isConnected: boolean;
  };

  // Fetch active chats (recipients)
  const fetchRecipients = async () => {
    try {
      const response = await fetch(`https://chatter.ws.spiritbulb.com/dm/recipients?userId=${user?.email}`);
      const data = await response.json();
      setRecipients(data);

      // Fetch recipient details for each recipient
      const details: RecipientDetails = {};
      for (const recipient of data) {
        const recipientResponse = await fetch(
          `https://plate-pals.handler.spiritbulb.com/api/user-data?query=${recipient.recepientId}`
        );
        if (recipientResponse.ok) {
          const recipientData = await recipientResponse.json();
          if (recipientData.success && recipientData.results && recipientData.results.length > 0) {
            details[recipient.recepientId] = {
              name: recipientData.results[0].name,
              image: recipientData.results[0].image,
            };
          }
        }
      }
      
      // If recepientId is provided in params, fetch its details if not already in recipients
      if (recepientId && !details[recepientId]) {
        const recipientResponse = await fetch(
          `https://plate-pals.handler.spiritbulb.com/api/user-data?query=${recepientId}`
        );
        if (recipientResponse.ok) {
          const recipientData = await recipientResponse.json();
          if (recipientData.success && recipientData.results && recipientData.results.length > 0) {
            details[recepientId] = {
              name: recipientData.results[0].name,
              image: recipientData.results[0].image,
            };
          }
        }
      }
      
      setRecipientDetails(details);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchRecipients();
    }
  }, [user?.email]);

  // Set selected chat to recepientId from params if it exists
  useEffect(() => {
    if (recepientId) {
      setSelectedChat(recepientId);
    }
  }, [recepientId]);

  // Reopen WebSocket connection when a user starts typing
  useEffect(() => {
    if (selectedChat) {
      const dmChannelId = getDmChannelId(selectedChat);
      const wsUrl = `wss://chatter.ws.spiritbulb.com/dm/${dmChannelId}/ws?userId=${user?.email}`;
      connect(wsUrl);
    }

    return () => {
      disconnect();
    };
  }, [selectedChat, user?.email]);

  // Listen for new messages and send notifications
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (!selectedChat || latestMessage.sender !== selectedChat) {
        setHasNewMessages(true);

        Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Message',
            body: `You have a new message from ${recipientDetails[latestMessage.sender]?.name || latestMessage.sender}`,
            sound: true,
            data: { sender: latestMessage.sender },
          },
          trigger: null,
        });
      }
    }
  }, [messages, selectedChat, recipientDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipients();
  };

  const renderRecipient = ({ item }: { item: Recipient }) => (
    <TouchableOpacity
      style={styles.recipientItem}
      onPress={() => setSelectedChat(item.recepientId)}
    >
      <Image
        source={{ uri: recipientDetails[item.recepientId]?.image || 'https://src.spiritbulb.com/plate%20pal.png' }}
        style={styles.recipientImage}
      />
      <View style={styles.recipientInfo}>
        <Text style={styles.recipientText}>
          {recipientDetails[item.recepientId]?.name || 'Recipient'}
        </Text>
        {item.latestMessage && (
          <Text style={styles.timestampText}>
            {item.latestMessage.text || 'No messages yet'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#eab620" />
      </View>
    );
  }

  function getDmChannelId(selectedChat: string): string {
    return `${user?.email}-${selectedChat}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity onPress={() => setHasNewMessages(false)}>
          <Ionicons name="notifications" size={24} color={hasNewMessages ? '#eab620' : '#333'} />
          {hasNewMessages && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      {selectedChat ? (
        <ChatHistory
          user={user}
          recepientId={selectedChat}
          dmChannelId={getDmChannelId(selectedChat)}
          onGoBack={() => setSelectedChat(null)}
        />
      ) : (
        <FlatList
          data={recipients}
          keyExtractor={(item) => item.recepientId}
          renderItem={renderRecipient}
          contentContainerStyle={styles.recipientList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#eab620']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    top: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  recipientList: {
    padding: 16,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    top: 30,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipientImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestampText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
});

export default ChatsPage;