import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatMessage = ({ message, isCurrentUser }) => {
  return (
    <View style={isCurrentUser ? styles.myMessage : styles.otherMessage}>
      <Text style={styles.messageText}>{message.text}</Text>
      <Text style={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ChatMessage;