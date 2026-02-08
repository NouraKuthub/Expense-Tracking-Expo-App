import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, isConfigured } from "../firebaseConfig";
import { setUser, setLoading, setError } from "../store/authSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock Data Key
const MOCK_USERS_KEY = 'mock_users_store';

const simulateDelay = async () => new Promise(resolve => setTimeout(resolve, 1000));

export const register = (email, password) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        if (!isConfigured) {
            console.warn("Firebase not configured, using MOCK with AsyncStorage");
            await simulateDelay();

            // Get existing users
            const existingUsersJson = await AsyncStorage.getItem(MOCK_USERS_KEY);
            const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : {};

            if (existingUsers[email]) {
                dispatch(setError("User already exists (Mock)"));
                return;
            }

            // Save new user
            const newUser = {
                uid: `mock-user-${Date.now()}`,
                email,
                password, // In a real app, never store passwords plain text!
                displayName: "Test User"
            };

            existingUsers[email] = newUser;
            await AsyncStorage.setItem(MOCK_USERS_KEY, JSON.stringify(existingUsers));

            // Return user info (excluding password)
            const { password: _, ...userInfo } = newUser;
            dispatch(setUser(userInfo));
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        dispatch(setUser(userCredential.user));
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const login = (email, password) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        if (!isConfigured) {
            console.warn("Firebase not configured, using MOCK with AsyncStorage");
            await simulateDelay();

            // Get users
            const existingUsersJson = await AsyncStorage.getItem(MOCK_USERS_KEY);
            const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : {};
            const user = existingUsers[email];

            if (user && user.password === password) {
                const { password: _, ...userInfo } = user;
                dispatch(setUser(userInfo));
            } else {
                dispatch(setError("Invalid credentials"));
            }
            return;
        }
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        dispatch(setUser(userCredential.user));
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const logout = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        if (isConfigured) {
            await signOut(auth);
        } else {
            await simulateDelay();
        }
        dispatch(setUser(null));
    } catch (error) {
        console.error(error);
        dispatch(setError(error.message));
    }
};
