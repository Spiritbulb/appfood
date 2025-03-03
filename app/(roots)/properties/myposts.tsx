import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Client, Databases, Storage } from 'react-native-appwrite';

// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('6781017700246429b65a'); // Your Appwrite project ID

const databases = new Databases(client);
const storage = new Storage(client);

const MyPosts = () => {
    const [formData, setFormData] = useState({
        title: '',
        image: '', // This will store the image URL
        portion: '',
        nationality: '',
        price: '',


    });

    const handleChange = (name, value) => {
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
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            return result.uri; // Return the selected image URI
        }
    };

    const uploadImageToAppwrite = async (imageUri) => {
        try {
            const file = {
                uri: imageUri,
                name: `image_${Date.now()}.jpg`,
                type: 'image/jpg',
            };
            const response = await storage.createFile('67c4a5fd0017cc988880', file);
            console.log('Image uploaded:', response);

            const fileUrl = storage.getFileView('67c4a5fd0017cc988880', response.$id);
            return fileUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const handleImageUpload = async () => {
        try {
            const imageUri = await pickImage();
            if (!imageUri) return;

            const fileUrl = await uploadImageToAppwrite(imageUri);
            handleChange('image', fileUrl);
            Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image.');
        }
    };

    const saveFoodItem = async (formData) => {
        try {
            const response = await databases.createDocument(
                '679bbd65000ae52d302b', // Replace with your database ID
                '679bbf04000441fd0477', // Replace with your collection ID
                'unique()', // Unique ID for the document
                {
                    title: formData.title,
                    image: formData.image,
                    portion: formData.portion,
                    nationality: formData.nationality,
                    price: formData.price,
                }
            );
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
            await saveFoodItem(formData);
            Alert.alert('Success', 'Food item posted successfully!');
        } catch (error) {
            console.error('Error posting item:', error);
            Alert.alert('Error', 'Failed to post food item.');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Food Item Name"
                value={formData.title}
                onChangeText={(text) => handleChange('title', text)}
            />
            <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
                <Text style={styles.buttonText}>Upload Image</Text>
            </TouchableOpacity>
            {/* Display the uploaded image */}
            {formData.image ? (
                <Image
                    source={{ uri: formData.image }}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : null}
            {/* Upload button (visible only after image selection) */}
            {formData.image && (
                <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>
            )}
            <TextInput
                style={styles.input}
                placeholder="Portion"
                value={formData.portion}
                onChangeText={(text) => handleChange('portion', text)}
            />
            <TextInput
                style={styles.input}
                placeholder="nationality"
                value={formData.nationality}
                onChangeText={(text) => handleChange('nationality', text)}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                value={formData.price}
                onChangeText={(text) => handleChange('price', text)}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Post Item</Text>
            </TouchableOpacity>
        </View>
    );
};
    );
};

export default MyPosts;

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 15,
    },
});