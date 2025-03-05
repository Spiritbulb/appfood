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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // For handling file uploads
import { StatusBar } from 'expo-status-bar';
import * as MediaLibrary from 'expo-media-library';
import axios from 'axios';

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
    nationality: string;
    price: string | number;
}

const MyPosts = () => {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        image: '', // This will store the image URL
        portion: '',
        ingredients: '', 
        nationality: '',
        price: '',
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // For preview

    const handleChange = (name: string, value: string | number) => {
        setFormData({ ...formData, [name]: value });
    };

    const pickImage = async () => {
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
        if (!formData.title || !formData.image || !formData.portion || !formData.nationality || !formData.price) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
    
        try {
            // Ensure the image URL is included in the form data
            const formDataWithImage = { ...formData, image: formData.image };
    
            // Save the form data (including the image URL) to the database
            await saveFoodItem(formDataWithImage);
            Alert.alert('Success', 'Food item posted successfully!');
        } catch (error) {
            console.error('Error posting item:', error);
            Alert.alert('Error', 'Failed to post food item.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on platform
            style={{ flex: 1 }}
        >
            <StatusBar backgroundColor="#500000" />
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside
            >
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>Select Image</Text>
                </TouchableOpacity>
                {/* Display the selected image for preview */}
                {selectedImage ? (
                    <View style={styles.foodCardPreview}>
                        <Image
                            source={{ uri: selectedImage }} // Use the selected image URI
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={styles.overlay}>
                            <Text style={styles.foodTitle}>{formData.title || 'Food Name'}</Text>
                            <Text style={styles.foodDetail}>{formData.portion || 'Portion Size'}</Text>
                            <Text style={styles.foodDetail}>{formData.nationality || 'Nationality'}</Text>
                            <Text style={styles.foodPrice}>Ksh {formData.price || 'Price'}</Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.placeholderText}>No image selected</Text>
                )}
                <TextInput
                    style={styles.input}
                    placeholder="Food Item Name"
                    value={formData.title}
                    onChangeText={(text) => handleChange('title', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Portion"
                    value={formData.portion}
                    onChangeText={(text) => handleChange('portion', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nationality"
                    value={formData.nationality}
                    onChangeText={(text) => handleChange('nationality', text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Price"
                    value={formData.price.toString()} // Ensure value is a string
                    onChangeText={(text) => handleChange('price', text)}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Post Item</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default MyPosts;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        marginTop: 9,
        
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#FFD700',
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
    image: {
        width: 270,
        height: 320, // Adjust height as needed
        borderRadius: 8,
        marginBottom: 15,
        marginLeft: 35,
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
        marginBottom: 20,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slight dark overlay for better visibility
        borderRadius: 8,
    },
    foodTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    foodDetail: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 5,
    },
    foodPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
    },
});