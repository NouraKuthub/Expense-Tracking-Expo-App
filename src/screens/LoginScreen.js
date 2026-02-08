import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        await dispatch(login(email, password));
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <View style={styles.card}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Login to your account</Text>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 20,
        paddingVertical: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#4c669f',
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
    },
    linkBold: {
        color: '#4c669f',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    }
});

export default LoginScreen;
