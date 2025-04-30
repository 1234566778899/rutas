// ReportScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import {
    collection,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { firestore, auth } from '../firebase';
export default function ReportScreen({ navigation }) {
    const [name, setName] = useState('');
    const [dni, setDni] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [isSending, setIsSending] = useState(false);
    const handleSubmit = async () => {
        if (isSending) return;
        setIsSending(true);
        if (name.trim() === '') {
            Alert.alert('Error', 'Por favor, ingresa tu nombre.');
            return;
        }
        if (dni.trim() === '') {
            Alert.alert('Error', 'Por favor, ingresa tu DNI.');
            return;
        }
        if (address.trim() === '') {
            Alert.alert('Error', 'Por favor, ingresa tu dirección.');
            return;
        }
        if (description.trim() === '') {
            Alert.alert('Error', 'Por favor, describe tu denuncia.');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Error', 'Debes estar logueado para enviar una denuncia.');
                navigation.navigate('login');
                return;
            }
            const userId = user.uid;
            await addDoc(collection(firestore, 'reports'), {
                name,
                dni,
                address,
                description,
                userId,
                timestamp: serverTimestamp(),
            });
            Alert.alert('Éxito', 'Denuncia enviada correctamente.');
            setName('');
            setDni('');
            setAddress('');
            setDescription('');
            setIsSending(false);
        } catch (error) {
            setIsSending(false);
            console.error(error);
            Alert.alert('Error', 'No se pudo enviar la denuncia. Inténtalo de nuevo.');
        }
    };



    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={[styles.formTitle, { color: 'black' }]}>Registrar Denuncia</Text>

                <TextInput
                    style={{ paddingVertical: 20, paddingHorizontal: 15, borderColor: '#EEF1F7', borderWidth: 1, marginTop: 20, fontSize: 15, backgroundColor: '#F7F8F9' }}
                    placeholder="Nombre"
                    value={name}
                    onChangeText={setName}
                />

                <TextInput
                    style={{ paddingVertical: 20, paddingHorizontal: 15, borderColor: '#EEF1F7', borderWidth: 1, marginTop: 10, fontSize: 15, backgroundColor: '#F7F8F9' }}
                    placeholder="DNI"
                    value={dni}
                    onChangeText={setDni}
                    keyboardType="numeric"
                />

                <TextInput
                    style={{ paddingVertical: 20, paddingHorizontal: 15, borderColor: '#EEF1F7', borderWidth: 1, marginTop: 10, fontSize: 15, backgroundColor: '#F7F8F9' }}
                    placeholder="Dirección"
                    value={address}
                    onChangeText={setAddress}
                />

                <TextInput
                    style={{ paddingVertical: 20, paddingHorizontal: 15, borderColor: '#EEF1F7', borderWidth: 1, marginTop: 20, fontSize: 15, backgroundColor: '#F7F8F9', height: 100 }}
                    placeholder="Descripción de la denuncia"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={{ backgroundColor: '#1E232C', paddingVertical: 20, marginTop: 10, borderRadius: 5 }}
                    onPress={handleSubmit}>
                    <Text
                        style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}
                    >{isSending ? 'Enviando..' : 'Enviar Denuncia'}</Text>
                </TouchableOpacity>
            </View>

            {/* Separador */}
            <View style={styles.separator} />

            {/* Lista de Denuncias */}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    formContainer: {
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#5568FE',
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: Platform.OS === 'ios' ? 15 : 10, // Uso de Platform
        fontSize: 16,
        marginBottom: 10,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top', // Para Android
    },
    button: {
        backgroundColor: '#5568FE',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#EEEEEE',
        marginVertical: 20,
    },
    listContainer: {
        flex: 1,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#5568FE',
        textAlign: 'center',
    },
    reportItem: {
        backgroundColor: '#F9F9F9',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#5568FE',
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    reportDetail: {
        fontSize: 14,
        color: '#555555',
    },
    reportDescription: {
        fontSize: 16,
        marginTop: 10,
        color: '#333333',
    },
    reportTimestamp: {
        fontSize: 12,
        color: '#999999',
        marginTop: 10,
        textAlign: 'right',
    },
    noReportsText: {
        fontSize: 16,
        color: '#777777',
        textAlign: 'center',
        marginTop: 20,
    },
});
