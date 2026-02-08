import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addTransaction } from '../store/transactionSlice';
import { extractAmountFromImage } from '../services/ocrService';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddTransactionScreen = ({ route, navigation }) => {
    const { type } = route.params; // 'income' or 'expense'
    const isExpense = type === 'expense';

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const [extracting, setExtracting] = useState(false);

    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.transactions);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            if (isExpense) {
                handleExtractAmount(result.assets[0].uri);
            }
        }
    };

    const handleExtractAmount = async (uri) => {
        setExtracting(true);
        try {
            const extractedValue = await extractAmountFromImage(uri);
            setAmount(extractedValue.toString());
            Alert.alert("OCR Success", `Extracted amount: ${extractedValue}`);
        } catch (e) {
            Alert.alert("OCR Failed", "Could not extract amount.");
        } finally {
            setExtracting(false);
        }
    };

    const handleSave = () => {
        if (!amount || !description) {
            Alert.alert("Error", "Please enter amount and description");
            return;
        }

        const transaction = {
            id: Date.now().toString(),
            type,
            amount: parseFloat(amount),
            description,
            category: category || 'General',
            date: new Date().toISOString(),
            billImageUri: image
        };

        dispatch(addTransaction(transaction));
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={[styles.title, { color: isExpense ? '#d32f2f' : '#388e3c' }]}>
                Add {isExpense ? 'Expense' : 'Income'}
            </Text>

            <View style={styles.inputContainer}>
                <Ionicons name="cash-outline" size={24} color="#555" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                {extracting && <Text style={styles.helperText}>Scanning...</Text>}
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="create-outline" size={24} color="#555" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={24} color="#555" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Category (e.g. Food, Rent)"
                    value={category}
                    onChangeText={setCategory}
                />
            </View>

            {isExpense && (
                <View style={styles.imageSection}>
                    <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                        <Ionicons name="camera-outline" size={24} color="white" />
                        <Text style={styles.uploadButtonText}>Upload Bill / Receipt</Text>
                    </TouchableOpacity>
                    {image && <Image source={{ uri: image }} style={styles.previewImage} />}
                </View>
            )}

            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: isExpense ? '#d32f2f' : '#388e3c' }]}
                onPress={handleSave}
            >
                <Text style={styles.saveButtonText}>Save Transaction</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    helperText: {
        color: '#888',
        fontStyle: 'italic',
        fontSize: 12,
    },
    imageSection: {
        alignItems: 'center',
        marginVertical: 15,
    },
    uploadButton: {
        flexDirection: 'row',
        backgroundColor: '#555',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButtonText: {
        color: 'white',
        marginLeft: 10,
    },
    previewImage: {
        width: 200,
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
    saveButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default AddTransactionScreen;
