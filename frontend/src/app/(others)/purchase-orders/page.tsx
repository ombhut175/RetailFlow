'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, ShoppingCart, TruckIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { purchaseOrdersApi } from '@/lib/api/purchase-orders';
import {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderTableState,
  PurchaseOrderModalState,
  PurchaseOrderStatus,
  PurchaseOrderStatsResponse
} from '@/types/purchase-orders';
import hackLog from '@/lib/logger';
import { PurchaseOrderFiltersComponent } from './_components/PurchaseOrderFilters';
import { PurchaseOrderForm } from './_components/PurchaseOrderForm';
import { PurchaseOrderDetails } from './_components/PurchaseOrderDetails';

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  
  // State management
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<PurchaseOrderStatsResponse | null>(null);
  const [tableState, setTableState] = useState<PurchaseOrderTableState>({
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [filters, setFilters] = useState<PurchaseOrderFilters>({
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [modalState, setModalState] = useState<PurchaseOrderModalState>({
    isOpen: false,
    mode: 'create',
    selectedItem: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Component mount logging
  useEffect(() => {
    hackLog.componentMount('PurchaseOrdersPage', {
      timestamp: new Date().toISOString(),
      initialFilters: filters
    });
  }, []);

  // Load purchase orders
  const loadPurchaseOrders = async () => {
    setTableState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      hackLog.dev('Loading purchase orders', { filters });
      const response = await purchaseOrdersApi.getPurchaseOrders(filters);
      
      // Ensure response.data is an array
      const ordersData = Array.isArray(response.data) ? response.data : [];
      
      setPurchaseOrders(ordersData);
      setTableState(prev => ({
        ...prev,
        loading: false,
        total: response.total || 0,
        page: response.page || 1
      }));

      hackLog.dev('Purchase orders loaded successfully', {
        count: ordersData.length,
        total: response.total || 0,
        page: response.page || 1
      });
    } catch (error: any) {
      hackLog.error('Failed to load purchase orders', {
        error: error.message,
        filters
      });
      
      // Reset to empty array on error
      setPurchaseOrders([]);
      setTableState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      toast({
        title: "Error loading purchase orders",
        description: error.message || "Failed to load purchase orders",
        variant: "destructive",
      });
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const statsData = await purchaseOrdersApi.getPurchaseOrderStats();
      setStats(statsData);
      hackLog.dev('Purchase order stats loaded', statsData);
    } catch (error: any) {
      hackLog.error('Failed to load purchase order stats', {
        error: error.message
      });
      
      // Set default stats on error to prevent undefined access
      setStats({
        totalOrders: 0,
        byStatus: {
          [PurchaseOrderStatus.PENDING]: 0,
          [PurchaseOrderStatus.CONFIRMED]: 0,
          [PurchaseOrderStatus.RECEIVED]: 0,
          [PurchaseOrderStatus.CANCELLED]: 0
        },
        totalValue: {
          amount: '0',
          currency: 'USD'
        },
        recentOrders: 0
      });
    }
  };

  // Initial data loading
  useEffect(() => {
    loadPurchaseOrders();
    loadStats();
  }, [filters]);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setFilters(prev => ({ ...prev, order_number: term, page: 1 }));
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.order_number;
        return { ...newFilters, page: 1 };
      });
    }
  };

  // Handle create/edit
  const handleCreateOrEdit = async (data: any) => {
    try {
      if (modalState.mode === 'create') {
        hackLog.formSubmit('createPurchaseOrder', {
          formData: data,
          component: 'PurchaseOrdersPage'
        });
        
        await purchaseOrdersApi.createPurchaseOrder(data);
        toast({
          title: "Success",
          description: "Purchase order created successfully",
        });
      } else if (modalState.mode === 'edit' && modalState.selectedItem) {
        hackLog.formSubmit('updatePurchaseOrder', {
          formData: data,
          orderId: modalState.selectedItem.id,
          component: 'PurchaseOrdersPage'
        });
        
        await purchaseOrdersApi.updatePurchaseOrder(modalState.selectedItem.id, data);
        toast({
          title: "Success",
          description: "Purchase order updated successfully",
        });
      }
      
      setModalState({ isOpen: false, mode: 'create', selectedItem: null });
      loadPurchaseOrders();
      loadStats();
    } catch (error: any) {
      hackLog.error('Failed to save purchase order', {
        error: error.message,
        mode: modalState.mode,
        data
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to save purchase order",
        variant: "destructive",
      });
    }
  };

  // Handle receive order
  const handleReceiveOrder = async (order: PurchaseOrder) => {
    try {
      hackLog.dev('Marking order as received', {
        orderId: order.id,
        orderNumber: order.order_number
      });
      
      await purchaseOrdersApi.receivePurchaseOrder(order.id);
      toast({
        title: "Success",
        description: `Order ${order.order_number} marked as received`,
      });
      
      loadPurchaseOrders();
      loadStats();
    } catch (error: any) {
      hackLog.error('Failed to receive purchase order', {
        error: error.message,
        orderId: order.id
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to receive order",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (order: PurchaseOrder) => {
    try {
      hackLog.dev('Deleting purchase order', {
        orderId: order.id,
        orderNumber: order.order_number
      });
      
      await purchaseOrdersApi.deletePurchaseOrder(order.id);
      toast({
        title: "Success",
        description: "Purchase order deleted successfully",
      });
      
      loadPurchaseOrders();
      loadStats();
    } catch (error: any) {
      hackLog.error('Failed to delete purchase order', {
        error: error.message,
        orderId: order.id
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to delete purchase order",
        variant: "destructive",
      });
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle filters
  const handleFiltersChange = (newFilters: PurchaseOrderFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: PurchaseOrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case PurchaseOrderStatus.PENDING:
        return "outline";
      case PurchaseOrderStatus.CONFIRMED:
        return "default";
      case PurchaseOrderStatus.RECEIVED:
        return "secondary";
      case PurchaseOrderStatus.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };

  // Format currency
  const formatCurrency = (amount: string | null): string => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground">
            Manage purchase orders and track supplier deliveries
          </p>
        </div>
        <Button 
          onClick={() => setModalState({ isOpen: true, mode: 'create', selectedItem: null })}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Purchase Order
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <TruckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byStatus?.[PurchaseOrderStatus.PENDING] || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Received Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byStatus?.[PurchaseOrderStatus.RECEIVED] || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <span className="text-xs text-muted-foreground">USD</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalValue?.amount || '0')}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Find purchase orders by order number, supplier, status, or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <PurchaseOrderFiltersComponent
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            {tableState.total > 0 ? (
              <>Showing {purchaseOrders.length} of {tableState.total} purchase orders</>
            ) : (
              'No purchase orders found'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tableState.loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tableState.error ? (
            <div className="text-center py-8 text-red-600">
              Error: {tableState.error}
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No purchase orders found. Create your first purchase order to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(purchaseOrders) && purchaseOrders.length > 0 ? (
                      purchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.supplier.name}</div>
                            {order.supplier.contact_person && (
                              <div className="text-sm text-muted-foreground">
                                {order.supplier.contact_person}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.order_date)}</TableCell>
                        <TableCell>{formatDate(order.expected_delivery_date)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setModalState({
                                isOpen: true,
                                mode: 'view',
                                selectedItem: order
                              })}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setModalState({
                                isOpen: true,
                                mode: 'edit',
                                selectedItem: order
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {order.status === PurchaseOrderStatus.CONFIRMED && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReceiveOrder(order)}
                                title="Mark as Received"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{order.order_number}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(order)}
                                    className="bg-red-600 hover:bg-red-700"
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
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {tableState.loading ? "Loading purchase orders..." : 
                           tableState.error ? "Error loading purchase orders. Please try again." :
                           "No purchase orders found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {tableState.total > tableState.limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((tableState.page - 1) * tableState.limit) + 1} to {Math.min(tableState.page * tableState.limit, tableState.total)} of {tableState.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(tableState.page - 1)}
                      disabled={tableState.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {tableState.page} of {Math.ceil(tableState.total / tableState.limit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(tableState.page + 1)}
                      disabled={tableState.page >= Math.ceil(tableState.total / tableState.limit)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalState.isOpen && modalState.mode !== 'view'} onOpenChange={(open) => {
        if (!open) {
          setModalState({ isOpen: false, mode: 'create', selectedItem: null });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalState.mode === 'create' ? 'Create Purchase Order' : 'Edit Purchase Order'}
            </DialogTitle>
            <DialogDescription>
              {modalState.mode === 'create'
                ? 'Create a new purchase order for supplier deliveries.'
                : 'Update the purchase order details.'
              }
            </DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm
            initialData={modalState.selectedItem}
            onSubmit={handleCreateOrEdit}
            onCancel={() => setModalState({ isOpen: false, mode: 'create', selectedItem: null })}
          />
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={modalState.isOpen && modalState.mode === 'view'} onOpenChange={(open) => {
        if (!open) {
          setModalState({ isOpen: false, mode: 'create', selectedItem: null });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              View purchase order information and items.
            </DialogDescription>
          </DialogHeader>
          {modalState.selectedItem && (
            <PurchaseOrderDetails
              purchaseOrder={modalState.selectedItem}
              onEdit={() => setModalState(prev => ({ ...prev, mode: 'edit' }))}
              onReceive={handleReceiveOrder}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
