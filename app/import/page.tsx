"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, AlertCircle, BarChart3, Home } from 'lucide-react';
import { useTransactionStore, Transaction } from '@/lib/store';
import Papa from 'papaparse';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTransactions } = useTransactionStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import.');
      return;
    }

    setImporting(true);
    setError(null);

    Papa.parse(file, {
      complete: (results) => {
        const parsedTransactions: Transaction[] = results.data
          .slice(1) // Skip header row
          .map((row: string[], index: number) => ({
            id: index,
            date: row[0],
            description: row[2],
            cardMember: row[3],
            accountNumber: row[4],
            amount: parseFloat(row[5]),
            category: 'Uncategorized', // Default category
          }));

        setTransactions(parsedTransactions);
        setImporting(false);
        setImportSuccess(true);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setImporting(false);
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Import Transactions</h1>
      <div className="max-w-md mx-auto">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4"
        />
        <Button
          onClick={handleImport}
          disabled={!file || importing}
          className="w-full mb-4"
        >
          {importing ? 'Importing...' : 'Import CSV'}
          <Upload className="ml-2 h-4 w-4" />
        </Button>
        {importSuccess && (
          <>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your transactions have been successfully imported.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-4 mb-4">
              <Link href="/transactions" className="flex-1">
                <Button className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" /> View Transactions
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" /> Dashboard
                </Button>
              </Link>
            </div>
          </>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}