import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
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
import { auth } from './src/firebase';
import { ActivityIndicator, View } from 'react-native';
import MenuScreen from './src/screens/MenuScreen';
import SurvayScreen from './src/screens/SurvayScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Timeout de seguridad
    const authTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth timeout - defaulting to main screen');
        setInitialRoute('main');
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, user => {
      clearTimeout(authTimeout);
      if (mounted) {
        if (user) {
          setInitialRoute('home');
        } else {
          setInitialRoute('main');
        }
        setLoading(false);
      }
    }, (error) => {
      console.error('Auth error:', error);
      clearTimeout(authTimeout);
      if (mounted) {
        setInitialRoute('main');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#05274B" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <MainContextScreen>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerStyle: {
                backgroundColor: '#05274B',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen name='main' component={HomeScreen} options={{ title: 'main', headerShown: false }} />
            <Stack.Screen name='login' component={LoginScreen} options={{ title: '' }} />
            <Stack.Screen name='register' component={RegisterScreen} options={{ title: 'Registro' }} />
            <Stack.Screen name='home' component={MenuScreen} options={{ headerShown: false }} />
            <Stack.Screen name='search' component={SearchScreen} options={{ title: 'Buscar ruta' }} />
            <Stack.Screen name='report' component={ReportScreen} options={{ title: 'Reporte de denuncias' }} />
            <Stack.Screen name='emergency' component={EmergencyScreen} options={{ title: '' }} />
            <Stack.Screen name='lista' component={ListScreen} options={{ title: 'Denuncias' }} />
            <Stack.Screen name='survay' component={SurvayScreen} options={{ title: 'Encuesta' }} />
            <Stack.Screen name='changePassword' component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </MainContextScreen>
    </PaperProvider>
  );
}