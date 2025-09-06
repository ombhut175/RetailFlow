'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { categoriesApi } from '@/lib/api/inventory';
import { Category, CategoryFilters, TableState, ModalState } from '@/types/inventory';
import { CategoryForm } from './_components/CategoryForm';
import { CategoryFiltersComponent } from './_components/CategoryFilters';

export default function CategoriesPage() {
  const { toast } = useToast();
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
  const [filters, setFilters] = useState<CategoryFilters>({
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

  // Load categories
  const loadCategories = async () => {
    setTableState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await categoriesApi.getCategories(filters);
      // Ensure response.data is an array before setting state
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
      setTableState(prev => ({
        ...prev,
        loading: false,
        total: response.total || 0
      }));
    } catch (error: any) {
      console.error('Categories API Error:', error);
      // Set empty array on error to prevent map error
      setCategories([]);
      setTableState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load categories'
      }));
      toast({
        title: 'Error',
        description: error.message || 'Failed to load categories',
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

  // Handle create category
  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      selectedItem: null
    });
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedItem: category
    });
  };

  // Handle view category
  const handleView = (category: Category) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      selectedItem: category
    });
  };

  // Handle delete category
  const handleDelete = async (category: Category) => {
    try {
      await categoriesApi.deleteCategory(category.id);
      toast({
        title: 'Success',
        description: 'Category deleted successfully'
      });
      loadCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  // Handle form submit
  const handleFormSubmit = async () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    await loadCategories();
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

  // Load categories when filters change
  useEffect(() => {
    loadCategories();
  }, [filters]);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your product categories
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find and filter categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <CategoryFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories ({tableState.total})</CardTitle>
          <CardDescription>
            List of all categories in your system
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
                      Name
                      {filters.sort_by === 'name' && (
                        <span className="ml-1">
                          {filters.sort_order === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </TableHead>
                    <TableHead>Description</TableHead>
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
                  {(categories || []).map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        {category.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(category.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(category)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
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
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category)}
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
                    Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, tableState.total)} of {tableState.total} categories
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

      {/* Category Form Modal */}
      <Dialog open={modalState.isOpen} onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalState.mode === 'create' && 'Create Category'}
              {modalState.mode === 'edit' && 'Edit Category'}
              {modalState.mode === 'view' && 'View Category'}
            </DialogTitle>
            <DialogDescription>
              {modalState.mode === 'create' && 'Add a new category to your system'}
              {modalState.mode === 'edit' && 'Update category information'}
              {modalState.mode === 'view' && 'Category details'}
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            mode={modalState.mode}
            category={modalState.selectedItem as Category | null}
            onSubmit={handleFormSubmit}
            onCancel={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}