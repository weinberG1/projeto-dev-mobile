import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

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
        <SafeAreaView>
            <View style={styles.container}>
                <Text style={styles.title}>Esqueci a senha</Text>
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
    container: {
        margin: 25
    },
    title: {
        fontSize: 45,
        textAlign: 'center',
        marginVertical: 40
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