import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { PermissionsAndroid, Alert, Linking, Share, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
export default function EmergyScreen() {
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
    async function sendLocation({ phone = null, whatsapp = true }) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Ubicación denegada');
            return;
        }

        const { coords } = await Location.getCurrentPositionAsync({});
        const mapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
        const message = `¡Emergencia! Este es mi punto: ${mapsUrl}`;

        if (whatsapp) {
            const wa = phone
                ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
                : `whatsapp://send?text=${encodeURIComponent(message)}`; // ← sin número

            if (await Linking.canOpenURL(wa)) {
                return Linking.openURL(wa);
            }
        }

        // SMS / Share de respaldo
        if (await SMS.isAvailableAsync()) {
            return SMS.sendSMSAsync(phone ? [phone] : [], message);
        }
        return Share.share({ message });
    }



    const handleHelp = async () => {
        if (active) return;
        startPulse(pulse1, 0);
        startPulse(pulse2, 600);
        startPulse(pulse3, 1200);
        setActive(true);
        await sendLocation({ phone: '51904435631' });
    };
    const handleCancel = () => {
        setActive(false)
    };
    const PulseCircle = ({ animatedValue, color }) => {
        const scale = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1.8],
        });
        const opacity = animatedValue.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: [0.2, 0.3, 0],
        });
        return (
            <Animated.View
                style={[
                    styles.pulse,
                    {
                        backgroundColor: color,
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.question}>¿Estas en una emergencia?</Text>
            <Text style={styles.subtitle}>
                Presiona el boton para enviar una alerta a los contactos de emergencia
            </Text>
            <View style={styles.pulseContainer}>
                {active && (
                    <>
                        <PulseCircle animatedValue={pulse1} color="#ff3b30" />
                        <PulseCircle animatedValue={pulse2} color="#ff3b30" />
                        <PulseCircle animatedValue={pulse3} color="#ff3b30" />
                    </>
                )}

                <TouchableOpacity
                    style={[styles.helpButton]}
                    onPress={handleHelp}
                >
                    <Text style={styles.helpText}>
                        {active ? 'Notificando' : 'Enviar alerta'}
                    </Text>
                </TouchableOpacity>
            </View>

            {active && (
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={styles.cancelText}>CANCELAR</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e9f2fd',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    question: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0d1b2a',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#0d1b2a',
        marginBottom: 40,
        textAlign: 'center',
    },
    pulseContainer: {
        width: 270,
        height: 270,
        marginTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    pulse: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    helpButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    helpButtonDisabled: {
        backgroundColor: '#aa2b24',
    },
    helpText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cancelBtn: {
        borderWidth: 1,
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        borderColor: '#0d1b2a',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 6,
    },
    cancelText: {
        color: '#0d1b2a',
        fontSize: 16,
        fontWeight: '600',
    },
});
