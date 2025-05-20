import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    ScrollView
} from 'react-native';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import Icon from 'react-native-vector-icons/FontAwesome5';
const SurvayScreen = ({ navigation }) => {

    const [comentario, setComentario] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async () => {
        if (isLoading) return;
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Debes estar logueado.');
                return;
            }
            if (Object.keys(selected).length < 8) {
                Alert.alert('Error', 'Debes responder todas las preguntas.');
                return;
            }
            setIsLoading(true);
            await addDoc(collection(firestore, 'surveys'), {
                userId: user.uid,
                results: selected,
                comentario,
                timestamp: serverTimestamp(),
            });

            Alert.alert('Encuesta enviada con éxito');
            navigation.navigate('profile');
        } catch (error) {
            setIsLoading(false);
            console.error('Error al guardar encuesta:', error);
            Alert.alert('Error al enviar encuesta');
        }
    };

    const [selected, setSelected] = useState({});
    const faces = [
        { name: 'angry', value: 1 },
        { name: 'frown', value: 2 },
        { name: 'meh', value: 3 },
        { name: 'smile', value: 4 },
        { name: 'laugh-beam', value: 5 },
    ];
    const questions = [
        '¿Qué tan satisfecho estás con la precisión de las zonas de riesgo que predice la aplicación?',
        '¿Qué tan útil te pareció la aplicación para evitar zonas peligrosas?',
        '¿Qué tan fácil fue usar la aplicación desde el primer intento?',
        '¿Qué tan satisfecho estás con el diseño y la apariencia de la app?',
        '¿Qué tan confiable te pareció la información que muestra la aplicación?',
        '¿Qué tan probable es que recomiendes esta aplicación a otras personas?',
        '¿Qué tan satisfecho estás con la velocidad de respuesta de la app?',
        '¿En general, qué tan satisfecho estás con la aplicación?'
    ]
    return (
        <ScrollView style={{ backgroundColor: 'white', paddingHorizontal: 20, flex: 1, borderRadius: 5 }}>
            <Text style={styles.title}>Califica tu experiencia</Text>
            {
                questions.map((question, idx) => (
                    <View key={idx} style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{idx + 1}. {question}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, gap: 10 }}>
                            {faces.map((face, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelected(prev => ({ ...prev, [idx]: index }))}
                                    style={{ backgroundColor: '#F7F8F9', padding: 10, borderRadius: 5, color: 'tomato' }}
                                >
                                    <Icon
                                        name={face.name}
                                        size={40}
                                        color={selected[idx] && selected[idx] === index ? 'tomato' : 'gray'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))
            }
            <Text style={{ fontSize: 15, marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>¿Deseas agregar un comentario?</Text>
            <TextInput
                style={styles.input}
                multiline
                placeholder="Opcional.."
                value={comentario}
                onChangeText={setComentario}
            />
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                <Text style={styles.buttonText}>{isLoading ? 'Enviando..' : 'Enviar'}</Text>
            </TouchableOpacity>
        </ScrollView >

    );
};

export default SurvayScreen;

const styles = StyleSheet.create({

    title: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#1E232C',
        marginTop: 20
    },
    subtitle: {
        fontSize: 16,
        marginTop: 24,
        marginBottom: 8,
        color: '#1E232C',
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    star: {
        marginHorizontal: 5,
    },
    input: {
        textAlignVertical: 'top',
        borderRadius: 5,
        height: 100,
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        fontSize: 15,
        backgroundColor: '#F7F8F9',
    },
    button: {
        backgroundColor: '#1E232C',
        borderRadius: 5,
        paddingVertical: 15,
        marginTop: 40,
        marginBottom: 10
    },

    buttonText: {
        alignSelf: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

});
