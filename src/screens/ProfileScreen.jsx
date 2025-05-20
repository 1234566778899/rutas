import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { signOut } from 'firebase/auth'
import { useNavigation } from '@react-navigation/native'
import { auth } from '../firebase'
import SurvayScreen from './SurvayScreen'
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
    const navigation = useNavigation()
    const [data, setData] = useState({});
    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar sesión',
                    onPress: async () => {
                        try {
                            await signOut(auth)
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'main' }],
                            })
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error)
                        }
                    },
                    style: 'destructive',
                },
            ]
        )
    }
    const [modalOpen, setModalOpen] = useState(false);
    const closeModal = () => setModalOpen(false);
    const [user, setUser] = useState(null);
    const getData = async () => {
        const name = await AsyncStorage.getItem('name');
        const email = await AsyncStorage.getItem('email');
        setData({ name, email });
    }
    const [isInvited, setIsInvited] = useState(false);
    const getUserType = async () => {
        const userType = await AsyncStorage.getItem('userType');
        setIsInvited(userType === 'invited');
    }
    const getSurvay = () => {
        if (isInvited) {
            Alert.alert(
                'Error',
                'Debe iniciar sesión para responder la encuesta',
            )
            return;
        }
        navigation.navigate('survay')
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
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {
                modalOpen && (
                    <SurvayScreen close={closeModal} />
                )
            }
            {
                !isInvited && (
                    <View>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Nombre</Text>
                            <Text style={{ fontSize: 16, color: 'gray', fontWeight: 'bold' }}>{(user && user.displayName) || data.name || '-'}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 20, paddingVertical: 20, borderBottomColor: 'gray', borderBottomWidth: 0.2 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Correo</Text>
                            <Text style={{ fontSize: 16, color: 'gray', fontWeight: 'bold' }}>{(user && user.email) || data.email || '-'}</Text>
                        </View>
                    </View>
                )
            }
            {
                isInvited && (
                    <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
                        <Text style={{ fontSize: 16 }}>Usted ha ingreso como invitado</Text>
                    </View>
                )
            }
            <View style={{ position: 'absolute', bottom: 10, width: '100%' }}>
                <TouchableOpacity
                    onPress={() => getSurvay()}
                    style={{
                        paddingHorizontal: 20,
                        width: '100%', paddingVertical: 20, borderTopColor: 'gray',
                        borderTopWidth: 0.5, flexDirection: 'row', alignItems: 'center', gap: 10
                    }}>
                    <Ionicons name="clipboard-outline" size={27} color="purple" />
                    <Text style={{ fontSize: 17, color: 'purple', fontWeight: 'bold' }}>Realizar encuesta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                        paddingHorizontal: 20,
                        width: '100%', paddingVertical: 20, borderTopColor: 'gray',
                        borderTopWidth: 0.5, flexDirection: 'row', alignItems: 'center', gap: 10
                    }}>
                    <Ionicons name="log-out-outline" size={27} color="red" />
                    <Text style={{ fontSize: 17, color: 'red', fontWeight: 'bold' }}>Salir</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ProfileScreen