import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Client, Databases, Storage } from 'appwrite';

// Define types
interface FormData {
    title: string;
    image: string;
    portion: string;
    nationality: string;
    price: string;
}

// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('6781017700246429b65a');

const databases = new Databases(client);
const storage = new Storage(client);

const MyPosts: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        image: '',
        portion: '',
        nationality: '',
        price: '',
    });

    const handleChange = (name: keyof FormData, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const pickImage = async (): Promise<string | undefined> => {
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
            return result.assets[0].uri;
        }
    };

    const uploadImageToAppwrite = async (imageUri: string): Promise<string | undefined> => {
        try {
            const file = new File([imageUri], `image_${Date.now()}.jpg`, { type: 'image/jpeg' });

            const response = await storage.createFile(
                '67c4a5fd0017cc988880', // Bucket ID
                'unique()',
                file
            );

            console.log('Image uploaded:', response);

            return storage.getFileView('67c4a5fd0017cc988880', response.$id);
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image.');
        }
    };

    const handleImageUpload = async () => {
        const imageUri = await pickImage();
        if (!imageUri) return;

        const fileUrl = await uploadImageToAppwrite(imageUri);
        if (fileUrl) {
            handleChange('image', fileUrl);
            Alert.alert('Success', 'Image uploaded successfully!');
        }
    };

    const saveFoodItem = async () => {
        try {
            const response = await databases.createDocument(
                '679bbd65000ae52d302b',
                '679bbf04000441fd0477',
                'unique()',
                formData
            );
            console.log('Food item saved:', response);
            Alert.alert('Success', 'Food item posted successfully!');
        } catch (error) {
            console.error('Error saving food item:', error);
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
            {formData.image ? <Image source={{ uri: formData.image }} style={styles.image} /> : null}
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
                value={formData.price}
                onChangeText={(text) => handleChange('price', text)}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={saveFoodItem}>
                <Text style={styles.buttonText}>Post Item</Text>
            </TouchableOpacity>
        </View>
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
