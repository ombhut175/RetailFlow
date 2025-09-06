'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { stockApi } from '@/lib/api/stock';
import { 
  StockResponse, 
  StockFilters, 
  StockTableState, 
  StockModalState 
} from '@/types/stock';
import { StockForm } from './_components/StockForm';
import hackLog from '@/lib/logger';
import { StockFiltersComponent } from './_components/StockFilters';
import { StockReservationForm } from './_components/StockReservationForm';
import { StockAdjustmentForm } from './_components/StockAdjustmentForm';

export default function StockPage() {
  const { toast } = useToast();
  const [stock, setStock] = useState<StockResponse[]>([]);
  const [tableState, setTableState] = useState<StockTableState>({
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    sortBy: 'product_name',
    sortOrder: 'asc'
  });
  const [filters, setFilters] = useState<StockFilters>({
    page: 1,
    limit: 10,
    sort_by: 'product_name',
    sort_order: 'asc'
  });
  const [modalState, setModalState] = useState<StockModalState>({
    isOpen: false,
    mode: 'create',
    selectedItem: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load stock data
  const loadStock = async () => {
    setTableState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      hackLog.apiRequest('GET', '/api/stock', {
        filters,
        component: 'StockPage',
        action: 'loadStock'
      });

      const response = await stockApi.getStock(filters);
      setStock(response.data);
      setTableState(prev => ({
        ...prev,
        loading: false,
        total: response.total
      }));

      hackLog.apiSuccess('GET', '/api/stock', {
        count: response.data.length,
        total: response.total
      });
    } catch (error: any) {
      hackLog.apiError('GET', '/api/stock', {
        error: error.message,
        filters
      });

      setTableState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load stock data'
      }));
      toast({
        title: 'Error',
        description: error.message || 'Failed to load stock data',
        variant: 'destructive'
      });
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

  // Handle create stock
  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      selectedItem: null
    });
  };

  // Handle edit stock
  const handleEdit = (stockItem: StockResponse) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedItem: stockItem
    });
  };

  // Handle view stock details
  const handleView = (stockItem: StockResponse) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      selectedItem: stockItem
    });
  };

  // Handle adjust stock
  const handleAdjust = (stockItem: StockResponse) => {
    setModalState({
      isOpen: true,
      mode: 'adjust',
      selectedItem: stockItem
    });
  };

  // Handle reserve stock
  const handleReserve = (stockItem: StockResponse) => {
    setModalState({
      isOpen: true,
      mode: 'reserve',
      selectedItem: stockItem
    });
  };

  // Handle release stock
  const handleRelease = (stockItem: StockResponse) => {
    setModalState({
      isOpen: true,
      mode: 'release',
      selectedItem: stockItem
    });
  };

  // Handle delete stock
  const handleDelete = async (stockItem: StockResponse) => {
    try {
      hackLog.apiRequest('DELETE', `/api/stock/product/${stockItem.product_id}`, {
        productId: stockItem.product_id,
        component: 'StockPage'
      });

      await stockApi.deleteStock(stockItem.product_id);
      
      hackLog.apiSuccess('DELETE', `/api/stock/product/${stockItem.product_id}`, {
        productId: stockItem.product_id
      });

      toast({
        title: 'Success',
        description: 'Stock entry deleted successfully'
      });
      
      loadStock();
    } catch (error: any) {
      hackLog.apiError('DELETE', `/api/stock/product/${stockItem.product_id}`, {
        error: error.message,
        productId: stockItem.product_id
      });

      toast({
        title: 'Error',
        description: error.message || 'Failed to delete stock entry',
        variant: 'destructive'
      });
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setModalState({ isOpen: false, mode: 'create', selectedItem: null });
    loadStock();
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

  // Get stock status badge
  const getStockStatusBadge = (stockItem: StockResponse) => {
    const available = stockItem.quantity_available;
    const reserved = stockItem.quantity_reserved;
    const total = stockItem.quantity_total;

    if (available === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (available <= 10) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else if (reserved > 0) {
      return <Badge variant="outline">Reserved</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    loadStock();
  }, [filters]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">
            Manage inventory levels, track stock movements, and monitor availability
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tableState.total}</div>
            <p className="text-xs text-muted-foreground">
              Products in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stock.reduce((sum, item) => sum + item.quantity_available, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Units available for sale
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stock.reduce((sum, item) => sum + item.quantity_reserved, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Units reserved for orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stock.filter(item => item.quantity_available <= 10).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items needing restock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Inventory</CardTitle>
          <CardDescription>
            View and manage stock levels for all products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search products..."
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
            <StockFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Stock Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('quantity_available')}
                  >
                    Available
                    {filters.sort_by === 'quantity_available' && (
                      <span className="ml-1">
                        {filters.sort_order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('quantity_reserved')}
                  >
                    Reserved
                    {filters.sort_by === 'quantity_reserved' && (
                      <span className="ml-1">
                        {filters.sort_order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('updated_at')}
                  >
                    Last Updated
                    {filters.sort_by === 'updated_at' && (
                      <span className="ml-1">
                        {filters.sort_order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableState.loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading stock data...
                    </TableCell>
                  </TableRow>
                ) : tableState.error ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-destructive">
                      {tableState.error}
                    </TableCell>
                  </TableRow>
                ) : stock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No stock data found
                    </TableCell>
                  </TableRow>
                ) : (
                  stock.map((stockItem) => (
                    <TableRow key={stockItem.id}>
                      <TableCell className="font-medium">
                        {stockItem.product.name}
                      </TableCell>
                      <TableCell>{stockItem.product.sku}</TableCell>
                      <TableCell>{stockItem.product.category_name || 'N/A'}</TableCell>
                      <TableCell>{stockItem.quantity_available}</TableCell>
                      <TableCell>{stockItem.quantity_reserved}</TableCell>
                      <TableCell>{stockItem.quantity_total}</TableCell>
                      <TableCell>{getStockStatusBadge(stockItem)}</TableCell>
                      <TableCell>
                        {new Date(stockItem.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(stockItem)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(stockItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAdjust(stockItem)}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReserve(stockItem)}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Stock Entry</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the stock entry for "{stockItem.product.name}"? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(stockItem)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {tableState.total > filters.limit! && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, tableState.total)} of {tableState.total} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {filters.page} of {Math.ceil(tableState.total / filters.limit!)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page! >= Math.ceil(tableState.total / filters.limit!)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Dialog open={modalState.isOpen} onOpenChange={(open) => 
        setModalState(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modalState.mode === 'create' && 'Add New Stock'}
              {modalState.mode === 'edit' && 'Edit Stock'}
              {modalState.mode === 'view' && 'Stock Details'}
              {modalState.mode === 'adjust' && 'Adjust Stock'}
              {modalState.mode === 'reserve' && 'Reserve Stock'}
              {modalState.mode === 'release' && 'Release Stock'}
            </DialogTitle>
            <DialogDescription>
              {modalState.mode === 'create' && 'Create a new stock entry for a product'}
              {modalState.mode === 'edit' && 'Update stock quantities and information'}
              {modalState.mode === 'view' && 'View detailed stock information'}
              {modalState.mode === 'adjust' && 'Increase or decrease stock quantity'}
              {modalState.mode === 'reserve' && 'Reserve stock for orders'}
              {modalState.mode === 'release' && 'Release reserved stock back to available'}
            </DialogDescription>
          </DialogHeader>
          
          {(modalState.mode === 'create' || modalState.mode === 'edit' || modalState.mode === 'view') && (
            <StockForm
              mode={modalState.mode}
              stockItem={modalState.selectedItem}
              onSuccess={handleFormSuccess}
              onCancel={() => setModalState({ isOpen: false, mode: 'create', selectedItem: null })}
            />
          )}
          
          {modalState.mode === 'adjust' && modalState.selectedItem && (
            <StockAdjustmentForm
              stockItem={modalState.selectedItem}
              onSuccess={handleFormSuccess}
              onCancel={() => setModalState({ isOpen: false, mode: 'create', selectedItem: null })}
            />
          )}
          
          {(modalState.mode === 'reserve' || modalState.mode === 'release') && modalState.selectedItem && (
            <StockReservationForm
              mode={modalState.mode}
              stockItem={modalState.selectedItem}
              onSuccess={handleFormSuccess}
              onCancel={() => setModalState({ isOpen: false, mode: 'create', selectedItem: null })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}