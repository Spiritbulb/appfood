import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';

const NewChat = ({ user, recepientId, onSendFirstMessage }) => {
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (inputText.trim() && recepientId) {
      const message = {
        type: 'message',
        to: recepientId,
        text: inputText,
        timestamp: Date.now(),
      };
      onSendFirstMessage(message); // Send the first message
      setInputText(''); // Clear the input field
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start a new chat with {recepientId}</Text>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type your first message..."
      />
      <Button
        title="Send"
        onPress={handleSendMessage}
        disabled={!inputText.trim()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
});

export default NewChat;