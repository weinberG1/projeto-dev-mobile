// import { useEffect, useState } from 'react';
// import {
//     SafeAreaView,
//     Text,
//     View,
//     StyleSheet,
//     ActivityIndicator
// } from "react-native";
// import {launchImageLibrary} from 'react-native-image-picker';
// import {v4 as uuidv4} from 'uuid';

// import { auth, db, doc, getDoc } from '../firebase';
// import { DangerButton, SecondaryButton } from '../components/Button.js';
// import { snapshotEqual } from 'firebase/firestore';

// export default function ProfileScreen() {
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     //Was added this variable to add images inside the ProfileScreen.js screen

//     //This variable include these lines, which define the characteristics of the image, like the height and width of it and includeBase64, that transforms the image into binary data.
//     const pickImge = async () => {
//         let options = {
//             mediaType: 'photo',
//             includeBase64: false,
//             maxHeight: 2000,
//             maxWidth: 2000,
//         };

//     //After this, was used this method, which picks and image of device, where:

//     //didCancel verifies whether user cancelled the file upload

//     //error verifies the error that appeared when tried to pick an image

//     //imageUri it is the path of the image

//         launchImageLibrary(options, (response) =>{
//             if (response.didCancel){
//                 console.log('User cancelled the image picker');
//             }
//             else if (response.error){
//                 console.log('ImagePicker Error: ', response.error)
//             } else{
//                 let imageUri = response.assets[0].uri;
//                 console.log(imageUri)
//             }
//         })
//     }
//     // This function is responsible to upload the image into firestore database

//     //In this function, we upload an image to firestore database, in which:

//     //We have imageRef, that is ?

//     //Furthermore, we have the task, that we try to put the file from user's gallery into firestore database.

//     //Passing this line of code, we have the progress tracker, where we detect the state-changed, via snapshot (might be the image itself)

    

//     const uploadImage = async(imageUri) => {
//         const imageRef = storage().ref(`users/${uniqueFileName}.jpg`)
//         const task = imageRef.putFile(imageUri)

//         task.on('state-changed', snapshot => {
//             const progress = (snapshot.byteTransferred / snapshot.totalBytes) * 100;
//             console.log(`Upload is ${progress}% done`)
//         })

//         task.then(async () =>{
//             const downloadURL = await imageRef.getDownloadURL();
//         })
//     }

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 const user = auth.currentUser;
//                 if (!user) return;

//                 const userDocRef = doc(db, 'users', user.uid);
//                 const userDoc = await getDoc(userDocRef);

//                 if (userDoc.exists()) {
//                     setUserData({
//                         id: user.uid,
//                         email: user.email,
//                         ...userDoc.data()
//                     });
//                 } else {
//                     setUserData({
//                         id: user.uid,
//                         email: user.email
//                     });
//                 }
//             } catch (error) {
//                 console.error('Erro ao buscar dados do usuário:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUserData();
//     }, []);

//     if (loading) {
//         return (
//             <SafeAreaView style={styles.safeArea}>
//                 <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="large" color="#27428f" />
//                 </View>
//             </SafeAreaView>
//         );
//     }

//     return (
//         <SafeAreaView style={styles.safeArea}>
//             <View style={styles.container}>
//                 <Text style={styles.title}>Minha Conta</Text>
                
//                 <View style={styles.infoContainer}>

//                     <Text style={styles.label}>Foto:</Text>
//                     <Text style={styles.info}>Pressione o botão abaixo para inserir uma imagem: </Text>

//                     <SecondaryButton action={pickImge} text={'Selecionar imagem'}></SecondaryButton>
                    
//                     <Text style={styles.label}>Nome:</Text>
//                     <Text style={styles.info}>{userData?.name || 'Não informado'}</Text>
                    
//                     <Text style={styles.label}>Telefone:</Text>
//                     <Text style={styles.info}>{userData?.phone || 'Não informado'}</Text>
//                 </View>
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#f8f8f8'
//     },
//     container: {
//         flex: 1,
//         padding: 20
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     title: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         marginVertical: 20
//     },
//     infoContainer: {
//         backgroundColor: '#f5f5f5',
//         borderRadius: 10,
//         padding: 20,
//         marginVertical: 10
//     },
//     label: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         marginTop: 10,
//         color: '#27428f'
//     },
//     info: {
//         fontSize: 18,
//         marginBottom: 10,
//         paddingLeft: 5
//     }
// }); 

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
                setImageUri(data.foto || '');
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
                foto: imageUri
            });
            Alert.alert('Sucesso', 'Perfil atualizado!');
            setEditMode(false);
            setUserData(prev => ({
                ...prev,
                name,
                phone,
                foto: imageUri
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
                        <Text>Sem Foto</Text>
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
