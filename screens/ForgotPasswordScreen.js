import { useEffect, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen () {

    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const [ email, setEmail ] = useState('');

    const [ errorMessage, setErrorMessage ] = useState('');

    const resetPassword = async () => {
        if (!email) {
            setErrorMessage('Informe o e-mail.');
            return;
        }

        if (!regexEmail.test(email)) {
            setErrorMessage('E-mail inválido');
            return;
        }

        setErrorMessage('');

        await sendPasswordResetEmail(auth, email);

        console.log('e-mail de redenifição enviado!');
    }

    useEffect(() => {
        setErrorMessage('');
    }, [email])

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#27428f" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Esqueci a senha</Text>
            </View>

            <View style={styles.container}>
                <Text style={styles.title}>Redefinir Senha</Text>
                <TextInput
                    placeholder="E-mail"
                    placeholderTextColor="black"
                    style={styles.input}
                    inputMode="email"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    value={email}
                />
                {errorMessage &&
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                }
                <TouchableOpacity
                    onPress={() => {
                        resetPassword();
                    }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText} >Redefinir Senha</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        navigation.goBack();
                    }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText} >Voltar</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
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
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
        marginRight: 30,
        color: '#27428f'
    },
    container: {
        marginHorizontal: 25,
        marginVertical: 15
    },
    title: {
        fontSize: 30,
        textAlign: 'center',
        marginVertical: 30
    },
    input: {
        width: '100%',
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 15,
        padding: 15,
        fontSize: 20,
        color: 'black',
        marginVertical: 15
    },
    button: {
        backgroundColor: '#27428f',
        padding: 15,
        borderRadius: 15,
        marginVertical: 15
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold'
    },
    errorMessage: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red'
    }
})