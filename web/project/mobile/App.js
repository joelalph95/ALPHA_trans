import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/utils/theme';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import PassagerHomeScreen from './src/screens/PassagerHomeScreen';
import ChauffeurHomeScreen from './src/screens/ChauffeurHomeScreen';
import ChauffeurStatsScreen from './src/screens/ChauffeurStatsScreen'; // Ajouté
import ReservationScreen from './src/screens/ReservationScreen';
import TrajetScreen from './src/screens/TrajetScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MesDemandesScreen from './src/screens/MesDemandesScreen';
import MesPassagersScreen from './src/screens/MesPassagersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Passenger bottom tab navigator ──────────────────────────────────────────
function PassagerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight || '#64748B',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: COLORS.border || '#E2E8F0',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Accueil: focused ? 'home' : 'home-outline',
            Réservation: focused ? 'add-circle' : 'add-circle-outline',
            'Mes Trajets': focused ? 'list' : 'list-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={PassagerHomeScreen} />
      <Tab.Screen name="Réservation" component={ReservationScreen} />
      <Tab.Screen name="Mes Trajets" component={MesDemandesScreen} />
    </Tab.Navigator>
  );
}

// ─── Chauffeur bottom tab navigator ────────────────────────────────
function ChauffeurTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: COLORS.textLight || '#64748B',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: COLORS.border || '#E2E8F0',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Tableau: focused ? 'speedometer' : 'speedometer-outline',
            Passagers: focused ? 'people' : 'people-outline',
            Statistiques: focused ? 'stats-chart' : 'stats-chart-outline',
            MonProfil: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tableau" component={ChauffeurHomeScreen} />
      <Tab.Screen name="Passagers" component={MesPassagersScreen} />
      <Tab.Screen name="Statistiques" component={ChauffeurStatsScreen} />
      <Tab.Screen name="MonProfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Auth Navigator ───────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── App Navigator (after login) ─────────────────────────────────────────────
function AppNavigator() {
  const { user } = useAuth();
  const isPassager = user?.role === 'passager';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isPassager ? (
        <>
          <Stack.Screen name="PassagerMain" component={PassagerTabs} />
          <Stack.Screen name="Reservation" component={ReservationScreen} />
          <Stack.Screen name="MesDemandes" component={MesDemandesScreen} />
          <Stack.Screen name="Trajet" component={TrajetScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="ChauffeurMain" component={ChauffeurTabs} />
          <Stack.Screen name="ChauffeurHome" component={ChauffeurHomeScreen} />
          <Stack.Screen name="ChauffeurStats" component={ChauffeurStatsScreen} />
          <Stack.Screen name="MesPassagers" component={MesPassagersScreen} />
          <Stack.Screen name="Trajet" component={TrajetScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}