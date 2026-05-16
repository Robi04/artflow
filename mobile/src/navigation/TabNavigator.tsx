import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import PlanScreen from '../screens/plan/PlanScreen';
import LongProjectsScreen from '../screens/long-projects/LongProjectsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const icon = (emoji: string) => () => <Text className="text-xl">{emoji}</Text>;

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1a1a1a', borderTopColor: '#2a2a2a' },
        tabBarActiveTintColor: '#a78bfa',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Missions', tabBarIcon: icon('🎯') }} />
      <Tab.Screen name="Plan" component={PlanScreen} options={{ title: 'Mon plan', tabBarIcon: icon('📋') }} />
      <Tab.Screen name="Projects" component={LongProjectsScreen} options={{ title: 'Projets', tabBarIcon: icon('🎨') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil', tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}
