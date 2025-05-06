import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Alert, Modal, StyleSheet } from 'react-native';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { customMapStyle } from '../utils/CustomStyle';
import { MainContext } from '../contexts/MainContextScreen';
import axios from 'axios';
import { CONFIG } from '../../config';
import polyline from '@mapbox/polyline';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getDistance } from 'geolib'; // Importar correctamente getDistance desde geolib
import { dangerPlaces } from '../dangerPlaces'; // Asegúrate de ajustar la ruta según tu estructura de carpetas
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});


export default function MapaScreen() {
    const { setPosition, position, destination } = useContext(MainContext);
    const [routeCoords, setRouteCoords] = useState([]);
    const [menuVisible, setMenuVisible] = useState(false);
    const [dangerMarkers, setDangerMarkers] = useState([]);
    const mapRef = useRef(null);
    const navigation = useNavigation();

    const getPosition = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la ubicación');
                navigation.goBack();
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setPosition({ latitude, longitude });
        } catch (error) {
            navigation.goBack();
        }
    };

    const handleSearch = () => {
        navigation.navigate('search');
    };

    const getRouteDirections = async () => {
        if (!position || !destination) return;
        const url = `http://192.168.18.8:8000/route?origen_lat=${position.latitude}&origen_lon=${position.longitude}&destino_lat=${destination.latitude}&destino_lon=${destination.longitude}`
        axios.get(url)
            .then(response => {
                setRouteCoords(response.data);
                //sendNotification();
            })
            .catch(error => {
                Alert.alert('Error', 'No se pudo obtener la ruta.');
            })
    };
    const sendNotification = async () => {
        const recomendacionesViaje = [
            "Evita zonas poco iluminadas por la noche.",
            "Comparte tu ruta con un familiar o amigo.",
            "Ten tu teléfono cargado antes de salir.",
            "Mantén tus objetos personales seguros.",
            "Evita usar audífonos mientras caminas."
        ];
        const seleccionadas = recomendacionesViaje
            .sort(() => 0.5 - Math.random())
            .slice(0, 2)
            .join('\n');
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Recomendación para tu viaje",
                body: seleccionadas
            },
            trigger: null,
        });
    }

    const calculateDangerMarkers = () => {
        if (routeCoords.length === 0) {
            setDangerMarkers([]);
            return;
        }
        const threshold = 500;
        const filteredDangerPlaces = dangerPlaces
            .map(([latitude, longitude]) => ({ latitude, longitude }))
            .filter((dangerPoint) => {
                const minDistance = routeCoords.reduce((min, routePoint) => {
                    const distance = getDistance(
                        { latitude: dangerPoint.latitude, longitude: dangerPoint.longitude },
                        { latitude: routePoint.latitude, longitude: routePoint.longitude }
                    );
                    return distance < min ? distance : min;
                }, Infinity);
                return minDistance <= threshold;
            });
        setDangerMarkers(filteredDangerPlaces);
    };

    useEffect(() => {
        getPosition();
    }, []);

    useEffect(() => {
        if (destination) {
            getRouteDirections();
        }
    }, [destination]);

    useEffect(() => {
        if (routeCoords.length > 0) {
            calculateDangerMarkers();
        }
    }, [routeCoords]);

    useEffect(() => {
        if (routeCoords.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(routeCoords, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [routeCoords]);

    if (!position) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Cargando ubicación...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ position: 'absolute', zIndex: 1, padding: 10, width: '100%' }}>
                <TouchableOpacity
                    onPress={handleSearch}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: 10,
                        paddingVertical: 20,
                        borderColor: '#CCCCCC',
                        borderWidth: 1
                    }}
                >
                    <Text style={{ paddingLeft: 10, color: 'gray' }}>¿A dónde quieres ir?</Text>
                </TouchableOpacity>
            </View>
            <MapView
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                customMapStyle={customMapStyle}
                showsUserLocation={true}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    ...position,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.004
                }}
            >
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeWidth={4}
                        strokeColor="blue"
                    />
                )}
                {destination && (
                    <Marker
                        coordinate={destination}
                        title={destination.name || 'Destino'}
                        description={destination.address || ''}
                    />
                )}
                {dangerMarkers.map((marker, index) => (
                    <Circle
                        key={`danger-circle-${index}`}
                        center={marker}
                        radius={50} // Radio en metros
                        strokeColor="rgba(255, 0, 0, 0.8)" // Color del borde del círculo
                        fillColor="rgba(255, 0, 0, 0.3)" // Color de relleno del círculo
                    />
                ))}

            </MapView>
            <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={{ position: 'absolute', bottom: 20, right: 20, borderRadius: 10, backgroundColor: 'white', padding: 10, elevation: 5 }}>
                <MaterialIcons name="emergency-share" size={40} color="black" />
            </TouchableOpacity>
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate('lista');
                            }}
                        >
                            <Text style={styles.modalText}>Realizar denuncia</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate('emergency');
                            }}
                        >
                            <Text style={styles.modalText}>Números de emergencia</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '80%',
        paddingVertical: 20,
    },
    modalOption: {
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    modalText: {
        fontSize: 16,
        color: '#333',
    },
});
