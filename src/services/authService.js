import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, isConfigured } from "../firebaseConfig";
import { setUser, setLoading, setError } from "../store/authSlice";

// Mock Data
const MOCK_USER = {
    uid: "mock-user-123",
    email: "test@example.com",
    displayName: "Test User"
};

const simulateDelay = async () => new Promise(resolve => setTimeout(resolve, 1000));

export const register = (email, password) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        if (!isConfigured) {
            console.warn("Firebase not configured, using MOCK");
            await simulateDelay();
            dispatch(setUser({ ...MOCK_USER, email }));
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        dispatch(setUser(userCredential.user));
    } catch (error) {
        dispatch(setError(error.message));
        if (!isConfigured) {
            // If firebase fails (e.g. valid config but network error), fallback mock for testing/dev? 
            // No, if isConfigured is true, we expect real auth.
            // If isConfigured is false, we already returned mock.
        }
    }
};

export const login = (email, password) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        if (!isConfigured) {
            console.warn("Firebase not configured, using MOCK");
            await simulateDelay();
            // Simple mock validation
            if (password === "password") {
                dispatch(setUser({ ...MOCK_USER, email }));
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
