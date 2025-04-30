// LoginScreen.js
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cagando, setCagando] = useState(false);
    const handleLogin = () => {
        if (email === '' || password === '') {
            Alert.alert('Campos Vacíos', 'Por favor, rellena todos los campos.');
            return;
        }
        setCagando(true);
        signInWithEmailAndPassword(auth, email, password)
            .then(async () => {
                navigation.navigate('home');
                setCagando(false);
            })
            .catch((error) => {
                setCagando(false);
                console.error(error);
                Alert.alert('Error de Inicio de Sesión', error.message);
            });
    };

    return (
        <KeyboardAvoidingView
            style={{ backgroundColor: 'white', flex: 1, padding: 20 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 30 }}>Welcome back! Glad to see you, Again!</Text>
            <TextInput
                style={{ paddingVertical: 20, paddingHorizontal: 15, borderColor: '#EEF1F7', borderWidth: 1, marginTop: 40, fontSize: 15, backgroundColor: '#F7F8F9' }}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                style={{ paddingVertical: 20, paddingHorizontal: 15, borderColor: '#EEF1F7', borderWidth: 1, marginTop: 20, fontSize: 15, backgroundColor: '#F7F8F9' }}
                placeholder="Contraseña"
                secureTextEntry
                autoCapitalize="none"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity
                style={{ backgroundColor: '#1E232C', paddingVertical: 20, marginTop: 30, borderRadius: 5 }}
                onPress={handleLogin}>
                <Text style={{ color: 'white', textAlign: 'center' }}>{cagando ? 'Cargando..' : 'Iniciar sesión'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('register')}
                style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 50, }}>
                <Text style={{ fontWeight: 'bold' }}> ¿No tienes una cuenta?  <Text style={{ color: '#35C2C1', textDecorationLine: 'underline' }}>Registrate</Text></Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>
    );
}

