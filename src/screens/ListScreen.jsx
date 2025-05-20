import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    collection,
    onSnapshot,
    query,
    orderBy,
} from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { firestore } from '../firebase';
import moment from 'moment';
export const ListScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const q = query(
            collection(firestore, 'reports'),
            orderBy('timestamp', 'desc')
        );
        const unsubscribe = onSnapshot(
            q,
            snap => {
                const data = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() ?? null,
                }));
                setReports(data);
                setLoading(false);
            },
            err => {
                console.error(err);
                Alert.alert('Error', 'No se pudieron obtener las denuncias.');
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);
    const renderReport = ({ item }) => (
        <View style={styles.reportItem}>
            <Text style={styles.reportTitle}>{item.name}</Text>
            <Text style={styles.reportDetail}>{item.dni}</Text>
            <Text style={styles.reportDetail}>{item.address}</Text>
            <Text style={styles.reportDescription}>{item.description}</Text>
            <Text style={styles.reportTimestamp}>
                {item.timestamp ? moment(item.timestamp).format('DD/MM/YYYY hh:mm') : ''}
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
