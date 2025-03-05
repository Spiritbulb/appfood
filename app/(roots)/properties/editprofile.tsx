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
import { Client, Databases, Storage } from 'appwrite'; // Appwrite SDK
import { StatusBar } from 'expo-status-bar';

// Define the FormData interface
interface FormData {
    image: string; // This will store the image URL
    name: string;
}

// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('6781017700246429b65a'); // Your Appwrite project ID

const databases = new Databases(client);
const storage = new Storage(client);

const EditProfile: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        image: '', // This will store the image URL
        name: '',
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // For preview

    const handleChange = (name: keyof FormData, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to your media library to upload images.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // Allow the user to crop/edit the image
            aspect: [3, 4], // Aspect ratio for cropping
            quality: 1, // Image quality (0 to 1)
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri); // Set the selected image URI for preview
        }
    };

    const uploadImageToAppwrite = async (imageUri: string): Promise<string | undefined> => {
        try {
            // Convert the image URI to a Blob or File object
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const file = new File([blob], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });

            const uploadResponse = await storage.createFile(
                '67c4a5fd0017cc988880', // Bucket ID
                'unique()',
                file
            );
            console.log('Image uploaded:', uploadResponse);

            const fileUrl = storage.getFileView('67c4a5fd0017cc988880', uploadResponse.$id);
            return fileUrl;
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
            const fileUrl = await uploadImageToAppwrite(selectedImage);
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
            const response = await databases.createDocument(
                '679bbd65000ae52d302b', // Replace with your database ID
                '679bbf04000441fd0477', // Replace with your collection ID
                'unique()', // Unique ID for the document
                {
                    image: formData.image,
                    name: formData.name,
                }
            );
            console.log('New profile saved:', response);
            return response;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!formData.image || !formData.name) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        try {
            await saveFoodItem(formData);
            Alert.alert('Success', 'Profile updated!');
        } catch (error) {
            console.error('Error updating item:', error);
            Alert.alert('Error', 'Failed to update user item.');
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
                            <Text style={styles.foodTitle}>{formData.name || 'User Name'}</Text>
                        </View>
                    </View>
                ) : (
                    <Text style={styles.placeholderText}>No image selected</Text>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="User Name"
                    value={formData.name}
                    onChangeText={(text) => handleChange('name', text)} // Fixed: Changed 'title' to 'name'
                />

                <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Update Profile</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EditProfile;

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
});