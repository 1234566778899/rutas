import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    collection,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { firestore } from '../firebase';
export const ListScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchReports = () => {
        setLoading(true);

        const q = query(
            collection(firestore, 'reports'),
            orderBy('timestamp', 'desc')
        );
        onSnapshot(
            q,
            (querySnapshot) => {
                const reportsList = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    reportsList.push({
                        id: doc.id,
                        name: data.name,
                        dni: data.dni,
                        address: data.address,
                        description: data.description,
                        userId: data.userId,
                        timestamp: data.timestamp ? data.timestamp.toDate() : null,
                    });
                });
                setReports(reportsList);
                setLoading(false);
            },
            (error) => {
                console.error(error);
                Alert.alert('Error', 'No se pudieron obtener las denuncias.');
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        fetchReports();
    }, []);
    const renderReport = ({ item }) => (
        <View style={styles.reportItem}>
            <Text style={styles.reportTitle}>{item.name}</Text>
            <Text style={styles.reportDetail}>{item.dni}</Text>
            <Text style={styles.reportDetail}>{item.address}</Text>
            <Text style={styles.reportDescription}>{item.description}</Text>
            <Text style={styles.reportTimestamp}>
                {item.timestamp ? item.timestamp.toLocaleString() : ''}
            </Text>
        </View>
    );
    return (

        <View style={styles.listContainer}>
            <Text style={[styles.listTitle, { color: 'black', paddingVertical: 15 }]}>Todas las Denuncias</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#5568FE" />
            ) : reports.length === 0 ? (
                <Text style={styles.noReportsText}>No hay denuncias registradas.</Text>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.id}
                    renderItem={renderReport}

                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
            <TouchableOpacity
                onPress={() => navigation.navigate('report')}
                style={{ backgroundColor: 'white', width: 70, height: 70, alignItems: 'center', justifyContent: 'center', borderRadius: 50, elevation: 5, position: 'absolute', bottom: 20, right: 20 }}>
                <MaterialIcons name="add" size={40} color="blue" />
            </TouchableOpacity>
        </View>

    )
}

const styles = StyleSheet.create({

    listContainer: {
        flex: 1,
        paddingHorizontal: 10,
        position: 'relative'
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
