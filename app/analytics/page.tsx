"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Home } from 'lucide-react';
import { useTransactionStore, Transaction } from '@/lib/store';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsPage() {
  const { transactions, businesses } = useTransactionStore();
  const [timeframe, setTimeframe] = useState('month');
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [expenseData, setExpenseData] = useState([]);
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState([]);

  useEffect(() => {
    // Process transactions based on the selected timeframe and business
    const filteredTransactions = filterTransactions(transactions, timeframe, selectedBusiness);
    
    // Calculate expense data
    const expensesByCategory = calculateExpensesByCategory(filteredTransactions);
    setExpenseData(expensesByCategory);

    // Calculate income vs expense data
    const incomeVsExpense = calculateIncomeVsExpense(filteredTransactions);
    setIncomeVsExpenseData(incomeVsExpense);
  }, [timeframe, selectedBusiness, transactions]);

  const filterTransactions = (transactions: Transaction[], timeframe: string, businessId: string) => {
    const now = new Date();
    const timeframeDate = new Date();
    
    switch (timeframe) {
      case 'week':
        timeframeDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        timeframeDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        timeframeDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions.filter(t => 
      new Date(t.date) >= timeframeDate &&
      (businessId === 'all' || t.businessId === businessId)
    );
  };

  const calculateExpensesByCategory = (transactions: Transaction[]) => {
    const expensesByCategory: {[key: string]: number} = {};
    transactions.forEach(t => {
      if (t.amount > 0) {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };

  const calculateIncomeVsExpense = (transactions: Transaction[]) => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.amount < 0) {
        income += Math.abs(t.amount);
      } else {
        expense += t.amount;
      }
    });
    return [
      { name: 'Income', value: income },
      { name: 'Expense', value: expense }
    ];
  };

  const totalExpenses = expenseData.reduce((sum, item: any) => sum + item.value, 0);
  const largestCategory = expenseData.reduce((max: any, item: any) => item.value > max.value ? item : max, { name: 'N/A', value: 0 });
  const transactionCount = transactions.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>
      <div className="flex space-x-4 mb-4">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select business" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Businesses</SelectItem>
            {businesses.map((business) => (
              <SelectItem key={business.id} value={business.id}>
                {business.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Total Expenses: ${totalExpenses.toFixed(2)}</li>
              <li>Largest Category: {largestCategory.name} (${largestCategory.value.toFixed(2)})</li>
              <li>Number of Transactions: {transactionCount}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}