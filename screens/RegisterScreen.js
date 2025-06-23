import { useEffect, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { PrimaryButton, SecondaryButton } from '../components/Button.js';
import { EmailInput, PasswordInput, CustomTextInput } from '../components/CustomInput.js';
import { addDoc, collection } from 'firebase/firestore';
import { ScreenContainer } from '../components/ScreenContainer';

export default function RegisterScreen () {

    const navigation = useNavigation();

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ name, setName ] = useState('');
    const [ phone, setPhone ] = useState('');

    const [ errorMessage, setErrorMessage ] = useState('');

    const register = async () => {
        if (!email || !password || !name || !phone) {
            setErrorMessage('Preencha todos os campos.');
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

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Usuário: ', user);
            
            await addDoc(collection(db, 'users'), {
                email: email,
                name: name,
                phone: phone 
            });
        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    useEffect(() => {
        setErrorMessage('');
    }, [email, password, name, phone])

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <Text style={styles.title}>Registrar-se</Text>
                <CustomTextInput placeholder="Nome" value={name} setValue={setName} />
                <CustomTextInput placeholder="Telefone" value={phone} setValue={setPhone} />
                <EmailInput value={email} setValue={setEmail} />
                <PasswordInput value={password} setValue={setPassword} />
                {errorMessage &&
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                }
                <PrimaryButton text={"Registrar-se"} action={() => {
                    register();
                }} />

                <Text>Já tem uma conta?</Text>
                
                <SecondaryButton text={'Voltar para Login'} action={() => {
                    navigation.goBack();
                }} />
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