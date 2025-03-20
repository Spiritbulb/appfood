// app/chat.js
import { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useGlobalContext } from '@/lib/global-provider';

import { RouteProp } from '@react-navigation/native';

type ChatScreenRouteProp = RouteProp<{ params: { recipientId: string } }, 'params'>;

const ChatScreen = ({ route }: { route: ChatScreenRouteProp }) => {
  const { recipientId } = route.params || {}; // Get recipientId from navigation (fallback to empty object)
  const { user } = useGlobalContext(); // Get current user from global context
  const [messages, setMessages] = useState<{ from: string; text: string; timestamp: string }[]>([]); // Store chat messages
  const [inputText, setInputText] = useState(''); // Store input text
  const [loading, setLoading] = useState(true); // Loading state for fetching chat history
  const socket = useRef<WebSocket | null>(null); // WebSocket reference

  // Generate DM channel ID (only if recipientId is available)
  const dmChannelId = recipientId ? [user?.email, recipientId].sort().join('-') : null;

  // Fetch chat history on mount (only if recipientId is available)
  useEffect(() => {
    if (!recipientId) {
      setLoading(false); // Skip fetching if recipientId is missing
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
  }, [dmChannelId, recipientId]);

  // Connect to WebSocket (only if recipientId is available)
  useEffect(() => {
    if (!recipientId || !user?.email) return; // Ensure recipientId and user are available

    const wsUrl = `wss://dm-worker.your-domain.workers.dev/dm/${dmChannelId}/ws?userId=${user.email}`;
    socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      console.log('Connected to DM channel');
    };

    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.current.onclose = () => {
      console.log('Disconnected from DM channel');
    };

    // Cleanup on unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [user?.email, dmChannelId, recipientId]);

  // Send a message (only if recipientId is available)
  const sendMessage = () => {
    if (socket.current && inputText.trim() && recipientId) {
      const message = {
        type: 'message',
        to: recipientId,
        text: inputText,
      };
      socket.current.send(JSON.stringify(message));
      setInputText('');
    }
  };

  // Render a single chat message
  const renderMessage = ({ item }: { item: { from: string; text: string; timestamp: string } }) => (
    <View style={item.from === user?.email ? styles.myMessage : styles.otherMessage}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  // Render loading spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#eab620" />
      </View>
    );
  }

  // Render fallback if recipientId is missing
  if (!recipientId) {
    return (
      <View style={styles.noChatsContainer}>
        <Text style={styles.noChatsText}>Please select a chat to start messaging.</Text>
      </View>
    );
  }

  // Render "No Chats" screen if there are no messages
  if (messages.length === 0) {
    return (
      <View style={styles.noChatsContainer}>
        <Text style={styles.noChatsText}>No chats yet. Start a conversation!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        inverted // Start from the bottom
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message"
          editable={!!recipientId} // Disable input if recipientId is missing
        />
        <Button
          title="Send"
          onPress={sendMessage}
          disabled={!recipientId} // Disable button if recipientId is missing
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noChatsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    padding: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
});

export default ChatScreen;