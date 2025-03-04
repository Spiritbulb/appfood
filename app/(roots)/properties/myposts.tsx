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
import * as FileSystem from 'expo-file-system'; // For handling file uploads
import { StatusBar } from 'expo-status-bar';

// Define the FormData interface
interface FormData {
    title: string;
    image: string; // This will store the image URL
    portion: string;
    nationality: string;
    price: string | number;
}


// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your Appwrite endpoint
    .setProject('6781017700246429b65a'); // Your Appwrite project ID

const databases = new Databases(client);
const storage = new Storage(client);

const MyPosts = () => {

    const [formData, setFormData] = useState<FormData>({

        title: '',
        image: '', // This will store the image URL
        portion: '',
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

    const uploadImageToAppwrite = async (imageUri) => {
        try {
            const file = {
                uri: imageUri,
                name: `image_${Date.now()}.jpg`,
                type: 'image/jpg',
            };
            const response = await storage.createFile('67c4a5fd0017cc988880', file);
            console.log('Image uploaded:', response);
//testing
            const fileUrl = storage.getFileView('67c4a5fd0017cc988880', response.$id);
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

                    name: formData.title, // Add the required "name" field

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
                {/* Display the selected image for preview foodcard  */}
                {selectedImage &&(
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
                        
                )} : (
                    <Text style={styles.placeholderText}>No image selected</Text>
                )
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
                     value={formData.price.toString()}
                     onChangeText={(text) => handleChange('price', text)}
                     keyboardType="numeric"
                 />


                <TouchableOpacity style={styles.button} onPress={handleImageUpload}>
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>
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
    

