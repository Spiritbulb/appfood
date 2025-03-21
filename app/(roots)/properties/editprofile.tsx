import React, { useState, useEffect } from 'react';
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
import { useGlobalContext } from '@/lib/global-provider';
import { StatusBar } from 'expo-status-bar';
import images from '@/constants/images';

// Define the FormData interface
interface FormData {
    image: string; // This will store the image URL
    name: string;
    user_id: string | undefined;
}






const EditProfile: React.FC = () => {
    const context = useGlobalContext();
    const user = context.user;
    const [formData, setFormData] = useState<FormData>({
        image: '', // This will store the image URL
        name: '',
        user_id: user?.email,
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // For preview
    const [fetchedUser, setFetchedUser] = useState<{ name: string; image: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);



    // Fetch user data from the API
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(
                    `https://plate-pals.handler.spiritbulb.com/api/user-data?query=${user?.email}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json();

                // Check if the response contains results
                if (data.success && data.results && data.results.length > 0) {
                    const userData = data.results[0]; // Use the first result
                    setFetchedUser({
                        name: userData.name,
                        image: userData.image,
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to fetch user data");
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, [user?.email]);

    const handleChange = (name: keyof FormData, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const uploadImage = async (imageUri: string): Promise<string | undefined> => {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            return new Promise((resolve, reject) => {
                reader.onloadend = async () => {
                    const base64data = reader.result as string;
                    const base64 = base64data.split(',')[1]; // Remove the data URL prefix
                    const fileName = `user_${formData.user_id}_${Date.now()}.png`; // Generate a unique file name

                    const uploadResponse = await fetch('https://plate-pals.handler.spiritbulb.com/upload-image', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            file: base64,
                            fileName: fileName,
                        }),
                    });

                    if (!uploadResponse.ok) {
                        throw new Error('Failed to upload image');
                    }

                    const { fileUrl } = await uploadResponse.json();
                    resolve(fileUrl);
                };
                reader.onerror = () => {
                    reject(new Error('Failed to read image'));
                };
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload image.');
            return undefined;
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage) {
            Alert.alert('Error', 'Please select an image first.');
            return;
        }

        try {
            const fileUrl = await uploadImage(selectedImage);
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




    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to your media library to upload images.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // Allow the user to crop/edit the image
            aspect: [1, 1], // Aspect ratio for cropping
            quality: 1, // Image quality (0 to 1)
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri); // Set the selected image URI for preview
        }

    };





    const handleSubmit = async () => {



        console.log("IMG: ", formData?.image);
        const response = await fetch('https://plate-pals.handler.spiritbulb.com/api/edit-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        Alert.alert('Success', 'Profile updated!');






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
                <View>
                    <Text style={styles.message}>Edit your profile</Text>
                </View>


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
                    <View>
                        <Image
                            source={{ uri: fetchedUser?.image }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                )}

                <TouchableOpacity style={styles.button} onPress={pickImage}>
                    <Text style={styles.buttonText}>Select Image</Text>
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder={fetchedUser?.name}
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
    message: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#500000',
        marginBottom: 40,
        left: 1,
        top: 4,
    },
    container: {
        flexGrow: 1,
        padding: 30,
        justifyContent: 'center',
        backgroundColor: '#666',
        backgroundImage: images.foodimage,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        marginBottom: 15,
        padding: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        backgroundColor: '#FFD700',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
    },
    foodCardPreview: {
        position: 'relative',
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: 320, // Adjust height as needed
        borderRadius: 18,
        marginBottom: 15,
        marginLeft: 17,
        position: 'relative',
        top: 3,
        right: 18,
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: 320,
        top: 9,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.17)', // Slight dark overlay for better visibility
        borderRadius: 8,
    },
    foodTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
});