import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Feather, FontAwesome5 } from '@expo/vector-icons'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../config';
import { MainContext } from '../contexts/MainContextScreen';

export default function SearchScreen({ navigation }) {
    const [results, setResults] = useState([]);
    const [recientes, setRecientes] = useState([]);
    const { position, setDestination } = useContext(MainContext);

    const saveReciente = async (place) => {
        let aux = [place, ...recientes].slice(0, 6);
        await AsyncStorage.setItem('places', JSON.stringify(aux));
    }
    const getRecientes = async () => {
        const arr = await AsyncStorage.getItem('places');
        if (arr) {
            setRecientes(JSON.parse(arr));
        }
    }
    useEffect(() => {
        getRecientes();
    }, [])

    const getSites = (value) => {
        if (value == "" || value.trim() == "" || value == null) return;

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
                setResults(response.data.suggestions);
            })
            .catch(error => {
                console.error('Error en la solicitud:', error.response.status);
                console.error(error.response.data);
            });
    }
    const positionDestination = (value) => {
        axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${value.placePrediction.placeId}&key=${CONFIG.apiKey}`)
            .then(response => {
                const { name, formatted_address, geometry } = response.data.result;
                const { lat, lng } = geometry.location;
                setDestination({ longitude: lng, latitude: lat });
                saveReciente({ latitude: lat, longitude: lng, name, address: formatted_address });
                navigation.navigate('home');
            })
            .catch(error => {
                console.log(error);
            })
    }

    const positionSaved = (place) => {
        const { latitude, longitude, name, address } = place;
        setDestination({ longitude, latitude, name, address });
        navigation.navigate('home');
    }

    return (
        <View style={{ flex: 1, position: 'absolute', backgroundColor: 'white', height: '100%', width: '100%', paddingHorizontal: 10 }}>
            <View style={{
                flexDirection: 'row', padding: 13, paddingVertical: 5, marginTop: 10, borderRadius: 35, alignItems: 'center',
                backgroundColor: '#F3F4F8', marginBottom: 15, justifyContent: 'space-between'
            }}>
                <TextInput onChangeText={(value) => getSites(value)} style={{ width: '90%', fontSize: 17, padding: 5, paddingVertical: 15, paddingLeft: 10 }} placeholder='Av.' placeholderTextColor={'black'} />
                <Feather name="search" size={24} color="black" />
            </View>
            {
                results.length > 0 && results.map((x, index) => (
                    <TouchableOpacity key={index}
                        onPress={() => positionDestination(x)}
                        style={{
                            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 25, borderBottomWidth: 1, borderBottomColor: '#EEEEEE'
                        }}>
                        <FontAwesome5 name="map-marker-alt" size={24} color="black" />
                        <Text style={{ marginLeft: 20 }} numberOfLines={1}>{x.placePrediction.text.text}</Text>
                    </TouchableOpacity>
                ))
            }
            {
                results.length == 0 && recientes.length > 0 && (
                    <View>
                        <Text style={{ fontSize: 16, marginTop: 10, marginLeft: 10, fontWeight: 'bold' }}>Recientes</Text>
                        {
                            recientes.map((x, index) => (
                                <TouchableOpacity key={index}
                                    onPress={() => positionSaved(x)}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 25, borderBottomWidth: 1, borderBottomColor: '#EEEEEE'
                                    }}>
                                    <FontAwesome5 name="map-marker-alt" size={24} color="black" />
                                    <Text style={{ marginLeft: 20 }} numberOfLines={1}>{x.name}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                )
            }
        </View>
    )
}
