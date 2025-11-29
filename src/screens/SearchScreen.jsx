import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../config';
import { MainContext } from '../contexts/MainContextScreen';
import { Alert } from 'react-native';

export default function SearchScreen({ navigation }) {
    const [results, setResults] = useState([]);
    const [recientes, setRecientes] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const { position, setDestination } = useContext(MainContext);

    const saveReciente = async (place) => {
        try {
            let aux = [place, ...recientes].slice(0, 6);
            await AsyncStorage.setItem('places', JSON.stringify(aux));
            setRecientes(aux);
        } catch (error) {
            console.error('Error al guardar reciente:', error);
        }
    }

    const getRecientes = async () => {
        try {
            const arr = await AsyncStorage.getItem('places');
            if (arr) {
                setRecientes(JSON.parse(arr));
            }
        } catch (error) {
            console.error('Error al obtener recientes:', error);
        }
    }

    useEffect(() => {
        getRecientes();
    }, [])

    const getSites = (value) => {
        setSearchText(value);

        if (!value || value.trim() === "") {
            setResults([]);
            return;
        }

        if (!position) {
            Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
            return;
        }

        setLoading(true);

        const requestData = {
            input: value,
            locationBias: {
                circle: {
                    center: position,
                    radius: 20000.0
                }
            },
            languageCode: 'es'
        };

        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': CONFIG.apiKey
        };

        axios.post(CONFIG.uriMap, requestData, { headers })
            .then(response => {
                setResults(response.data.suggestions || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error en la solicitud:', error.response?.data || error.message);
                setLoading(false);

                if (error.response?.status === 403) {
                    Alert.alert(
                        'Error de configuración',
                        'La API Key no está configurada correctamente. Por favor, verifica la configuración en Google Cloud Console.',
                        [{ text: 'OK', onPress: () => navigation.goBack() }]
                    );
                } else {
                    Alert.alert('Error', 'No se pudieron cargar los resultados. Inténtalo de nuevo.');
                }
            });
    }

    const positionDestination = (value) => {
        setLoading(true);

        const placeId = value.placePrediction.placeId;
        const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;

        const headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': CONFIG.apiKey,
            'X-Goog-FieldMask': 'id,displayName,formattedAddress,location'
        };

        axios.get(detailsUrl, { headers })
            .then(response => {
                const place = response.data;
                const name = place.displayName?.text || 'Lugar sin nombre';
                const address = place.formattedAddress || '';
                const latitude = place.location?.latitude;
                const longitude = place.location?.longitude;

                if (!latitude || !longitude) {
                    throw new Error('No se pudo obtener la ubicación del lugar');
                }

                setDestination({ longitude, latitude, name, address });
                saveReciente({ latitude, longitude, name, address });
                setLoading(false);
                navigation.navigate('map');
            })
            .catch(error => {
                console.error('Error al obtener detalles:', error.response?.data || error.message);
                setLoading(false);

                if (error.response?.status === 403) {
                    Alert.alert(
                        'Error de configuración',
                        'No se puede acceder a los detalles del lugar. Verifica la configuración de la API Key.'
                    );
                } else {
                    Alert.alert('Error', 'No se pudieron obtener los detalles del lugar. Inténtalo de nuevo.');
                }
            });
    }

    const positionSaved = (place) => {
        const { latitude, longitude, name, address } = place;
        setDestination({ longitude, latitude, name, address });
        navigation.navigate('map');
    }

    const clearSearch = () => {
        setSearchText('');
        setResults([]);
    }

    const renderSearchResult = ({ item }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => positionDestination(item)}
            activeOpacity={0.7}
        >
            <View style={styles.iconCircle}>
                <FAIcon name="map-marker-alt" size={18} color="#05274B" />
            </View>
            <View style={styles.resultTextContainer}>
                <Text style={styles.resultText} numberOfLines={1}>
                    {item.placePrediction.text.text}
                </Text>
                <Text style={styles.resultSubtext} numberOfLines={1}>
                    {item.placePrediction.structuredFormat?.secondaryText?.text || ''}
                </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCCCCC" />
        </TouchableOpacity>
    );

    const renderRecentItem = ({ item }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => positionSaved(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconCircle, { backgroundColor: '#F0F4FF' }]}>
                <Icon name="history" size={20} color="#05274B" />
            </View>
            <View style={styles.resultTextContainer}>
                <Text style={styles.resultText} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.resultSubtext} numberOfLines={1}>
                    {item.address}
                </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#CCCCCC" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Icon name="search" size={24} color="#666" />
                    <TextInput
                        onChangeText={getSites}
                        value={searchText}
                        style={styles.searchInput}
                        placeholder='¿A dónde quieres ir?'
                        placeholderTextColor='#999'
                        autoFocus
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#05274B" />
                    <Text style={styles.loadingText}>Buscando lugares...</Text>
                </View>
            )}

            {!loading && results.length > 0 && (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderSearchResult}
                    style={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {!loading && results.length === 0 && recientes.length > 0 && (
                <View style={styles.recentsContainer}>
                    <View style={styles.recentsHeader}>
                        <Icon name="history" size={24} color="#05274B" />
                        <Text style={styles.recentsTitle}>Búsquedas recientes</Text>
                    </View>
                    <FlatList
                        data={recientes}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderRecentItem}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {!loading && results.length === 0 && recientes.length === 0 && searchText.length === 0 && (
                <View style={styles.emptyContainer}>
                    <FAIcon name="search-location" size={64} color="#CCCCCC" />
                    <Text style={styles.emptyTitle}>Busca un lugar</Text>
                    <Text style={styles.emptyText}>
                        Escribe una dirección, lugar o punto de interés
                    </Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    searchContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 16, color: '#666' },
    resultsList: { flex: 1 },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultTextContainer: { flex: 1 },
    resultText: { fontSize: 16, fontWeight: '600', color: '#1E232C', marginBottom: 4 },
    resultSubtext: { fontSize: 13, color: '#666' },
    recentsContainer: { flex: 1, backgroundColor: 'white', paddingTop: 16 },
    recentsHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
    recentsTitle: { fontSize: 18, fontWeight: 'bold', color: '#05274B' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E232C', marginTop: 20, marginBottom: 8 },
    emptyText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
});