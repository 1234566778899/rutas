// ChangePasswordScreen.js
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { 
    updatePassword, 
    reauthenticateWithCredential, 
    EmailAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ChangePasswordScreen({ navigation }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Contraseña débil', 'La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual.');
            return;
        }

        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                Alert.alert('Error', 'No se pudo obtener el usuario actual.');
                setLoading(false);
                return;
            }

            const credential = EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            Alert.alert(
                'Éxito',
                'Tu contraseña ha sido actualizada correctamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setLoading(false);

        } catch (error) {
            setLoading(false);
            console.error(error);

            const errorMessages = {
                'auth/wrong-password': 'La contraseña actual es incorrecta.',
                'auth/invalid-credential': 'La contraseña actual es incorrecta.',
                'auth/weak-password': 'La nueva contraseña es demasiado débil.',
                'auth/requires-recent-login': 'Por seguridad, debes iniciar sesión nuevamente.',
            };

            Alert.alert(
                'Error',
                errorMessages[error.code] || 'No se pudo cambiar la contraseña. Inténtalo de nuevo.'
            );
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerCard}>
                    <View style={styles.iconContainer}>
                        <Icon name="lock-reset" size={40} color="#05274B" />
                    </View>
                    <Text style={styles.title}>Cambiar Contraseña</Text>
                    <Text style={styles.subtitle}>
                        Ingresa tu contraseña actual y la nueva contraseña
                    </Text>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña Actual</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Ingresa tu contraseña actual"
                                placeholderTextColor="#999"
                                secureTextEntry={!showCurrentPassword}
                                autoCapitalize="none"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                style={styles.eyeButton}
                            >
                                <Icon
                                    name={showCurrentPassword ? "visibility" : "visibility-off"}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nueva Contraseña</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Ingresa tu nueva contraseña"
                                placeholderTextColor="#999"
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                style={styles.eyeButton}
                            >
                                <Icon
                                    name={showNewPassword ? "visibility" : "visibility-off"}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.helperText}>
                            Mínimo 6 caracteres
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirma tu nueva contraseña"
                                placeholderTextColor="#999"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                            >
                                <Icon
                                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Icon name="info" size={20} color="#2196F3" />
                        <Text style={styles.infoText}>
                            Asegúrate de recordar tu nueva contraseña. Se cerrará tu sesión en otros dispositivos.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleChangePassword}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    headerCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#05274B',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8F9',
        borderWidth: 1,
        borderColor: '#E8EAED',
        borderRadius: 12,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#333',
    },
    eyeButton: {
        padding: 10,
        paddingRight: 16,
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        marginLeft: 4,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 18,
    },
    submitButton: {
        backgroundColor: '#05274B',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#05274B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 12,
    },
    submitButtonDisabled: {
        backgroundColor: '#8DA0BC',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        color: '#05274B',
        fontWeight: '600',
    },
});