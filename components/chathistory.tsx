import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import ChatMessage from './chatmessage';
import { useWebSocket } from './WebSocketManager';

interface ChatHistoryProps {
  user: { email: string };
  recepientId: string;
  dmChannelId: string;
  onGoBack: () => void; // Add onGoBack prop
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ user, recepientId, dmChannelId, onGoBack }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const { sendMessage, isConnected, setOnMessageCallback } = useWebSocket();

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`https://chat.spiritbulb.workers.dev/dm/${dmChannelId}/history`);
        const history = await response.json();
        setMessages(history);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [dmChannelId]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputText.trim() && recepientId) {
      const message = {
        type: 'message',
        to: recepientId,
        text: inputText,
        timestamp: Date.now(),
        from: user?.email,
      };
      sendMessage(message); // Send the message via WebSocket
      setMessages((prevMessages) => [...prevMessages, message]); // Add the message to local state
      setInputText(''); // Clear the input field
    }
  };

  // Set callback for incoming messages
  useEffect(() => {
    setOnMessageCallback((message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  // Render a single chat message
  const renderMessage = ({ item }) => (
    <ChatMessage
      message={item}
      isCurrentUser={item.from === user?.email}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.recipientText}>Chatting with: {recepientId}</Text>
      </View>

      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          
        />
      </View>

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
          disabled={!inputText.trim() || !isConnected}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  recipientText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 0.8,
  },
  messagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 10,
    marginLeft: 20,
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
});

export default ChatHistory;