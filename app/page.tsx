import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">ExpenseTrack Pro</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Transactions</CardTitle>
            <CardDescription>Upload your CSV files to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/import">
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>View Transactions</CardTitle>
            <CardDescription>Manage and categorize your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/transactions">
              <Button className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" /> View Transactions
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Gain insights from your expense data</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics">
              <Button className="w-full">
                <PieChart className="mr-2 h-4 w-4" /> View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}