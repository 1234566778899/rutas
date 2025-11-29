import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { signOut } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native'
import { auth } from '../firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
    const navigation = useNavigation()
    const [data, setData] = useState({});
    const [user, setUser] = useState(null);
    const [isInvited, setIsInvited] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    onPress: async () => {
                        try {
                            await signOut(auth)
                            await AsyncStorage.clear();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'main' }],
                            })
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error)
                            Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        )
    }

    const getData = async () => {
        const name = await AsyncStorage.getItem('name');
        const email = await AsyncStorage.getItem('email');
        setData({ name, email });
    }

    const getUserType = async () => {
        const userType = await AsyncStorage.getItem('userType');
        setIsInvited(userType === 'invited');
    }

    const getSurvey = () => {
        if (isInvited) {
            Alert.alert(
                'Sesión requerida',
                'Debes iniciar sesión para responder la encuesta',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Iniciar sesión',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'login' }],
                            })
                        }
                    }
                ]
            )
            return;
        }
        navigation.navigate('survay')
    }

    const handleViewReports = () => {
        if (isInvited) {
            Alert.alert(
                'Sesión requerida',
                'Debes iniciar sesión para ver tus denuncias',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Iniciar sesión',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'login' }],
                            })
                        }
                    }
                ]
            )
            return;
        }
        navigation.navigate('lista')
    }

    const handleChangePassword = () => {
        if (isInvited) {
            Alert.alert(
                'Sesión requerida',
                'Debes iniciar sesión para cambiar tu contraseña',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Iniciar sesión',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'login' }],
                            })
                        }
                    }
                ]
            )
            return;
        }
        navigation.navigate('changePassword')
    }

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    }

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
        }
        getUserType();
        getData();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.headerCard}>
                    <View style={[styles.avatar, isInvited && styles.avatarGuest]}>
                        {isInvited ? (
                            <FAIcon name="user-secret" size={40} color="white" />
                        ) : (
                            <Text style={styles.avatarText}>
                                {getInitials((user && user.displayName) || data.name)}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.userName}>
                        {isInvited ? 'Usuario Invitado' : (user && user.displayName) || data.name || 'Usuario'}
                    </Text>
                    {!isInvited && (
                        <View style={styles.verifiedBadge}>
                            <Icon name="verified" size={18} color="#4CAF50" />
                            <Text style={styles.verifiedText}>Cuenta verificada</Text>
                        </View>
                    )}
                </View>

                {!isInvited ? (
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Información Personal</Text>

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Icon name="person" size={24} color="#05274B" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Nombre completo</Text>
                                <Text style={styles.infoValue}>
                                    {(user && user.displayName) || data.name || 'No disponible'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <View style={styles.infoIconContainer}>
                                <Icon name="email" size={24} color="#05274B" />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Correo electrónico</Text>
                                <Text style={styles.infoValue}>
                                    {(user && user.email) || data.email || 'No disponible'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.guestCard}>
                        <Icon name="info" size={24} color="#FF9800" />
                        <View style={styles.guestTextContainer}>
                            <Text style={styles.guestTitle}>Modo Invitado</Text>
                            <Text style={styles.guestText}>
                                Has ingresado como invitado. Algunas funciones están limitadas.
                            </Text>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'login' }] })}
                            >
                                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                                <Icon name="arrow-forward" size={18} color="#05274B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={styles.menuCard}>
                    <Text style={styles.sectionTitle}>Opciones</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={handleViewReports}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIconContainer, { backgroundColor: '#E3F2FD' }]}>
                                <FAIcon name="list-alt" size={20} color="#2196F3" />
                            </View>
                            <View>
                                <Text style={styles.menuItemTitle}>Mis Denuncias</Text>
                                <Text style={styles.menuItemSubtitle}>Ver todas tus denuncias</Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color="#CCCCCC" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem} onPress={getSurvey}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIconContainer, { backgroundColor: '#F3E5F5' }]}>
                                <FAIcon name="clipboard-list" size={20} color="#9C27B0" />
                            </View>
                            <View>
                                <Text style={styles.menuItemTitle}>Realizar Encuesta</Text>
                                <Text style={styles.menuItemSubtitle}>Ayúdanos a mejorar</Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color="#CCCCCC" />
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIconContainer, { backgroundColor: '#FFF3E0' }]}>
                                <Icon name="lock-reset" size={20} color="#FF9800" />
                            </View>
                            <View>
                                <Text style={styles.menuItemTitle}>Cambiar Contraseña</Text>
                                <Text style={styles.menuItemSubtitle}>Actualiza tu contraseña</Text>
                            </View>
                        </View>
                        <Icon name="chevron-right" size={24} color="#CCCCCC" />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
                    <Icon name="logout" size={24} color="#F44336" />
                    <Text style={styles.logoutText}>
                        {isInvited ? 'Salir del modo invitado' : 'Cerrar sesión'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    headerCard: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingTop: 30,
        paddingBottom: 25,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#05274B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#05274B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarGuest: { backgroundColor: '#757575' },
    avatarText: { fontSize: 36, fontWeight: 'bold', color: 'white' },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#1E232C', marginBottom: 8 },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    verifiedText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
    infoCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#05274B', marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    infoIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 13, color: '#666', marginBottom: 4 },
    infoValue: { fontSize: 16, color: '#1E232C', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#F0F0F0' },
    guestCard: {
        backgroundColor: '#FFF3E0',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        gap: 16,
    },
    guestTextContainer: { flex: 1 },
    guestTitle: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
    guestText: { fontSize: 14, color: '#F57C00', lineHeight: 20, marginBottom: 12 },
    loginButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6 },
    loginButtonText: { fontSize: 15, fontWeight: 'bold', color: '#05274B' },
    menuCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    menuItemTitle: { fontSize: 16, fontWeight: '600', color: '#1E232C', marginBottom: 4 },
    menuItemSubtitle: { fontSize: 13, color: '#666' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
    },
    logoutText: { fontSize: 16, fontWeight: 'bold', color: '#F44336' },
});

export default ProfileScreen;