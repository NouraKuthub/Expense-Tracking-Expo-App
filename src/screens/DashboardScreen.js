import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { loadTransactions, updateTransaction, deleteTransaction } from '../store/transactionSlice';
import { logout } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EditAmountModal from '../components/EditAmountModal';
import { Alert } from 'react-native';

const DashboardScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { transactions, loading } = useSelector(state => state.transactions);
    const { user } = useSelector(state => state.auth);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    useEffect(() => {
        dispatch(loadTransactions());
    }, [dispatch]);

    const calculateTotals = () => {
        let income = 0;
        let expense = 0;
        transactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });
        return { income, expense, balance: income - expense };
    };

    const { income, expense, balance } = calculateTotals();

    const handleEdit = (transaction) => {
        setSelectedTransaction(transaction);
        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => dispatch(deleteTransaction(id))
                }
            ]
        );
    };

    const handleSaveTransaction = (updatedTransaction) => {
        dispatch(updateTransaction(updatedTransaction));
        setModalVisible(false);
        setSelectedTransaction(null);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0] || 'User'}</Text>
                    <TouchableOpacity onPress={() => dispatch(logout())}>
                        <Ionicons name="log-out-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.2)' }]}>
                                <Ionicons name="arrow-down" size={20} color="#4CAF50" />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>Income</Text>
                                <Text style={styles.statValue}>${income.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={styles.verticalDivider} />
                        <View style={styles.statItem}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}>
                                <Ionicons name="arrow-up" size={20} color="#F44336" />
                            </View>
                            <View>
                                <Text style={styles.statLabel}>Expense</Text>
                                <Text style={styles.statValue}>${expense.toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={() => dispatch(loadTransactions())} />}
            >
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions yet. Add one!</Text>
                ) : (
                    transactions.slice().reverse().map(t => (
                        <View key={t.id} style={styles.transactionItem}>
                            <View style={styles.transactionLeft}>
                                <View style={[styles.catIcon, { backgroundColor: t.type === 'income' ? '#e8f5e9' : '#ffebee' }]}>
                                    <Ionicons
                                        name={t.type === 'income' ? 'wallet-outline' : 'cart-outline'}
                                        size={20}
                                        color={t.type === 'income' ? '#388e3c' : '#d32f2f'}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.transTitle}>{t.description}</Text>
                                    <Text style={styles.transDate}>{new Date(t.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                            <View style={styles.transactionRight}>
                                <Text style={[styles.transAmount, { color: t.type === 'income' ? '#388e3c' : '#d32f2f' }]}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                </Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity onPress={() => handleEdit(t)} style={styles.iconButton}>
                                        <Ionicons name="create-outline" size={20} color="#4c669f" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(t.id)} style={styles.iconButton}>
                                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.fabContainer}>
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: '#F44336', marginRight: 10 }]}
                    onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
                >
                    <Ionicons name="remove" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.fab, { backgroundColor: '#4CAF50' }]}
                    onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
                >
                    <Ionicons name="add" size={30} color="white" />
                </TouchableOpacity>
            </View>

            <EditAmountModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveTransaction}
                transaction={selectedTransaction}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greeting: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    balanceCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    balanceLabel: {
        color: '#e0e0e0',
        fontSize: 14,
    },
    balanceAmount: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    statLabel: {
        color: '#e0e0e0',
        fontSize: 12,
    },
    statValue: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    verticalDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
    transactionItem: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionRight: {
        alignItems: 'flex-end',
    },
    catIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    transTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    transDate: {
        fontSize: 12,
        color: '#999',
    },
    transAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 15,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});

export default DashboardScreen;
