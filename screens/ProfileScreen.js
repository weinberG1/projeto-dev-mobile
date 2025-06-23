import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    ScrollView,
    Alert,
    Image,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

import { DangerButton, SecondaryButton } from '../components/Button.js';

export default function ProfileScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const viewedEmail = route?.params?.email || auth.currentUser.email;
    const isOwnProfile = viewedEmail === auth.currentUser.email;

    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [imageUri, setImageUri] = useState('');

    const pickImage = async () => {
        let options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };
    
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                let uri = response.assets[0].uri;
                setImageUri(uri);
            }
        });
    };

    const fetchUserData = async () => {
        try {
            const userQuery = query(collection(db, 'users'), where('email', '==', viewedEmail));
            const snapshot = await getDocs(userQuery);

            if (!snapshot.empty) {
                const userDoc = snapshot.docs[0];
                const data = userDoc.data();
                setUserData({ id: userDoc.id, ...data });
                setName(data.name || '');
                setPhone(data.phone || '');
                setImageUri(data.photo || '');
            }

            const postsQuery = query(collection(db, 'posts'), where('autor', '==', viewedEmail));
            const postsSnapshot = await getDocs(postsQuery);
            const userPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(userPosts);

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados.');
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            const userDocRef = doc(db, 'users', userData.id);
            await updateDoc(userDocRef, {
                name,
                phone,
                photo: imageUri
            });
            Alert.alert('Sucesso', 'Perfil atualizado!');
            setEditMode(false);
            setUserData(prev => ({
                ...prev,
                name,
                phone,
                photo: imageUri
            }));
        } catch (err) {
            Alert.alert('Erro', 'Erro ao salvar perfil');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!isOwnProfile) return;
        
        Alert.alert(
            "Confirmar exclusão",
            "Tem certeza que deseja excluir esta publicação?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'posts', postId));
                            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                        } catch (error) {
                            console.error('Erro ao excluir post:', error);
                            Alert.alert('Erro', 'Não foi possível excluir a publicação');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    useEffect(() => {
        fetchUserData();
    }, [viewedEmail]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#27428f" />
                </View>
            </SafeAreaView>
        );
    }

    const renderPostItem = (item) => (
        <View style={styles.postCard} key={item.id}>
            {item.foto && (
                <Image source={{ uri: item.foto }} style={styles.postImage} />
            )}
            
            <Text style={styles.postDescription}>{item.descricao}</Text>
            
            {item.localizacao && (
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={16} color="#888" />
                    <Text style={styles.locationText}>{item.localizacao}</Text>
                </View>
            )}
            
            <View style={styles.postFooter}>
                <View style={styles.likeContainer}>
                    <Ionicons name="heart" size={20} color="#888" />
                    <Text style={styles.likeCount}>{item.likes?.length || 0} curtidas</Text>
                </View>
                
                {isOwnProfile && (
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeletePost(item.id)}
                    >
                        <Ionicons name="trash-outline" size={22} color="#888" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#27428f" />
                </TouchableOpacity>
                <Text style={styles.title}>Perfil</Text>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.profileSection}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>
                                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                    )}

                    {editMode ? (
                        <View style={styles.editForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome"
                                value={name}
                                onChangeText={setName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Telefone"
                                value={phone}
                                onChangeText={setPhone}
                            />
                            <SecondaryButton action={pickImage} text="Selecionar nova imagem" />
                            <DangerButton text="Salvar alterações" action={saveProfile} />
                            <SecondaryButton action={() => setEditMode(false)} text="Cancelar" />
                        </View>
                    ) : (
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{userData?.name || 'Usuário'}</Text>
                            <Text style={styles.userEmail}>{userData?.email}</Text>
                            {userData?.phone && (
                                <Text style={styles.userPhone}>{userData.phone}</Text>
                            )}

                            {isOwnProfile && (
                                <View style={styles.profileActions}>
                                    <SecondaryButton
                                        action={() => setEditMode(true)}
                                        text="Editar perfil"
                                    />
                                    <View style={{ height: 10 }} />
                                    <DangerButton
                                        text="Sair da conta"
                                        action={() => signOut(auth)}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.postsSection}>
                    <Text style={styles.sectionTitle}>Publicações</Text>
                    {posts.length > 0 ? (
                        posts.map(item => renderPostItem(item))
                    ) : (
                        <View style={styles.emptyPostsContainer}>
                            <Text style={styles.emptyPostsText}>Nenhuma publicação encontrada</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    backButton: {
        position: 'absolute',
        left: 15,
        zIndex: 10,
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
        color: '#27428f'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 30,
    },
    profileSection: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#27428f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    placeholderText: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold'
    },
    profileInfo: {
        alignItems: 'center'
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 5
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5
    },
    userPhone: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15
    },
    profileActions: {
        width: '100%',
        marginTop: 15
    },
    editForm: {
        width: '100%'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        width: '100%',
        backgroundColor: '#fff'
    },
    postsSection: {
        padding: 15
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#27428f'
    },
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden'
    },
    postImage: {
        width: '100%',
        height: 200,
    },
    postDescription: {
        fontSize: 16,
        padding: 12
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 10
    },
    locationText: {
        fontSize: 14,
        color: '#888',
        marginLeft: 4
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        padding: 12
    },
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    likeCount: {
        marginLeft: 5,
        color: '#666'
    },
    deleteButton: {
        padding: 5
    },
    emptyPostsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30
    },
    emptyPostsText: {
        fontSize: 16,
        color: '#888'
    }
});
