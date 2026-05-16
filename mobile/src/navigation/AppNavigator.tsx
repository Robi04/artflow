import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import TabNavigator from './TabNavigator';
import MissionDetailScreen from '../screens/home/MissionDetailScreen';
import LongProjectDetailScreen from '../screens/long-projects/LongProjectDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { token, isLoading, loadFromStorage } = useAuthStore();

  useEffect(() => { loadFromStorage(); }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#0f0f0f' } }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="MissionDetail" component={MissionDetailScreen}
              options={{ headerShown: true, headerStyle: { backgroundColor: '#1a1a1a' }, headerTintColor: '#fff', title: 'Mission' }} />
            <Stack.Screen name="LongProjectDetail" component={LongProjectDetailScreen}
              options={{ headerShown: true, headerStyle: { backgroundColor: '#1a1a1a' }, headerTintColor: '#fff', title: 'Projet' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
