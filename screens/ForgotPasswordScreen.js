import { useEffect, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TextInput,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Header } from '../components/Header';
import { ScreenContainer } from '../components/ScreenContainer';
import { PrimaryButton, SecondaryButton } from '../components/Button';
import { EmailInput } from '../components/CustomInput';

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
        <ScreenContainer>
            <Header title="Esqueci a senha" />

            <View style={styles.container}>
                <Text style={styles.title}>Redefinir Senha</Text>
                <EmailInput value={email} setValue={setEmail} />
                
                {errorMessage &&
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                }
                
                <PrimaryButton text="Redefinir Senha" action={resetPassword} />
                <SecondaryButton text="Voltar" action={() => navigation.goBack()} />
            </View>
        </ScreenContainer>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 25,
        marginVertical: 15
    },
    title: {
        fontSize: 30,
        textAlign: 'center',
        marginVertical: 30
    },
    errorMessage: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red'
    }
})