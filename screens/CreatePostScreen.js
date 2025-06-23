import React, { useState, useEffect } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen() {
    const navigation = useNavigation();
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        // Request permissions when component mounts
        (async () => {
            // Request camera permissions
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o acesso à câmera para tirar fotos.');
            }
            
            // Request media library permissions
            const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaStatus !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o acesso à galeria de fotos.');
            }
            
            // Request location permission
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (locationStatus !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o acesso à localização para adicionar a localização ao seu post.');
            }
        })();
    }, []);

    const takePicture = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            
            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Erro ao tirar foto:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto');
        }
    };
    
    const pickImageFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            
            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem');
        }
    };

    const getCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o acesso à localização para adicionar a localização ao seu post.');
                setLocationLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });

            if (address && address.length > 0) {
                const { city, region } = address[0];
                const locationName = city ? `${city}, ${region || ''}` : region || 'Localização atual';
                setLocation(locationName);
            } else {
                setLocation('Localização atual');
            }
        } catch (error) {
            console.log('Error getting location:', error);
            Alert.alert('Erro', 'Não foi possível obter sua localização.');
        } finally {
            setLocationLoading(false);
        }
    };

    const createPost = async () => {
        if (!imageUri) {
            Alert.alert('Erro', 'É necessário tirar uma foto para publicar');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Erro', 'É necessário adicionar uma descrição');
            return;
        }

        try {
            setLoading(true);
            
            // Get current user's profile info
            const userQuery = query(collection(db, 'users'), where('email', '==', auth.currentUser.email));
            const userSnapshot = await getDocs(userQuery);
            
            let autorNome = '';
            let autorFoto = '';
            
            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                autorNome = userData.name || '';
                autorFoto = userData.photo || '';
            }

            await addDoc(collection(db, 'posts'), {
                autor: auth.currentUser.email,
                autorNome: autorNome,
                autorFoto: autorFoto,
                descricao: description,
                localizacao: location,
                foto: imageUri,
                likes: [],
                timestamp: serverTimestamp()
            });

            Alert.alert('Sucesso', 'Treino publicado com sucesso!');
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao criar post:', error);
            Alert.alert('Erro', 'Não foi possível publicar o treino');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#27428f" />
                </TouchableOpacity>
                <Text style={styles.title}>Novo Treino</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imageOptions}>
                            <TouchableOpacity 
                                style={styles.imageOptionButton} 
                                onPress={takePicture}
                            >
                                <Ionicons name="camera" size={40} color="#27428f" />
                                <Text style={styles.imageOptionText}>Câmera</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.imageOptionButton} 
                                onPress={pickImageFromGallery}
                            >
                                <Ionicons name="images" size={40} color="#27428f" />
                                <Text style={styles.imageOptionText}>Galeria</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    
                    {imageUri && (
                        <View style={styles.imageActions}>
                            <TouchableOpacity 
                                style={styles.imageActionButton}
                                onPress={takePicture}
                            >
                                <Ionicons name="camera" size={20} color="#27428f" />
                                <Text style={styles.imageActionText}>Nova foto</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.imageActionButton}
                                onPress={pickImageFromGallery}
                            >
                                <Ionicons name="images" size={20} color="#27428f" />
                                <Text style={styles.imageActionText}>Galeria</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Descreva seu treino..."
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                <TouchableOpacity 
                    style={styles.locationContainer}
                    onPress={getCurrentLocation}
                    disabled={locationLoading}
                >
                    <Ionicons name="location-outline" size={24} color="#888" />
                    {locationLoading ? (
                        <ActivityIndicator size="small" color="#27428f" style={{marginLeft: 10}} />
                    ) : location ? (
                        <Text style={styles.locationText}>{location}</Text>
                    ) : (
                        <Text style={styles.locationPlaceholder}>Adicionar localização</Text>
                    )}
                </TouchableOpacity>

                {loading ? (
                    <ActivityIndicator size="large" color="#27428f" style={styles.loader} />
                ) : (
                    <PrimaryButton text="Publicar" action={createPost} />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
        position: 'relative',
        paddingHorizontal: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        color: '#27428f'
    },
    backButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 20
    },
    imageOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20
    },
    imageOptionButton: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#e6e6e6',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    },
    imageOptionText: {
        marginTop: 8,
        color: '#27428f',
        fontSize: 16
    },
    previewImage: {
        width: 250,
        height: 250,
        borderRadius: 8,
        marginBottom: 10
    },
    imageActions: {
        flexDirection: 'row',
        marginTop: 10
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        padding: 8
    },
    imageActionText: {
        color: '#27428f',
        marginLeft: 5
    },
    input: {
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        marginBottom: 16
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 16,
        marginBottom: 24
    },
    locationText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10
    },
    locationPlaceholder: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
        color: '#888'
    },
    loader: {
        marginVertical: 16
    }
}); 