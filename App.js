import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MapaScreen from './src/screens/MapaScreen';
import SearchScreen from './src/screens/SearchScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import { MainContextScreen } from './src/contexts/MainContextScreen';
import ReportScreen from './src/screens/ReportScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import HomeScreen from './src/screens/HomeScreen';
import { ListScreen } from './src/screens/ListScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebase'; // asegúrate que el path sea correcto
import { ActivityIndicator, View } from 'react-native';
const Stack = createNativeStackNavigator();
export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setInitialRoute('home');
      } else {
        setInitialRoute('main');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <MainContextScreen>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name='main' component={HomeScreen} options={{ title: 'main', headerShown: false }} />
          <Stack.Screen name='login' component={LoginScreen} options={{ title: '' }} />
          <Stack.Screen name='register' component={RegisterScreen} options={{ title: 'Registro' }} />
          <Stack.Screen name='home' component={MapaScreen} options={{ title: 'Escoger ruta' }} />
          <Stack.Screen name='search' component={SearchScreen} options={{ title: 'Buscar ruta' }} />
          <Stack.Screen name='report' component={ReportScreen} options={{ title: 'Reporte de denuncias' }} />
          <Stack.Screen name='emergency' component={EmergencyScreen} options={{ title: '' }} />
          <Stack.Screen name='lista' component={ListScreen} options={{ title: 'Denuncias' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </MainContextScreen>
  );
}
