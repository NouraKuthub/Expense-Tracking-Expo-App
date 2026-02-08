import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
    transactions: [],
    loading: false,
    error: null,
};

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        setTransactions: (state, action) => {
            state.transactions = action.payload;
            state.loading = false;
            state.error = null;
        },
        addTransactionToState: (state, action) => {
            state.transactions.push(action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateTransactionInState: (state, action) => {
            const index = state.transactions.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.transactions[index] = action.payload;
            }
        },
        removeTransactionFromState: (state, action) => {
            state.transactions = state.transactions.filter(t => t.id !== action.payload);
        },
    },
});

export const { setTransactions, addTransactionToState, setLoading, setError, updateTransactionInState, removeTransactionFromState } = transactionSlice.actions;

// Thunks
export const loadTransactions = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const jsonValue = await AsyncStorage.getItem('@transactions');
        const transactions = jsonValue != null ? JSON.parse(jsonValue) : [];
        dispatch(setTransactions(transactions));
    } catch (e) {
        dispatch(setError("Failed to load transactions"));
    }
};

export const addTransaction = (transaction) => async (dispatch, getState) => {
    try {
        const { transactions } = getState().transactions;
        const newTransactions = [...transactions, transaction];
        await AsyncStorage.setItem('@transactions', JSON.stringify(newTransactions));
        dispatch(addTransactionToState(transaction));
    } catch (e) {
        dispatch(setError("Failed to save transaction"));
    }
};

export const updateTransaction = (updatedTransaction) => async (dispatch, getState) => {
    try {
        const { transactions } = getState().transactions;
        const newTransactions = transactions.map(t =>
            t.id === updatedTransaction.id ? updatedTransaction : t
        );
        await AsyncStorage.setItem('@transactions', JSON.stringify(newTransactions));
        dispatch(updateTransactionInState(updatedTransaction));
    } catch (e) {
        dispatch(setError("Failed to update transaction"));
    }
};

export const deleteTransaction = (id) => async (dispatch, getState) => {
    try {
        const { transactions } = getState().transactions;
        const newTransactions = transactions.filter(t => t.id !== id);
        await AsyncStorage.setItem('@transactions', JSON.stringify(newTransactions));
        dispatch(removeTransactionFromState(id));
    } catch (e) {
        dispatch(setError("Failed to delete transaction"));
    }
};

export default transactionSlice.reducer;
