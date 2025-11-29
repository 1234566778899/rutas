import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HomeScreen({ navigation }) {
    const enterApplication = async (type, route) => {
        await AsyncStorage.setItem('userType', type)
        navigation.navigate(route);
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ flex: 1 }}>
                <View style={{ alignItems: 'center', paddingTop: 150 }}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={{ width: 130, height: 130 }}
                        resizeMode="contain"
                    />
                </View>
                <View style={{ padding: 20, width: '100%', marginTop: 30 }}>
                    <TouchableOpacity
                        onPress={() => enterApplication('user', 'login')}
                        style={{ backgroundColor: 'black', borderRadius: 10, paddingVertical: 20 }}>
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 15, fontWeight: 'bold' }}>Iniciar sesión</Text>
                    </TouchableOpacity >
                    <TouchableOpacity
                        onPress={() => enterApplication('user', 'register')}
                        style={{ borderWidth: 1, borderColor: 'gray', marginTop: 10, borderRadius: 10, paddingVertical: 20 }}>
                        <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: 'bold' }}>Registrarse</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => enterApplication('invited', 'home')}
                        style={{ marginTop: 50 }}>
                        <Text style={{ textAlign: 'center', fontSize: 15, color: '#35C2C1', fontWeight: 'bold', textDecorationLine: 'underline' }}>Continuar como invitado</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView >
    )
}