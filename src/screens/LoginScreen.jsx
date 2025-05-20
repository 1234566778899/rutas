// LoginScreen.js
import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google'

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cagando, setCagando] = useState(false);
    const [_, response, prompAsync] = Google.useAuthRequest({
        androidClientId: '589338091760-8cpok1tj162m8m02i4ai3eb7udr1m0aq.apps.googleusercontent.com',
    });
    const handleLogin = () => {
        if (email === '' || password === '') {
            Alert.alert('Campos Vacíos', 'Por favor, rellena todos los campos.');
            return;
        }
        setCagando(true);
        signInWithEmailAndPassword(auth, email, password)
            .then(async () => {
                await AsyncStorage.setItem('email', email);
                navigation.navigate('home');
                setCagando(false);
            })
            .catch((error) => {
                setCagando(false);

                const codes = {
                    'auth/invalid-email': 'El correo electrónico no es válido.',
                    'auth/invalid-credential': 'Las credenciales no son válidas.',
                }
                Alert.alert('Error de Inicio de Sesión', codes[error.code] || 'Ha ocurrido un error.');
            });
    };
    useEffect(() => {
        if (response) {
            if (response.type === 'success') {
                navigation.navigate('home');
            }
        }
    })
    return (
        <KeyboardAvoidingView
            style={{ backgroundColor: 'white', flex: 1, padding: 20 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 30 }}>Bienvenido! Inicia sesión ahora!</Text>
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
                style={{ borderWidth: 0.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, marginTop: 20, borderRadius: 5 }}
                onPress={() => prompAsync().catch(e => console.log(e))}>
                <FontAwesome name="google" size={24} color="black" />
                <Text style={{ textAlign: 'center', marginLeft: 10 }}>Iniciar sesión con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('register')}
                style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 50, }}>
                <Text style={{ fontWeight: 'bold' }}> ¿No tienes una cuenta?  <Text style={{ color: '#35C2C1', textDecorationLine: 'underline' }}>Registrate</Text></Text>
            </TouchableOpacity>

        </KeyboardAvoidingView>
    );
}

