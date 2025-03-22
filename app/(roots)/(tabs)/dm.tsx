import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the bell icon
import * as Notifications from 'expo-notifications'; // For notifications
import { useGlobalContext } from '@/lib/global-provider';
import { useLocalSearchParams } from 'expo-router';
import ChatHistory from '@/components/chathistory';
import { useWebSocket } from '@/components/WebSocketManager';

interface Recipient {
  recepientId: string;
  latestMessage?: { timestamp: number };
}

interface RecipientDetails {
  [key: string]: string; // Maps recipientId to recipient name
}

// Configure notification handler
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
  const [recipientDetails, setRecipientDetails] = useState<RecipientDetails>({}); // Store recipient names
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false); // Track new messages
  interface Message {
    sender: string;
    content: string;
    timestamp: number;
  }

  const { connect, disconnect, messages = [] }: { connect: (url: string) => void; disconnect: () => void; messages: Message[] } = useWebSocket(); // Default messages to an empty array

  // Request notification permissions on component mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications to receive message alerts.');
      }
    };

    requestPermissions();
  }, []);

  // Set selectedChat if recepientId is provided in query params
  useEffect(() => {
    if (recepientId) {
      setSelectedChat(Array.isArray(recepientId) ? recepientId[0] : recepientId);
    }
  }, [recepientId]);

  // Fetch active chats (recipients)
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await fetch(`https://chat.spiritbulb.workers.dev/dm/recipients?userId=${user?.email}`);
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
              details[recipient.recepientId] = recipientData.results[0].name; // Store the recipient's name
            }
          }
        }
        setRecipientDetails(details);
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
    return [user?.email, recepientId].sort().join('-');
  };

  // Reopen WebSocket connection when a user starts typing
  useEffect(() => {
    if (selectedChat) {
      const dmChannelId = getDmChannelId(selectedChat);
      const wsUrl = `wss://chat.spiritbulb.workers.dev/dm/${dmChannelId}/ws?userId=${user?.email}`;
      connect(wsUrl);
    }

    return () => {
      disconnect();
    };
  }, [selectedChat]);

  // Listen for new messages and send notifications
  useEffect(() => {
    if (messages && messages.length > 0) { // Ensure messages is defined
      const latestMessage = messages[messages.length - 1];
      if (!selectedChat || latestMessage.sender !== selectedChat) {
        setHasNewMessages(true);

        // Send a notification to the status bar
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Message',
            body: `You have a new message from ${recipientDetails[latestMessage.sender] || latestMessage.sender}`,
            sound: true, // Play a sound
            data: { sender: latestMessage.sender }, // Optional: Add custom data
          },
          trigger: null, // Send immediately
        });
      }
    }
  }, [messages]);

  // Render a single recipient item
  const renderRecipient = ({ item }: { item: Recipient }) => (
    <TouchableOpacity
      style={styles.recipientItem}
      onPress={() => setSelectedChat(item.recepientId)}
    >
      <Text style={styles.recipientText}>
        {recipientDetails[item.recepientId] || item.recepientId}
      </Text>
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
      {/* Header with Title and Notification Bell */}
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