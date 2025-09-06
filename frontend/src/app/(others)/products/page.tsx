'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { productsApi, categoriesApi } from '@/lib/api/inventory';
import { Product, ProductFilters, TableState, ModalState, Category } from '@/types/inventory';
import { ProductForm } from './_components/ProductForm';
import { ProductFiltersComponent } from './_components/ProductFilters';

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableState, setTableState] = useState<TableState>({
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
    sort_by: 'name',
    sort_order: 'asc'
  });
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: 'create',
    selectedItem: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load products
  const loadProducts = async () => {
    setTableState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await productsApi.getProducts(filters);
      setProducts(response.data);
      setTableState(prev => ({
        ...prev,
        loading: false,
        total: response.total
      }));
    } catch (error: any) {
      setTableState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load products'
      }));
      toast({
        title: 'Error',
        description: error.message || 'Failed to load products',
        variant: 'destructive'
      });
    }
  };

  // Load categories for dropdowns
  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getCategories({ is_active: true });
      setCategories(response.data);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
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

  // Handle create product
  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      selectedItem: null
    });
  };

  // Handle edit product
  const handleEdit = (product: Product) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedItem: product
    });
  };

  // Handle view product
  const handleView = (product: Product) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      selectedItem: product
    });
  };

  // Handle delete product
  const handleDelete = async (product: Product) => {
    try {
      await productsApi.deleteProduct(product.id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  // Handle form submit
  const handleFormSubmit = async () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    await loadProducts();
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle sorting
  const handleSort = (column: string) => {
    const newOrder = filters.sort_by === column && filters.sort_order === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sort_by: column as any,
      sort_order: newOrder,
      page: 1
    }));
  };

  // Load data when filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(price));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find and filter products by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Search products by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <ProductFiltersComponent
              filters={filters}
              categories={categories}
              onFiltersChange={setFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({tableState.total})
          </CardTitle>
          <CardDescription>
            List of all products in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableState.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tableState.error ? (
            <div className="text-center py-8 text-destructive">
              {tableState.error}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      Product
                      {filters.sort_by === 'name' && (
                        <span className="ml-1">
                          {filters.sort_order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('sku')}
                    >
                      SKU
                      {filters.sort_by === 'sku' && (
                        <span className="ml-1">
                          {filters.sort_order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('unit_price')}
                    >
                      Price
                      {filters.sort_by === 'unit_price' && (
                        <span className="ml-1">
                          {filters.sort_order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      Created
                      {filters.sort_by === 'created_at' && (
                        <span className="ml-1">
                          {filters.sort_order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {product.sku}
                        </code>
                        {product.barcode && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {product.barcode}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline">
                            {product.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatPrice(product.unit_price)}
                          </div>
                          {product.cost_price && (
                            <div className="text-sm text-muted-foreground">
                              Cost: {formatPrice(product.cost_price)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          Min: {product.minimum_stock_level}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(product.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}" (SKU: {product.sku})? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product)}
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
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {tableState.total > filters.limit! && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, tableState.total)} of {tableState.total} products
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page === 1}
                      onClick={() => handlePageChange(filters.page! - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page! * filters.limit! >= tableState.total}
                      onClick={() => handlePageChange(filters.page! + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Form Modal */}
      <Dialog open={modalState.isOpen} onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalState.mode === 'create' && 'Create Product'}
              {modalState.mode === 'edit' && 'Edit Product'}
              {modalState.mode === 'view' && 'View Product'}
            </DialogTitle>
            <DialogDescription>
              {modalState.mode === 'create' && 'Add a new product to your inventory'}
              {modalState.mode === 'edit' && 'Update product information'}
              {modalState.mode === 'view' && 'Product details'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            mode={modalState.mode}
            product={modalState.selectedItem as Product | null}
            categories={categories}
            onSubmit={handleFormSubmit}
            onCancel={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}