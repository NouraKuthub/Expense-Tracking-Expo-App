import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ReportsScreen from '../screens/ReportsScreen';
// Import other screens later

import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { setUser } from '../store/authSlice';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
);

const MainStack = createStackNavigator();

const AppTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Dashboard') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Reports') {
                    iconName = focused ? 'pie-chart' : 'pie-chart-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4c669f',
            tabBarInactiveTintColor: 'gray',
        })}
    >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
);

const MainNavigator = () => (
    <MainStack.Navigator>
        <MainStack.Screen name="MainTabs" component={AppTabs} options={{ headerShown: false }} />
        <MainStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
    </MainStack.Navigator>
);

const AppNavigator = () => {
    const { isAuthenticated, loading, user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [initializing, setInitializing] = React.useState(true);

    useEffect(() => {
        if (!auth) {
            setInitializing(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                dispatch(setUser(u));
            } else {
                dispatch(setUser(null));
            }
            if (initializing) setInitializing(false);
        });
        return unsubscribe;
    }, []);

    if (initializing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#4c669f" />
            </View>
        );
    }

    return (
        // <NavigationContainer>
        <>
            {isAuthenticated ? <MainNavigator /> : <AuthStack />}
        </>
        // </NavigationContainer>
    );
};

export default AppNavigator;
