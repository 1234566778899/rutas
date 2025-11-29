import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';

export default function EmergencyScreen() {
    const emergencyNumbers = [
        { 
            id: '1', 
            name: 'Policía Nacional', 
            number: '105',
            icon: 'shield-alt',
            color: '#2196F3',
        },
        { 
            id: '2', 
            name: 'Bomberos', 
            number: '116',
            icon: 'fire-extinguisher',
            color: '#F44336',
        },
        { 
            id: '3', 
            name: 'Ambulancia/SAMU', 
            number: '106',
            icon: 'ambulance',
            color: '#4CAF50',
        },
        { 
            id: '4', 
            name: 'Serenazgo', 
            number: '1530',
            icon: 'user-shield',
            color: '#FF9800',
        },
        { 
            id: '5', 
            name: 'Central de Emergencias', 
            number: '911',
            icon: 'phone',
            color: '#9C27B0',
        }
    ];

    const handleCall = (name, number) => {
        Alert.alert(
            `Llamar a ${name}`,
            `¿Deseas llamar al ${number}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Llamar',
                    onPress: () => {
                        Linking.openURL(`tel:${number}`).catch(err => {
                            Alert.alert('Error', 'No se pudo realizar la llamada');
                        });
                    }
                }
            ]
        );
    };

    const renderEmergencyCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => handleCall(item.name, item.number)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <FAIcon name={item.icon} size={32} color="white" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.numberRow}>
                        <Icon name="phone" size={20} color={item.color} />
                        <Text style={[styles.number, { color: item.color }]}>{item.number}</Text>
                    </View>
                </View>
                <Icon name="chevron-right" size={28} color="#CCCCCC" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.alertBadge}>
                    <Icon name="emergency" size={32} color="#F44336" />
                </View>
                <Text style={styles.title}>Números de Emergencia</Text>
                <Text style={styles.subtitle}>Toca para llamar inmediatamente</Text>
            </View>

            <FlatList
                data={emergencyNumbers}
                keyExtractor={(item) => item.id}
                renderItem={renderEmergencyCard}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <Icon name="info-outline" size={20} color="#666" />
                <Text style={styles.footerText}>
                    En caso de emergencia, mantén la calma y proporciona tu ubicación exacta
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 25,
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    alertBadge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1E232C', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#666', textAlign: 'center' },
    listContainer: { padding: 20, paddingBottom: 100 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardContent: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    iconContainer: {
        width: 65,
        height: 65,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: { flex: 1 },
    name: { fontSize: 18, fontWeight: 'bold', color: '#1E232C', marginBottom: 6 },
    numberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    number: { fontSize: 20, fontWeight: '600', letterSpacing: 1 },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF3CD',
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#FFE082',
    },
    footerText: { flex: 1, fontSize: 13, color: '#856404', lineHeight: 18 },
});