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
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the FormData interface
interface FormData {
  title: string;
  image: string; // This will store the image URL
  portion: string;
  ingredients: string;
  description: string;
  nationality: string;
}

const MyPosts = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    image: '',
    portion: '',
    ingredients: '',
    description: '',
    nationality: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // For preview
  const [uploading, setUploading] = useState<boolean>(false); // Track upload status

  const handleChange = (name: string, value: string) => {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      const file = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await axios.post(
        'https://plate-pals.handler.spiritbulb.com/upload-image',
        { file, fileName: `plate-pals/${Date.now()}.png` },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to upload image');
      }

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

    setUploading(true);

    try {
      const fileUrl = await uploadImageToWorker(selectedImage);
      if (fileUrl) {
        handleChange('image', fileUrl);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        throw new Error('File URL is undefined');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const saveFoodItem = async (formData: FormData) => {
    try {
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
    if (!formData.title || !formData.image || !formData.portion || !formData.ingredients || !formData.description || !formData.nationality) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const formDataWithImage = { ...formData, image: formData.image };
      await saveFoodItem(formDataWithImage);
      Alert.alert('Success', 'Food item posted successfully!');

      setFormData({
        title: '',
        image: '',
        portion: '',
        ingredients: '',
        description: '',
        nationality: '',
      });
      setSelectedImage(null);

      router.push('/');
    } catch (error) {
      console.error('Error posting item:', error);
      Alert.alert('Error', 'Failed to post food item.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar backgroundColor="#500000" />

          {selectedImage ? (
            <View style={styles.foodCardPreview}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.overlay}>
                <Text style={styles.foodTitle}>{formData.title || 'Food Name'}</Text>
                <View style={styles.row}>
                  <Text style={styles.foodDetail}>{formData.nationality || 'Nationality'}</Text>
                  <Text style={styles.foodDetail}>{formData.portion || 'Portion Size'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.foodDetail}>{formData.ingredients || 'Ingredients'}</Text>
                  <Text style={styles.foodDetail}>{formData.description || 'Description'}</Text>
                </View>
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
              <ActivityIndicator color="#fff" />
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
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={uploading}>
              <Text style={styles.submitButtonText}>Post Item</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MyPosts;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
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
    fontSize: 16,
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
    fontSize: 16,
  },
  foodCardPreview: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
    borderRadius: 12,
    overflow: 'hidden',
    height: 350, // Fixed height for consistency
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  foodDetail: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
    textAlign: 'left',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#500000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});