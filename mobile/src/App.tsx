import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import tab screens
import HomeTab from './screens/HomeTab';
import RecordsTab from './screens/RecordsTab';
import ScannerTab from './screens/ScannerTab';
import ProfileTab from './screens/ProfileTab';

// Import detail screens
import DocumentDetailScreen from './screens/DocumentDetailScreen';

// Import auth screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

// Import API service
import apiService from './services/api.service';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Records Stack Navigator (to enable navigation to DocumentDetail)
const RecordsStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="RecordsList"
        component={RecordsTab}
        options={{
          headerTitle: 'SwasthyaSathi',
          headerShown: false, // We'll use the tab bar header instead
        }}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={{
          headerTitle: 'Document',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        // Header styling
        headerStyle: {
          backgroundColor: '#007AFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerTitleAlign: 'center',

        // Tab bar styling
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          headerTitle: 'SwasthyaSathi',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="home"
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Records"
        component={RecordsStack}
        options={{
          headerTitle: 'SwasthyaSathi',
          tabBarLabel: 'Records',
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="folder"
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerTab}
        options={{
          headerTitle: 'SwasthyaSathi',
          tabBarLabel: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="camera"
              size={focused ? 28 : 26}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          headerTitle: 'SwasthyaSathi',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="user"
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await apiService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await apiService.logout();
    setIsAuthenticated(false);
  };

  // Show loading spinner while checking authentication
  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        {isAuthenticated ? (
          <MainTabs />
        ) : (
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateToRegister={() => props.navigation.navigate('Register' as never)}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => (
                <RegisterScreen
                  {...props}
                  onRegisterSuccess={handleLoginSuccess}
                  onNavigateToLogin={() => props.navigation.navigate('Login' as never)}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
});

export default App;
