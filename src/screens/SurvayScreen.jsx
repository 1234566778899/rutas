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
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';

const SurveyScreen = ({ navigation }) => {

    const [comentario, setComentario] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState({});

    const handleSubmit = async () => {
        if (isLoading) return;
        try {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert('Sesión requerida', 'Debes estar logueado para enviar la encuesta.');
                return;
            }
            if (Object.keys(selected).length < 8) {
                Alert.alert('Encuesta incompleta', 'Por favor, responde todas las preguntas antes de enviar.');
                return;
            }
            setIsLoading(true);
            await addDoc(collection(firestore, 'surveys'), {
                userId: user.uid,
                results: selected,
                comentario,
                timestamp: serverTimestamp(),
            });

            Alert.alert(
                '¡Gracias por tu opinión!',
                'Tu encuesta ha sido enviada exitosamente. Tus comentarios nos ayudan a mejorar.',
                [
                    {
                        text: 'Volver al perfil',
                        onPress: () => navigation.navigate('profile')
                    }
                ]
            );
        } catch (error) {
            setIsLoading(false);
            console.error('Error al guardar encuesta:', error);
            Alert.alert('Error', 'No se pudo enviar la encuesta. Inténtalo de nuevo.');
        }
    };

    const questions = [
        {
            id: 0,
            text: '¿Qué tan satisfecho estás con la precisión de las zonas de riesgo que predice la aplicación?',
            icon: 'map-marker-radius'
        },
        {
            id: 1,
            text: '¿Qué tan útil te pareció la aplicación para evitar zonas peligrosas?',
            icon: 'shield-check'
        },
        {
            id: 2,
            text: '¿Qué tan fácil fue usar la aplicación desde el primer intento?',
            icon: 'hand-peace'
        },
        {
            id: 3,
            text: '¿Qué tan satisfecho estás con el diseño y la apariencia de la app?',
            icon: 'palette'
        },
        {
            id: 4,
            text: '¿Qué tan confiable te pareció la información que muestra la aplicación?',
            icon: 'check-circle'
        },
        {
            id: 5,
            text: '¿Qué tan probable es que recomiendes esta aplicación a otras personas?',
            icon: 'users'
        },
        {
            id: 6,
            text: '¿Qué tan satisfecho estás con la velocidad de respuesta de la app?',
            icon: 'tachometer-alt'
        },
        {
            id: 7,
            text: '¿En general, qué tan satisfecho estás con la aplicación?',
            icon: 'smile-beam'
        }
    ];

    const getRatingText = (rating) => {
        const texts = {
            1: 'Muy insatisfecho',
            2: 'Insatisfecho',
            3: 'Neutral',
            4: 'Satisfecho',
            5: 'Muy satisfecho'
        };
        return texts[rating] || '';
    };

    const getCompletionPercentage = () => {
        return Math.round((Object.keys(selected).length / questions.length) * 100);
    };

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headerCard}>
                <View style={styles.iconContainer}>
                    <FAIcon name="clipboard-list" size={32} color="#05274B" />
                </View>
                <Text style={styles.title}>Califica tu experiencia</Text>
                <Text style={styles.subtitle}>
                    Tu opinión nos ayuda a mejorar la aplicación
                </Text>
            </View>

            <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Progreso de la encuesta</Text>
                    <Text style={styles.progressPercent}>{getCompletionPercentage()}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                    <View 
                        style={[
                            styles.progressBarFill, 
                            { width: `${getCompletionPercentage()}%` }
                        ]} 
                    />
                </View>
                <Text style={styles.progressText}>
                    {Object.keys(selected).length} de {questions.length} preguntas respondidas
                </Text>
            </View>

            {questions.map((question) => (
                <View key={question.id} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                        <View style={styles.questionIconCircle}>
                            <FAIcon name={question.icon} size={18} color="#05274B" />
                        </View>
                        <View style={styles.questionNumber}>
                            <Text style={styles.questionNumberText}>{question.id + 1}</Text>
                        </View>
                    </View>
                    <Text style={styles.questionText}>{question.text}</Text>
                    
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setSelected(prev => ({ ...prev, [question.id]: star }))}
                                style={styles.starButton}
                            >
                                <IconButton
                                    icon={selected[question.id] >= star ? 'star' : 'star-outline'}
                                    iconColor={selected[question.id] >= star ? '#FFD700' : '#CCCCCC'}
                                    size={32}
                                    style={styles.starIcon}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {selected[question.id] && (
                        <View style={styles.ratingTextContainer}>
                            <Icon name="check-circle" size={16} color="#4CAF50" />
                            <Text style={styles.ratingText}>
                                {getRatingText(selected[question.id])}
                            </Text>
                        </View>
                    )}
                </View>
            ))}

            <View style={styles.commentCard}>
                <View style={styles.commentHeader}>
                    <Icon name="comment" size={24} color="#05274B" />
                    <Text style={styles.commentTitle}>Comentarios adicionales</Text>
                </View>
                <Text style={styles.commentSubtitle}>
                    ¿Tienes alguna sugerencia o comentario? (Opcional)
                </Text>
                <TextInput
                    style={styles.input}
                    multiline
                    placeholder="Escribe aquí tus comentarios o sugerencias..."
                    placeholderTextColor="#999"
                    value={comentario}
                    onChangeText={setComentario}
                    numberOfLines={5}
                    textAlignVertical="top"
                />
                <Text style={styles.charCount}>{comentario.length} caracteres</Text>
            </View>

            <TouchableOpacity 
                onPress={handleSubmit} 
                style={[
                    styles.submitButton,
                    (isLoading || Object.keys(selected).length < 8) && styles.submitButtonDisabled
                ]}
                disabled={isLoading || Object.keys(selected).length < 8}
                activeOpacity={0.8}
            >
                <View style={styles.buttonContent}>
                    {isLoading ? (
                        <>
                            <Icon name="hourglass-empty" size={24} color="white" />
                            <Text style={styles.buttonText}>Enviando...</Text>
                        </>
                    ) : (
                        <>
                            <Icon name="send" size={24} color="white" />
                            <Text style={styles.buttonText}>Enviar Encuesta</Text>
                        </>
                    )}
                </View>
            </TouchableOpacity>

            {Object.keys(selected).length < 8 && (
                <View style={styles.warningBox}>
                    <Icon name="info" size={20} color="#FF9800" />
                    <Text style={styles.warningText}>
                        Debes responder todas las preguntas para enviar la encuesta
                    </Text>
                </View>
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

export default SurveyScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA', paddingHorizontal: 20 },
    headerCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: { fontSize: 26, fontWeight: 'bold', color: '#05274B', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
    progressCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    progressLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
    progressPercent: { fontSize: 16, fontWeight: 'bold', color: '#05274B' },
    progressBarBackground: { height: 8, backgroundColor: '#E8EAED', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressBarFill: { height: '100%', backgroundColor: '#05274B', borderRadius: 4 },
    progressText: { fontSize: 12, color: '#666' },
    questionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    questionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    questionIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#05274B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionNumberText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    questionText: { fontSize: 15, fontWeight: '600', color: '#333', lineHeight: 22, marginBottom: 16 },
    starsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    starButton: { marginHorizontal: -4 },
    starIcon: { margin: 0 },
    ratingTextContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 6 },
    ratingText: { fontSize: 13, color: '#4CAF50', fontWeight: '600' },
    commentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    commentTitle: { fontSize: 18, fontWeight: 'bold', color: '#05274B' },
    commentSubtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
    input: {
        backgroundColor: '#F7F8F9',
        borderWidth: 1,
        borderColor: '#E8EAED',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#333',
        minHeight: 100,
    },
    charCount: { fontSize: 12, color: '#999', textAlign: 'right', marginTop: 4 },
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
    submitButtonDisabled: { backgroundColor: '#8DA0BC', opacity: 0.6 },
    buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 12, gap: 10 },
    warningText: { flex: 1, fontSize: 13, color: '#E65100', lineHeight: 18 },
});