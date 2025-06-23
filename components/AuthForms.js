import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { EmailInput, PasswordInput, CustomTextInput } from './CustomInput';
import { PrimaryButton, SecondaryButton } from './Button';

export function LoginForm({ onLogin }) {
    const navigation = useNavigation();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    useEffect(() => {
        setErrorMessage('');
    }, [email, password]);

    const handleLogin = () => {
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
        
        onLogin(email, password, setErrorMessage);
    };

    return (
        <View style={styles.formContainer}>
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
            
            {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
            
            <PrimaryButton text={'Login'} action={handleLogin} />

            <Text>Ainda não tem uma conta?</Text>

            <SecondaryButton text={'Registrar-se'} action={() => {
                navigation.push('Register');
            }} />
        </View>
    );
}

export function RegisterForm({ onRegister }) {
    const navigation = useNavigation();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setErrorMessage('');
    }, [email, password, name, phone]);

    const handleRegister = () => {
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
        
        onRegister(email, password, name, phone, setErrorMessage);
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.title}>Registrar-se</Text>
            <CustomTextInput placeholder="Nome" value={name} setValue={setName} />
            <CustomTextInput placeholder="Telefone" value={phone} setValue={setPhone} />
            <EmailInput value={email} setValue={setEmail} />
            <PasswordInput value={password} setValue={setPassword} />
            
            {errorMessage && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}
            
            <PrimaryButton text={"Registrar-se"} action={handleRegister} />

            <Text>Já tem uma conta?</Text>
            
            <SecondaryButton text={'Voltar para Login'} action={() => {
                navigation.goBack();
            }} />
        </View>
    );
}

const styles = StyleSheet.create({
    formContainer: {
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
});
