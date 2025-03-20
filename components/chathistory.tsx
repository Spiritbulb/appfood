import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, StyleSheet, TextInput, Button, Text } from 'react-native';
import ChatMessage from './chatmessage'; // Assuming you have a ChatMessage component for rendering individual messages

const ChatHistory = ({ user, recepientId, messages, setMessages, dmChannelId, onSendMessage }) => {
  const socket = useRef<WebSocket | null>(null);
  const [inputText, setInputText] = useState('');

  // Function to send a message
  const handleSendMessage = () => {
    if (inputText.trim() && recepientId) {
      const message = {
        type: 'message',
        to: recepientId,
        text: inputText,
        timestamp: Date.now(),
        from: user?.email, // Add the sender's email
      };
      onSendMessage(message); // Send the message
      setInputText(''); // Clear the input field
    }
  };

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!recepientId || !user?.email || !dmChannelId) return;

    const wsUrl = `wss://chat.spiritbulb.workers.dev/dm/${dmChannelId}/ws?userId=${user.email}`;
    socket.current = new WebSocket(wsUrl);

    socket.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    socket.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]); // Add the new message to the list
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
      {/* Recipient Display at the Top */}
      <View style={styles.recipientContainer}>
        <Text style={styles.recipientText}>Chatting with: {recepientId}</Text>
      </View>

      {/* Chat History */}
      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          inverted // Start from the bottom
        />
      </View>

      {/* Input field and send button */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999"
        />
        <Button
          title="Send"
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recipientContainer: {
    padding: 10,
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  recipientText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 0.8, 
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    marginLeft: 20, // Add some padding at the bottom
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    justifyContent: 'space-between',
    padding: 10,
  },
  input: {
    flex: 0.95,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    bottom: 0,
    height: '100%',
    width: '90%',
  },
  sendButton: {
    flex: 1,
    marginLeft: 100,
  },
});

export default ChatHistory;