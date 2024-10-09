"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Home, ArrowUpDown, Plus } from 'lucide-react';
import { useTransactionStore, Transaction } from '@/lib/store';
import { getAISuggestions } from '@/lib/aiService';
import toast, { Toaster } from 'react-hot-toast';

export default function TransactionsPage() {
  const { transactions, setTransactions, businesses, addBusiness } = useTransactionStore();
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedBusiness, setSelectedBusiness] = useState('all');
  const [newBusinessName, setNewBusinessName] = useState('');

  useEffect(() => {
    if (transactions.length === 0) {
      // Uncomment the next line to redirect
      // router.push('/import');
    }
  }, [transactions]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleCategoryChange = async (id: number, category: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      const suggestions = await getAISuggestions(transaction.description, transaction.amount);
      const aiCategory = suggestions[0]?.category;
      
      if (aiCategory && aiCategory !== category) {
        const similarTransactions = transactions.filter(t => 
          t.description.toLowerCase().includes(transaction.description.toLowerCase()) &&
          t.category !== category
        );
        
        if (similarTransactions.length > 0) {
          toast((t) => (
            <span>
              Update {similarTransactions.length} similar transaction(s) to "{category}"?
              <Button size="sm" onClick={() => {
                const updatedTransactions = transactions.map(t => 
                  similarTransactions.some(st => st.id === t.id) ? { ...t, category } : t
                );
                setTransactions(updatedTransactions);
                toast.dismiss(t.id);
              }}>
                Yes
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>
                No
              </Button>
            </span>
          ), { duration: 5000 });
        }
      }
    }
    
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...t, category } : t
    );
    setTransactions(updatedTransactions);
  };

  const handleBusinessChange = (id: number, businessId: string) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id ? { ...t, businessId } : t
    );
    setTransactions(updatedTransactions);
  };

  const handleSort = (key: keyof Transaction) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleAddBusiness = () => {
    if (newBusinessName.trim()) {
      const newBusiness = { id: Date.now().toString(), name: newBusinessName.trim() };
      addBusiness(newBusiness);
      setNewBusinessName('');
      toast.success(`Added new business: ${newBusiness.name}`);
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredTransactions = sortedTransactions.filter(t => 
    (t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())) &&
    (selectedBusiness === 'all' || t.businessId === selectedBusiness)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" /> Dashboard
          </Button>
        </Link>
      </div>
      <div className="flex space-x-4 mb-4">
        <Input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={handleSearch}
          className="flex-grow"
        />
        <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
          <SelectTrigger className="w-[200px]">
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
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Business
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Business</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Business name"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
              />
              <Button onClick={handleAddBusiness}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                Date {sortConfig.key === 'date' && <ArrowUpDown className="inline ml-2 h-4 w-4" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('description')}>
                Description {sortConfig.key === 'description' && <ArrowUpDown className="inline ml-2 h-4 w-4" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                Amount {sortConfig.key === 'amount' && <ArrowUpDown className="inline ml-2 h-4 w-4" />}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Card Member</TableHead>
              <TableHead>Account #</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    value={transaction.category}
                    onValueChange={(value) => handleCategoryChange(transaction.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Advertising">Advertising</SelectItem>
                      <SelectItem value="Payment">Payment</SelectItem>
                      <SelectItem value="Hosting">Hosting</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={transaction.businessId}
                    onValueChange={(value) => handleBusinessChange(transaction.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{transaction.cardMember}</TableCell>
                <TableCell>{transaction.accountNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}