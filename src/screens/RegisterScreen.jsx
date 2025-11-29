// RegisterScreen.js
import React, { useState } from 'react';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (email === '' || password === '' || confirmPassword === '' || name === '') {
            Alert.alert('Campos Vacíos', 'Por favor, rellena todos los campos.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Contraseñas No Coinciden', 'Las contraseñas deben ser iguales.');
            return;
        }

        setLoading(true);

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            await AsyncStorage.setItem('name', name);
            await AsyncStorage.setItem('email', email);
            navigation.navigate('login');
        } catch (error) {
            const code = {
                'auth/email-already-in-use': 'Correo en uso',
                'auth/weak-password': 'Contraseña débil',
                'auth/invalid-email': 'Correo inválido',
                'auth/invalid-credential': 'Credencial inválida',
                'auth/operation-not-allowed': 'Operación no permitida',
            };
            Alert.alert('Error de Registro', code[error.code] || 'Error de Registro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Surface style={styles.surface} elevation={0}>
                    <View style={styles.header}>
                        <Text variant="displaySmall" style={styles.title}>
                            ¡Hola!
                        </Text>
                        <Text variant="bodyLarge" style={styles.subtitle}>
                            Regístrate para empezar ahora
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            label="Nombres y Apellidos"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            autoCapitalize="words"
                            left={<TextInput.Icon icon="account" />}
                        />

                        <TextInput
                            label="Correo electrónico"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="email" />}
                        />

                        <TextInput
                            label="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="lock" />}
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        <TextInput
                            label="Confirmar Contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            mode="outlined"
                            style={styles.input}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            left={<TextInput.Icon icon="lock-check" />}
                            right={
                                <TextInput.Icon
                                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            }
                        />

                        <Button
                            mode="contained"
                            onPress={handleRegister}
                            style={styles.registerButton}
                            contentStyle={styles.buttonContent}
                            loading={loading}
                            disabled={loading}
                        >
                            Registrarse
                        </Button>

                        <View style={styles.footer}>
                            <Text variant="bodyMedium" style={styles.footerText}>
                                ¿Ya tienes una cuenta?{' '}
                            </Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('login')}
                                compact
                            >
                                Inicia sesión
                            </Button>
                        </View>
                    </View>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    surface: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#666',
    },
    form: {
        gap: 16,
    },
    input: {
        backgroundColor: 'white',
    },
    registerButton: {
        marginTop: 8,
        borderRadius: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    footerText: {
        color: '#666',
    },
});