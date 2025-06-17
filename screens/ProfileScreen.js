import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import {launchImageLibrary} from 'react-native-image-picker';
import {v4 as uuidv4} from 'uuid';

import { auth, db, doc, getDoc } from '../firebase';
import { DangerButton, SecondaryButton } from '../components/Button.js';

export default function ProfileScreen() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    //Was added this variable to add images inside the ProfileScreen.js screen

    //This variable include these lines, which define the characteristics of the image, like the height and width of it and includeBase64, that transforms the image into binary data.
    const pickImge = async () => {
        let options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

    //After this, was used this method, which picks and image of device, where:

    //didCancel verifies whether user cancelled the file upload

    //error verifies the error that appeared when tried to pick an image

    //imageUri it is the path of the image

        launchImageLibrary(options, (response) =>{
            if (response.didCancel){
                console.log('User cancelled the image picker');
            }
            else if (response.error){
                console.log('ImagePicker Error: ', response.error)
            } else{
                let imageUri = response.assets[0].uri;
                console.log(imageUri)
            }
        })
    }

    const uploadImage = async(imageUri) => {
        const filename = `${uuidv4()}.jpg`;
        const storageRef = storage().ref(`users/$`)

        try{
            await storageRef.putFile
        }
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setUserData({
                        id: user.uid,
                        email: user.email,
                        ...userDoc.data()
                    });
                } else {
                    setUserData({
                        id: user.uid,
                        email: user.email
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

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
                <Text style={styles.title}>Minha Conta</Text>
                
                <View style={styles.infoContainer}>

                    <Text style={styles.label}>Foto:</Text>
                    <Text style={styles.info}>Pressione o botão abaixo para inserir uma imagem: </Text>

                    <SecondaryButton action={pickImge} text={'Selecionar imagem'}></SecondaryButton>
                    
                    <Text style={styles.label}>Nome:</Text>
                    <Text style={styles.info}>{userData?.name || 'Não informado'}</Text>
                    
                    <Text style={styles.label}>Telefone:</Text>
                    <Text style={styles.info}>{userData?.phone || 'Não informado'}</Text>
                </View>
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
    infoContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 20,
        marginVertical: 10
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
    }
}); 