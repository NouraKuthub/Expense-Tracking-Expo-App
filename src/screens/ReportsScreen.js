import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get("window").width;

const ReportsScreen = () => {
    const { transactions } = useSelector(state => state.transactions);

    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    // Group expenses by category
    const expensesByCategory = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});

    const pieData = Object.keys(expensesByCategory).map((key, index) => ({
        name: key,
        population: expensesByCategory[key],
        color: `rgba(131, 167, 234, ${1 - index * 0.1})`, // Dynamic color logic
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
    }));

    // If no data, show placeholder
    if (pieData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>No expense data available for reports</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Expense Analysis</Text>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Expenses by Category</Text>
                <PieChart
                    data={pieData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: "#1cc910",
                        backgroundGradientFrom: "#eff3ff",
                        backgroundGradientTo: "#efefef",
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    chartContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: '600',
    },
    message: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    }
});

export default ReportsScreen;
