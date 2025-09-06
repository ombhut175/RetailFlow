'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  PurchaseOrderFormData,
  PurchaseOrderItemFormData,
  PurchaseOrderFormErrors,
  PurchaseOrderItemFormErrors,
  PurchaseOrderStatus
} from '@/types/purchase-orders';
import { productsApi } from '@/lib/api/inventory';
import { suppliersApi } from '@/lib/api/suppliers';
import { Product } from '@/types/inventory';
import { Supplier } from '@/types/suppliers';
import hackLog from '@/lib/logger';

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder | null;
  onSubmit: (data: CreatePurchaseOrderRequest) => void;
  onCancel: () => void;
}

// Mock suppliers data - Replace with real API call
const mockSuppliers = [
  { id: '1', name: 'Tech Supplies Co.', contact_person: 'John Smith', email: 'john@techsupplies.com' },
  { id: '2', name: 'Office Solutions Ltd.', contact_person: 'Jane Doe', email: 'jane@officesolutions.com' },
  { id: '3', name: 'Industrial Parts Inc.', contact_person: 'Mike Johnson', email: 'mike@industrialparts.com' }
];

export function PurchaseOrderForm({ 
  initialData, 
  onSubmit, 
  onCancel 
}: PurchaseOrderFormProps) {
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    supplier_id: '',
    order_number: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: []
  });

  const [errors, setErrors] = useState<PurchaseOrderFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Component mount logging
  useEffect(() => {
    hackLog.componentMount('PurchaseOrderForm', {
      mode: initialData ? 'edit' : 'create',
      orderId: initialData?.id,
      timestamp: new Date().toISOString()
    });
  }, [initialData]);

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        supplier_id: initialData.supplier.id,
        order_number: initialData.order_number,
        order_date: initialData.order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: initialData.expected_delivery_date || '',
        notes: initialData.notes || '',
        items: initialData.items?.map(item => ({
          id: item.id,
          product_id: item.product.id,
          quantity_ordered: item.quantity_ordered,
          quantity_received: item.quantity_received,
          unit_cost: parseFloat(item.unit_cost),
          total_cost: parseFloat(item.total_cost)
        })) || []
      });
    } else {
      // Generate order number for new orders
      const orderNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData(prev => ({ ...prev, order_number: orderNumber }));
    }
  }, [initialData]);

  // Load products
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await productsApi.getProducts({ is_active: true, limit: 100 });
      setProducts(response.data);
      hackLog.dev('Products loaded for purchase order form', {
        count: response.data.length
      });
    } catch (error: any) {
      hackLog.error('Failed to load products', {
        error: error.message,
        component: 'PurchaseOrderForm'
      });
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: PurchaseOrderFormErrors = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }

    if (!formData.order_number.trim()) {
      newErrors.order_number = 'Order number is required';
    }

    if (!formData.order_date) {
      newErrors.order_date = 'Order date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = [];
      toast({
        title: "Validation Error",
        description: "At least one item is required",
        variant: "destructive",
      });
    }

    // Validate items
    const itemErrors: PurchaseOrderItemFormErrors[] = [];
    formData.items.forEach((item, index) => {
      const itemError: PurchaseOrderItemFormErrors = {};

      if (!item.product_id) {
        itemError.product_id = 'Product is required';
      }

      if (item.quantity_ordered <= 0) {
        itemError.quantity_ordered = 'Quantity must be greater than 0';
      }

      if (item.unit_cost <= 0) {
        itemError.unit_cost = 'Unit cost must be greater than 0';
      }

      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });

    if (itemErrors.length > 0) {
      newErrors.items = itemErrors;
    }

    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    
    if (!isValid) {
      hackLog.formValidation('PurchaseOrderForm', {
        errors: newErrors,
        component: 'PurchaseOrderForm'
      });
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      hackLog.formSubmit('PurchaseOrderForm', {
        formData,
        mode: initialData ? 'edit' : 'create',
        itemsCount: formData.items.length
      });

      const submitData: CreatePurchaseOrderRequest = {
        supplier_id: formData.supplier_id,
        order_number: formData.order_number,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || undefined,
        notes: formData.notes || undefined,
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          quantity_received: item.quantity_received || 0,
          unit_cost: item.unit_cost,
          total_cost: item.total_cost
        }))
      };

      onSubmit(submitData);
    } catch (error: any) {
      hackLog.error('Form submission failed', {
        error: error.message,
        component: 'PurchaseOrderForm'
      });
      
      toast({
        title: "Error",
        description: error.message || "Failed to save purchase order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding new item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product_id: '',
          quantity_ordered: 1,
          quantity_received: 0,
          unit_cost: 0,
          total_cost: 0
        }
      ]
    }));

    hackLog.dev('Added new item to purchase order', {
      itemsCount: formData.items.length + 1,
      component: 'PurchaseOrderForm'
    });
  };

  // Handle removing item
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));

    // Clear item errors
    if (errors.items && errors.items[index]) {
      const newItemErrors = [...(errors.items || [])];
      newItemErrors.splice(index, 1);
      setErrors(prev => ({ ...prev, items: newItemErrors.length > 0 ? newItemErrors : undefined }));
    }

    hackLog.dev('Removed item from purchase order', {
      itemIndex: index,
      remainingCount: formData.items.length - 1,
      component: 'PurchaseOrderForm'
    });
  };

  // Handle item updates
  const updateItem = (index: number, field: keyof PurchaseOrderItemFormData, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const updatedItem = { ...newItems[index] };

      if (field === 'product_id' && value) {
        // Auto-populate unit cost from product data
        const selectedProduct = products.find(p => p.id === value);
        if (selectedProduct) {
          updatedItem.unit_cost = parseFloat(selectedProduct.unit_price);
        }
      }

      // Type-safe assignment
      (updatedItem as any)[field] = value;

      // Recalculate total cost
      if (field === 'quantity_ordered' || field === 'unit_cost') {
        updatedItem.total_cost = updatedItem.quantity_ordered * updatedItem.unit_cost;
      }

      newItems[index] = updatedItem;

      return { ...prev, items: newItems };
    });

    // Clear specific item error - only check fields that exist in errors
    if (errors.items && errors.items[index] && field !== 'id') {
      const errorField = field as keyof PurchaseOrderItemFormErrors;
      const newItemErrors = [...(errors.items || [])];
      if (newItemErrors[index] && newItemErrors[index][errorField]) {
        const itemError = { ...newItemErrors[index] };
        delete itemError[errorField];
        newItemErrors[index] = itemError;
        if (Object.keys(newItemErrors[index]).length === 0) {
          delete newItemErrors[index];
        }
        setErrors(prev => ({ ...prev, items: newItemErrors }));
      }
    }
  };

  // Calculate total amount
  const calculateTotal = (): number => {
    return formData.items.reduce((total, item) => total + item.total_cost, 0);
  };

  // Get product name by ID
  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.sku})` : '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="supplier_id">Supplier *</Label>
            <Select
              value={formData.supplier_id}
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, supplier_id: value }));
                if (errors.supplier_id) {
                  setErrors(prev => ({ ...prev, supplier_id: undefined }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {mockSuppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.supplier_id && (
              <p className="text-sm text-red-600">{errors.supplier_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_number">Order Number *</Label>
            <Input
              id="order_number"
              value={formData.order_number}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, order_number: e.target.value }));
                if (errors.order_number) {
                  setErrors(prev => ({ ...prev, order_number: undefined }));
                }
              }}
              placeholder="e.g., PO-2024-001"
            />
            {errors.order_number && (
              <p className="text-sm text-red-600">{errors.order_number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_date">Order Date *</Label>
            <Input
              id="order_date"
              type="date"
              value={formData.order_date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, order_date: e.target.value }));
                if (errors.order_date) {
                  setErrors(prev => ({ ...prev, order_date: undefined }));
                }
              }}
            />
            {errors.order_date && (
              <p className="text-sm text-red-600">{errors.order_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_delivery_date">Expected Delivery Date</Label>
            <Input
              id="expected_delivery_date"
              type="date"
              value={formData.expected_delivery_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or special instructions..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Order Items
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product *</TableHead>
                      <TableHead className="w-[120px]">Qty Ordered *</TableHead>
                      {initialData && <TableHead className="w-[120px]">Qty Received</TableHead>}
                      <TableHead className="w-[120px]">Unit Cost *</TableHead>
                      <TableHead className="w-[120px]">Total Cost</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select
                            value={item.product_id}
                            onValueChange={(value) => updateItem(index, 'product_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingProducts ? (
                                <SelectItem value="" disabled>Loading products...</SelectItem>
                              ) : (
                                products.map(product => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {errors.items && errors.items[index]?.product_id && (
                            <p className="text-sm text-red-600 mt-1">{errors.items[index].product_id}</p>
                          )}
                        </TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity_ordered}
                            onChange={(e) => updateItem(index, 'quantity_ordered', parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                          {errors.items && errors.items[index]?.quantity_ordered && (
                            <p className="text-sm text-red-600 mt-1">{errors.items[index].quantity_ordered}</p>
                          )}
                        </TableCell>

                        {initialData && (
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity_received}
                              onChange={(e) => updateItem(index, 'quantity_received', parseInt(e.target.value) || 0)}
                              className="w-full"
                            />
                          </TableCell>
                        )}

                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_cost}
                            onChange={(e) => updateItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                            className="w-full"
                          />
                          {errors.items && errors.items[index]?.unit_cost && (
                            <p className="text-sm text-red-600 mt-1">{errors.items[index].unit_cost}</p>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              ${item.total_cost.toFixed(2)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => updateItem(index, 'total_cost', item.quantity_ordered * item.unit_cost)}
                              className="h-6 w-6 p-0"
                              title="Recalculate"
                            >
                              <Calculator className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-bold">
                    Total: ${calculateTotal().toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formData.items.length} item{formData.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Update Order' : 'Create Order')}
        </Button>
      </div>
    </form>
  );
}
