import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

export default function EmergencyScreen() {
    const emergencyNumbers = [
        { id: '1', name: 'Policía', number: '105' },
        { id: '2', name: 'Bomberos', number: '116' },
        { id: '3', name: 'Ambulancia', number: '106' }
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Números de emergencia</Text>
            <FlatList
                data={emergencyNumbers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.numberContainer}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.number}>{item.number}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    numberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        backgroundColor: '#F7F8F9',
        marginTop: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
        elevation: 2
    },
    name: {
        fontSize: 18,
    },
    number: {
        fontSize: 18,
        color: '#5568FE',
    },
});
