// LoginScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { TextInput, Button, Text, Surface, Divider } from 'react-native-paper';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [_, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '589338091760-8cpok1tj162m8m02i4ai3eb7udr1m0aq.apps.googleusercontent.com',
    });

    const handleForgotPassword = () => {
        if (email === '') {
            Alert.alert(
                'Ingresa tu correo',
                'Por favor, ingresa tu correo electrónico en el campo de arriba y luego presiona "Olvidé mi contraseña".'
            );
            return;
        }

        // Validación básica del formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(
                'Correo inválido',
                'Por favor, ingresa un correo electrónico válido.'
            );
            return;
        }

        Alert.alert(
            'Restablecer contraseña',
            `¿Enviar enlace de recuperación a ${email}?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Enviar',
                    onPress: async () => {
                        try {
                            console.log('Intentando enviar correo a:', email);

                            // Enviar correo de restablecimiento
                            await sendPasswordResetEmail(auth, email, {
                                // Configuración adicional (opcional)
                                url: 'https://proyectos-6c15c.firebaseapp.com', // URL de tu app
                                handleCodeInApp: false,
                            });

                            console.log('Correo enviado exitosamente');

                            Alert.alert(
                                '✅ Correo enviado',
                                `Se ha enviado un enlace de recuperación a ${email}.\n\n` +
                                'Por favor revisa:\n' +
                                '• Tu bandeja de entrada\n' +
                                '• La carpeta de spam/correo no deseado\n' +
                                '• Puede tardar unos minutos en llegar\n\n' +
                                'El enlace expira en 1 hora.',
                                [{ text: 'Entendido' }]
                            );
                        } catch (error) {
                            console.error('Error al enviar correo:', error);
                            console.error('Código de error:', error.code);
                            console.error('Mensaje de error:', error.message);

                            const errorMessages = {
                                'auth/user-not-found': 'No existe una cuenta con este correo electrónico.',
                                'auth/invalid-email': 'El formato del correo electrónico no es válido.',
                                'auth/missing-email': 'Debes proporcionar un correo electrónico.',
                                'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo más tarde.',
                                'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
                            };

                            Alert.alert(
                                'Error al enviar correo',
                                errorMessages[error.code] ||
                                `No se pudo enviar el correo.\n\nError: ${error.message}\n\nCódigo: ${error.code}`,
                                [{ text: 'Entendido' }]
                            );
                        }
                    }
                }
            ]
        );
    };
    const handleLogin = async () => {
        if (email === '' || password === '') {
            Alert.alert('Campos Vacíos', 'Por favor, rellena todos los campos.');
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            await AsyncStorage.setItem('email', email);
            navigation.navigate('home');
        } catch (error) {
            const codes = {
                'auth/invalid-email': 'El correo electrónico no es válido.',
                'auth/invalid-credential': 'Las credenciales no son válidas.',
                'auth/user-not-found': 'Usuario no encontrado.',
                'auth/wrong-password': 'Contraseña incorrecta.',
            };
            Alert.alert('Error de Inicio de Sesión', codes[error.code] || 'Ha ocurrido un error.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (response?.type === 'success') {
            navigation.navigate('home');
        }
    }, [response]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Surface style={styles.surface} elevation={0}>
                    <View style={styles.header}>
                        <Text variant="displaySmall" style={styles.title}>
                            ¡Bienvenido!
                        </Text>
                        <Text variant="bodyLarge" style={styles.subtitle}>
                            Inicia sesión para continuar
                        </Text>
                    </View>

                    <View style={styles.form}>
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

                        <Button
                            mode="text"
                            onPress={handleForgotPassword}
                            style={styles.forgotButton}
                            compact
                        >
                            ¿Olvidaste tu contraseña?
                        </Button>

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            style={styles.loginButton}
                            contentStyle={styles.buttonContent}
                            loading={loading}
                            disabled={loading}
                        >
                            Iniciar sesión
                        </Button>

                        <View style={styles.dividerContainer}>
                            <Divider style={styles.divider} />
                            <Text variant="bodySmall" style={styles.dividerText}>
                                o continúa con
                            </Text>
                            <Divider style={styles.divider} />
                        </View>

                        <Button
                            mode="outlined"
                            onPress={() => promptAsync().catch(e => console.log(e))}
                            style={styles.googleButton}
                            contentStyle={styles.buttonContent}
                            icon="google"
                        >
                            Iniciar sesión con Google
                        </Button>

                        <View style={styles.footer}>
                            <Text variant="bodyMedium" style={styles.footerText}>
                                ¿No tienes una cuenta?{' '}
                            </Text>
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('register')}
                                compact
                            >
                                Regístrate
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
        padding: 20,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 120,
        height: 120,
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
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    loginButton: {
        marginTop: 8,
        borderRadius: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    divider: {
        flex: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#666',
    },
    googleButton: {
        borderRadius: 8,
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