import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    ScrollView,
    Alert,
    Linking,
    Share
} from 'react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';

export default function EmergencyScreen() {
    const [active, setActive] = useState(false);
    const pulse1 = useRef(new Animated.Value(0)).current;
    const pulse2 = useRef(new Animated.Value(0)).current;
    const pulse3 = useRef(new Animated.Value(0)).current;

    const startPulse = (animatedValue, delay = 0) => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1800,
                    delay,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    };

    async function sendLocation() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permiso requerido',
                    'Se necesita acceso a tu ubicación para enviar la alerta de emergencia.'
                );
                return;
            }

            const { coords } = await Location.getCurrentPositionAsync({});
            const mapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
            const message = `🚨 ¡EMERGENCIA! Necesito ayuda urgente. Mi ubicación actual es: ${mapsUrl}`;
            
            const waUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
            
            if (await Linking.canOpenURL(waUrl)) {
                await Linking.openURL(waUrl);
            } else {
                await Share.share({ message });
            }
        } catch (error) {
            console.error('Error al enviar ubicación:', error);
            Alert.alert('Error', 'No se pudo obtener tu ubicación. Inténtalo de nuevo.');
            setActive(false);
        }
    }

    const handleHelp = async () => {
        if (active) return;

        Alert.alert(
            '¿Enviar alerta de emergencia?',
            'Se compartirá tu ubicación actual con tus contactos de emergencia.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar SOS',
                    style: 'destructive',
                    onPress: async () => {
                        startPulse(pulse1, 0);
                        startPulse(pulse2, 600);
                        startPulse(pulse3, 1200);
                        setActive(true);
                        await sendLocation();
                    }
                }
            ]
        );
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancelar alerta',
            '¿Deseas cancelar la alerta de emergencia?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Sí, cancelar', onPress: () => setActive(false) }
            ]
        );
    };

    const PulseCircle = ({ animatedValue, color }) => {
        const scale = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 2],
        });
        const opacity = animatedValue.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0.3, 0.4, 0],
        });
        return (
            <Animated.View
                style={[
                    styles.pulse,
                    { backgroundColor: color, transform: [{ scale }], opacity }
                ]}
            />
        );
    };

    return (
        <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headerCard}>
                <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                    <Icon name="emergency" size={50} color={active ? "#F44336" : "#05274B"} />
                </View>
                <Text style={styles.question}>¿Estás en una emergencia?</Text>
                <Text style={styles.subtitle}>
                    Presiona el botón SOS para enviar tu ubicación actual a tus contactos de emergencia
                </Text>
            </View>

            <View style={styles.pulseContainer}>
                {active && (
                    <>
                        <PulseCircle animatedValue={pulse1} color="#F44336" />
                        <PulseCircle animatedValue={pulse2} color="#F44336" />
                        <PulseCircle animatedValue={pulse3} color="#F44336" />
                    </>
                )}

                <TouchableOpacity
                    style={[styles.sosButton, active && styles.sosButtonActive]}
                    onPress={handleHelp}
                    activeOpacity={0.8}
                    disabled={active}
                >
                    <Text style={styles.sosText}>{active ? '!' : 'SOS'}</Text>
                </TouchableOpacity>

                {active && (
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Alerta activa</Text>
                    </View>
                )}
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoItem}>
                    <View style={styles.infoIconCircle}>
                        <FAIcon name="map-marker-alt" size={18} color="#05274B" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Ubicación automática</Text>
                        <Text style={styles.infoDescription}>Tu ubicación GPS será compartida</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoItem}>
                    <View style={styles.infoIconCircle}>
                        <FAIcon name="whatsapp" size={18} color="#25D366" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Envío por WhatsApp</Text>
                        <Text style={styles.infoDescription}>Se abrirá WhatsApp con el mensaje de emergencia</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoItem}>
                    <View style={styles.infoIconCircle}>
                        <FAIcon name="shield-alt" size={18} color="#4CAF50" />
                    </View>
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>Seguro y rápido</Text>
                        <Text style={styles.infoDescription}>Envío instantáneo a tus contactos</Text>
                    </View>
                </View>
            </View>

            {active && (
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
                    <Icon name="close" size={24} color="#F44336" />
                    <Text style={styles.cancelText}>Cancelar Alerta</Text>
                </TouchableOpacity>
            )}

            <View style={styles.warningCard}>
                <Icon name="info" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                    Usa esta función solo en situaciones de emergencia real
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { flex: 1, backgroundColor: '#F5F7FA' },
    container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
    headerCard: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainerActive: { backgroundColor: '#FFEBEE' },
    question: { fontSize: 24, fontWeight: 'bold', color: '#05274B', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
    pulseContainer: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center', marginBottom: 30, position: 'relative' },
    pulse: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
    sosButton: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#F44336',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F44336',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 5,
        borderColor: 'white',
    },
    sosButtonActive: { backgroundColor: '#D32F2F' },
    sosText: { color: 'white', fontSize: 42, fontWeight: 'bold', letterSpacing: 2 },
    statusBadge: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        gap: 8,
    },
    statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F44336' },
    statusText: { fontSize: 14, fontWeight: '600', color: '#F44336' },
    infoCard: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    infoIconCircle: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoContent: { flex: 1 },
    infoTitle: { fontSize: 15, fontWeight: '600', color: '#1E232C', marginBottom: 4 },
    infoDescription: { fontSize: 13, color: '#666', lineHeight: 18 },
    divider: { height: 1, backgroundColor: '#F0F0F0' },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 30,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 20,
        gap: 10,
        shadowColor: '#F44336',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    cancelText: { color: '#F44336', fontSize: 16, fontWeight: 'bold' },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        gap: 12,
    },
    warningText: { flex: 1, fontSize: 13, color: '#E65100', lineHeight: 18 },
});