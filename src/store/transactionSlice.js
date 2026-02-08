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
    },
});

export const { setTransactions, addTransactionToState, setLoading, setError } = transactionSlice.actions;

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

export default transactionSlice.reducer;
