import { useEffect, useState } from 'react';
import {
    SafeAreaView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { EmailInput, PasswordInput } from '../components/CustomInputs';

export default function LoginScreen () {

    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

    const [ errorMessage, setErrorMessage ] = useState('');

    const login = async () => {
        if (!email || !password) {
            setErrorMessage('Informe o e-mail e senha.');
            return;
        }

        if (!regexEmail.test(email)) {
            setErrorMessage('E-mail inválido');
            return;
        }

        if (!regexPassword.test(password)) {
            setErrorMessage('A senha deve conter no mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo');
            return;
        }

        setErrorMessage('');

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
            const user = userCredentials.user;
            console.log(user);
        })
        .catch((error) => {
            setErrorMessage(error.message);
        })
    }

    useEffect(() => {
        setErrorMessage('');
    }, [email, password])

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <Text style={styles.title}>Entrar</Text>
                <EmailInput value={email} setValue={setEmail} />

                <PasswordInput value={password} setValue={setPassword} />
                
                <TouchableOpacity
                    onPress={() => {
                        navigation.push('ForgotPassword');
                    }}
                >
                    <Text>Esqueci a senha</Text>
                </TouchableOpacity>
                {errorMessage &&
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                }
                <PrimaryButton text={'Login'} action={() => {
                    login();
                }} />

                <Text>Ainda não tem uma conta?</Text>

                <SecondaryButton text={'Registrar-se'} action={() => {
                    navigation.push('Register');
                }} />
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
    errorMessage: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red'
    }
})