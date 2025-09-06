'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, TrendingUp, TrendingDown, Package, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { stockTransactionsApi } from '@/lib/api/stock';
import { 
  StockTransactionResponse, 
  StockTransactionFilters, 
  StockTransactionType 
} from '@/types/stock';
import hackLog from '@/lib/logger';

export default function StockTransactionsPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<StockTransactionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransactionResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<StockTransactionFilters>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Load transactions
  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      hackLog.apiRequest('GET', '/api/stock/transactions', {
        filters,
        component: 'StockTransactionsPage',
        action: 'loadTransactions'
      });

      const response = await stockTransactionsApi.getTransactions(filters);
      setTransactions(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total
      });

      hackLog.apiSuccess('GET', '/api/stock/transactions', {
        count: response.data.length,
        total: response.total
      });
    } catch (error: any) {
      hackLog.apiError('GET', '/api/stock/transactions', {
        error: error.message,
        filters
      });

      setError(error.message || 'Failed to load transactions');
      toast({
        title: 'Error',
        description: error.message || 'Failed to load transactions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof StockTransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle sorting
  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: sortBy as any,
      sort_order: prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1
    }));
  };

  // View transaction details
  const handleViewDetails = (transaction: StockTransactionResponse) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  // Get transaction type icon and color
  const getTransactionTypeDisplay = (type: StockTransactionType) => {
    switch (type) {
      case StockTransactionType.IN:
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          label: 'Stock In',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
      case StockTransactionType.OUT:
        return {
          icon: <TrendingDown className="h-4 w-4" />,
          label: 'Stock Out',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
      case StockTransactionType.ADJUSTMENT:
        return {
          icon: <Package className="h-4 w-4" />,
          label: 'Adjustment',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200'
        };
      case StockTransactionType.RESERVED:
        return {
          icon: <Package className="h-4 w-4" />,
          label: 'Reserved',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 border-orange-200'
        };
      case StockTransactionType.RELEASED:
        return {
          icon: <Package className="h-4 w-4" />,
          label: 'Released',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200'
        };
      default:
        return {
          icon: <Package className="h-4 w-4" />,
          label: type,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200'
        };
    }
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    loadTransactions();
  }, [filters]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Transactions</h1>
          <p className="text-muted-foreground">
            View detailed history of all stock movements and adjustments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock In</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.transaction_type === StockTransactionType.IN).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Inbound transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.transaction_type === StockTransactionType.OUT).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Outbound transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {transactions.filter(t => t.transaction_type === StockTransactionType.ADJUSTMENT).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Manual adjustments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Complete log of all stock movements and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="max-w-sm"
                />
                <Button onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Transaction Type Filter */}
            <Select
              value={filters.transaction_type || ''}
              onValueChange={(value) => handleFilterChange('transaction_type', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value={StockTransactionType.IN}>Stock In</SelectItem>
                <SelectItem value={StockTransactionType.OUT}>Stock Out</SelectItem>
                <SelectItem value={StockTransactionType.ADJUSTMENT}>Adjustment</SelectItem>
                <SelectItem value={StockTransactionType.RESERVED}>Reserved</SelectItem>
                <SelectItem value={StockTransactionType.RELEASED}>Released</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select
              value={filters.date_from || ''}
              onValueChange={(value) => handleFilterChange('date_from', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_90_days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('created_at')}
                  >
                    Date & Time
                    {filters.sort_by === 'created_at' && (
                      <span className="ml-1">
                        {filters.sort_order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('product_name')}
                  >
                    Product
                    {filters.sort_by === 'product_name' && (
                      <span className="ml-1">
                        {filters.sort_order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('quantity')}
                  >
                    Quantity
                    {filters.sort_by === 'quantity' && (
                      <span className="ml-1">
                        {filters.sort_order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => {
                    const typeDisplay = getTransactionTypeDisplay(transaction.transaction_type);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(transaction.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${typeDisplay.color} ${typeDisplay.bgColor}`}
                          >
                            <div className="flex items-center gap-1">
                              {typeDisplay.icon}
                              {typeDisplay.label}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {transaction.product.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-medium ${
                            transaction.transaction_type === StockTransactionType.IN ? 'text-green-600' :
                            transaction.transaction_type === StockTransactionType.OUT ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {transaction.transaction_type === StockTransactionType.IN ? '+' : 
                              transaction.transaction_type === StockTransactionType.OUT ? '-' : '±'}
                            {transaction.quantity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-32 truncate" title={transaction.reason}>
                            {transaction.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.reference_id && (
                             <div className="max-w-32 truncate" title={transaction.reference_id}>
                               {transaction.reference_id}
                             </div>
                           )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {transaction.created_by || 'System'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this stock transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getTransactionTypeDisplay(selectedTransaction.transaction_type).icon}
                {getTransactionTypeDisplay(selectedTransaction.transaction_type).label}
                  </CardTitle>
                  <CardDescription>
                    Transaction ID: {selectedTransaction.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Date & Time</Label>
                      <p className="text-sm">
                        {new Date(selectedTransaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">User</Label>
                      <p className="text-sm">{selectedTransaction.created_by || 'System'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Product</Label>
                      <p className="text-sm font-medium">{selectedTransaction.product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {selectedTransaction.product.sku}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Quantity</Label>
                      <p className={`text-sm font-medium ${
                        selectedTransaction.transaction_type === StockTransactionType.IN ? 'text-green-600' :
                        selectedTransaction.transaction_type === StockTransactionType.OUT ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {selectedTransaction.transaction_type === StockTransactionType.IN ? '+' : 
                         selectedTransaction.transaction_type === StockTransactionType.OUT ? '-' : '±'}
                        {selectedTransaction.quantity} units
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Reason</Label>
                      <p className="text-sm">{selectedTransaction.reason}</p>
                    </div>
                    {selectedTransaction.reference_id && (
                      <div>
                        <Label className="text-sm font-medium">Reference</Label>
                        <p className="text-sm">{selectedTransaction.reference_id}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedTransaction.notes && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Notes</Label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                        {selectedTransaction.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}