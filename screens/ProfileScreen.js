import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    FlatList,
    Alert,
    Image
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useRoute } from '@react-navigation/native';

import { auth, db } from '../firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc
} from 'firebase/firestore';

import { DangerButton, SecondaryButton } from '../components/Button.js';

export default function ProfileScreen() {
    const route = useRoute();
    const viewedEmail = route?.params?.email || auth.currentUser.email;

    const [userData, setUserData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [imageUri, setImageUri] = useState('');

    //These are the functions responsible to do the image picking:

    // pickImage() and

    // launchImageLibrary()

    //The first one have the role of setting some configurations to the image, like transforming the image into a string 64, with determined height and width, including the media type as photo.

    //The second one, by this time, has this role: if the user wants to cancel the image picking, enters into the 'didCancel' condition. However, if occurred some error, it is printed the error into terminal. But, if no error is detected, it is found the URI's image and passed, into 'setImageUri' as path to find the image inside gallery.

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

    useEffect(() => {
        fetchUserData();
    }, [viewedEmail]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#27428f" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Perfil</Text>

                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text>Sem photo</Text>
                    </View>
                )}

                {editMode ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Nome:</Text>
                        <Text style={styles.info}>{userData?.name || 'Não informado'}</Text>

                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.info}>{userData?.email}</Text>

                        <Text style={styles.label}>Telefone:</Text>
                        <Text style={styles.info}>{userData?.phone || 'Não informado'}</Text>

                        {viewedEmail === auth.currentUser.email && (
                            <SecondaryButton
                                action={() => setEditMode(true)}
                                text="Editar perfil"
                            />
                        )}
                    </>
                )}

                <Text style={styles.label}>Publicações:</Text>
                <FlatList
                    data={posts}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.postContainer}>
                            <Text>{item.conteudo}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.info}>Nenhuma publicação encontrada.</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8'
    },
    container: {
        flex: 1,
        padding: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginBottom: 16
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#27428f'
    },
    info: {
        fontSize: 18,
        marginBottom: 10,
        paddingLeft: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },
    postContainer: {
        backgroundColor: '#e6e6e6',
        borderRadius: 8,
        padding: 10,
        marginVertical: 6
    }
});
