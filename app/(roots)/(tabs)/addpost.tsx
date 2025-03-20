import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // For handling file uploads
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation for navigation
import { router } from 'expo-router';

const requestPermissions = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Please allow access to your media library to upload images.');
  }
};

// Define the FormData interface
interface FormData {
  title: string;
  image: string; // This will store the image URL
  portion: string;
  ingredients: string;
  description: string;
  nationality: string;
  user_id: string;
}

const MyPosts = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [formData, setFormData] = useState<FormData>({
    title: '',
    image: '', // This will store the image URL
    portion: '',
    ingredients: '',
    description: '',
    nationality: '',
    user_id: 'user?.email',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For preview
  const [uploading, setUploading] = useState<boolean>(false); // Track upload status

  const handleChange = (name: string, value: string | number) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = async () => {
    if (uploading) {
      Alert.alert('Upload in progress', 'Please wait for the current upload to complete or cancel it by selecting a new image.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your media library to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use ImagePicker.MediaTypeOptions.Images
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Set the selected image URI for preview
    }
  };

  const uploadImageToWorker = async (imageUri: string) => {
    try {
      // Step 1: Read the image file as binary data
      const file = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Step 2: Upload the image to the Worker
      const response = await axios.post(
        'https://plate-pals.handler.spiritbulb.com/upload-image',
        { file, fileName: `plate-pals/${Date.now()}.png` }, // Include a unique file name
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to upload image');
      }

      // Step 3: Return the public URL of the uploaded image
      return response.data.fileUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    setUploading(true); // Set uploading status to true

    try {
      const fileUrl = await uploadImageToWorker(selectedImage);
      if (fileUrl) {
        handleChange('image', fileUrl); // Store the image URL in state
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        throw new Error('File URL is undefined');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploading(false); // Reset uploading status
    }
  };

  const saveFoodItem = async (formData: FormData) => {
    try {
      // Save form data to D1 via the Cloudflare Worker
      const response = await fetch('https://plate-pals.handler.spiritbulb.com/save-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save form data');
      }

      console.log('Food item saved:', response);
      return response;
    } catch (error) {
      console.error('Error saving food item:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.image || !formData.portion || !formData.ingredients || !formData.description || !formData.nationality || !formData.user_id) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      // Ensure the image URL is included in the form data
      const formDataWithImage = { ...formData, image: formData.image };

      // Save the form data (including the image URL) to the database
      await saveFoodItem(formDataWithImage);
      Alert.alert('Success', 'Food item posted successfully!');

      // Clear the form inputs
      setFormData({
        title: '',
        image: '',
        portion: '',
        ingredients: '',
        description: '',
        nationality: '',
        user_id: 'user?.email',
      });
      setSelectedImage(null); // Clear the selected image

      // Redirect to the Explore page

      router.push('/'); // Replace 'Explore' with the actual name of your Explore screen
    } catch (error) {
      console.error('Error posting item:', error);
      Alert.alert('Error', 'Failed to post food item.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar backgroundColor="#500000" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {selectedImage ? (
          <View style={styles.foodCardPreview}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.overlay}>
              <Text style={styles.foodTitle}>{formData.title || 'Food Name'}</Text>
              <Text style={styles.foodDetail}>{formData.nationality || 'Nationality'}</Text>
              <Text style={styles.foodDetail}>{formData.ingredients || 'Ingredients'}</Text>
              <Text style={styles.foodDetail}>{formData.description || 'Description'}</Text>
              <Text style={styles.foodDetail}>{formData.portion || 'Portion Size'}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.placeholderText}>No image selected</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={pickImage} disabled={uploading}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleImageUpload} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>Upload Image</Text>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Food Item Name"
          value={formData.title}
          onChangeText={(text) => handleChange('title', text)}
          editable={!uploading}
        />
        <TextInput
          style={styles.input}
          placeholder="Portion"
          value={formData.portion}
          onChangeText={(text) => handleChange('portion', text)}
          editable={!uploading}
        />
        <TextInput
          style={styles.input}
          placeholder="Ingredients"
          value={formData.ingredients}
          onChangeText={(text) => handleChange('ingredients', text)}
          editable={!uploading}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={formData.description}
          onChangeText={(text) => handleChange('description', text)}
          editable={!uploading}
        />
        <TextInput
          style={styles.input}
          placeholder="Nationality"
          value={formData.nationality}
          onChangeText={(text) => handleChange('nationality', text)}
          editable={!uploading}
        />
        <View style={{ paddingBottom: 90 }}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={uploading}>
            <Text style={styles.buttonText}>Post Item</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MyPosts;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    marginTop: 20,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  input: {
    height: 50,
    borderColor: '#500000',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#eab620',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    paddingBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 15,
  },
  foodCardPreview: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  image: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 40,
    top: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 12,
  },
  foodTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  foodDetail: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 5,
  },
});