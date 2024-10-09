import { create } from 'zustand';

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  cardMember: string;
  accountNumber: string;
  businessId: string;
}

export interface Business {
  id: string;
  name: string;
}

interface TransactionStore {
  transactions: Transaction[];
  businesses: Business[];
  setTransactions: (transactions: Transaction[]) => void;
  updateTransaction: (id: number, updates: Partial<Transaction>) => void;
  addBusiness: (business: Business) => void;
  removeBusiness: (id: string) => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  businesses: [{ id: 'default', name: 'Default Business' }],
  setTransactions: (transactions) => set({ transactions }),
  updateTransaction: (id, updates) => set((state) => ({
    transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  addBusiness: (business) => set((state) => ({
    businesses: [...state.businesses, business]
  })),
  removeBusiness: (id) => set((state) => ({
    businesses: state.businesses.filter(b => b.id !== id)
  })),
}));