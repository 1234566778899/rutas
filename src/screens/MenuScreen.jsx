import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapaScreen from './MapaScreen';
import ProfileScreen from './ProfileScreen';
import EmergyScreen from './EmergyScreen';

const Tab = createBottomTabNavigator();

export default function MenuScreen() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'map') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'emergy') {
                        iconName = focused ? 'warning' : 'warning-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    height: 60,
                    paddingTop: 5
                },
            })}
        >
            <Tab.Screen
                name="map"
                options={{ title: 'Buscar' }}
                component={MapaScreen}
            />
            <Tab.Screen
                name="emergy"
                options={{
                    title: 'Emergencia',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTitleStyle: {
                        color: 'white',
                    },
                }}
                component={EmergyScreen}
            />

            <Tab.Screen
                name="profile"
                options={{
                    title: 'Mi Perfil',
                    headerStyle: {
                        backgroundColor: '#222',
                    },
                    headerTitleStyle: {
                        color: 'white',
                    },
                }}
                component={ProfileScreen}

            />

        </Tab.Navigator>
    );
}
