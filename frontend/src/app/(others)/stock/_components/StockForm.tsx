'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stockApi } from '@/lib/api/stock';
import { productsApi } from '@/lib/api/inventory';
import { 
  StockResponse, 
  CreateStockRequest, 
  UpdateStockRequest,
  StockFormData 
} from '@/types/stock';
import { Product } from '@/types/inventory';
import hackLog from '@/lib/logger';

interface StockFormProps {
  mode: 'create' | 'edit' | 'view';
  stockItem?: StockResponse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StockForm({ mode, stockItem, onSuccess, onCancel }: StockFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<StockFormData>({
    product_id: '',
    quantity_available: 0,
    quantity_reserved: 0,
    minimum_stock_level: 0,
    maximum_stock_level: 0,
    reorder_point: 0,
    location: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load products for selection
  const loadProducts = async () => {
    try {
      hackLog.apiRequest('GET', '/api/products', {
        component: 'StockForm',
        action: 'loadProducts'
      });

      const response = await productsApi.getProducts({ limit: 1000 });
      setProducts(response.data);

      hackLog.apiSuccess('GET', '/api/products', {
        count: response.data.length
      });
    } catch (error: any) {
      hackLog.apiError('GET', '/api/products', {
        error: error.message
      });

      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    }
  };

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      if (stockItem) {
        setFormData({
          product_id: stockItem.product_id,
          quantity_available: stockItem.quantity_available,
          quantity_reserved: stockItem.quantity_reserved,
          minimum_stock_level: stockItem.minimum_stock_level || 0,
          maximum_stock_level: stockItem.maximum_stock_level || 0,
          reorder_point: stockItem.reorder_point || 0,
          location: stockItem.location || '',
          notes: stockItem.notes || ''
        });
      }
    }
    loadProducts();
  }, [mode, stockItem]);

  // Handle form field changes
  const handleChange = (field: keyof StockFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id) {
      newErrors.product_id = 'Product is required';
    }

    if (formData.quantity_available < 0) {
      newErrors.quantity_available = 'Available quantity cannot be negative';
    }

    if (formData.quantity_reserved < 0) {
      newErrors.quantity_reserved = 'Reserved quantity cannot be negative';
    }

    if (formData.minimum_stock_level !== undefined && formData.minimum_stock_level < 0) {
      newErrors.minimum_stock_level = 'Minimum stock level cannot be negative';
    }

    if (formData.maximum_stock_level !== undefined && formData.maximum_stock_level < 0) {
      newErrors.maximum_stock_level = 'Maximum stock level cannot be negative';
    }

    if (formData.maximum_stock_level !== undefined && formData.minimum_stock_level !== undefined && 
        formData.maximum_stock_level > 0 && formData.minimum_stock_level > formData.maximum_stock_level) {
      newErrors.minimum_stock_level = 'Minimum stock level cannot be greater than maximum';
    }

    if (formData.reorder_point !== undefined && formData.reorder_point < 0) {
      newErrors.reorder_point = 'Reorder point cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view') return;
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (mode === 'create') {
        const createData: CreateStockRequest = {
          product_id: formData.product_id,
          quantity_available: formData.quantity_available,
          minimum_stock_level: formData.minimum_stock_level || undefined,
          maximum_stock_level: formData.maximum_stock_level || undefined,
          reorder_point: formData.reorder_point || undefined,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
          created_by: user?.id || ''
        };

        hackLog.apiRequest('POST', '/api/stock', {
          data: createData,
          component: 'StockForm'
        });

        await stockApi.createStock(createData);
        
        hackLog.apiSuccess('POST', '/api/stock', {
          productId: createData.product_id
        });

        toast({
          title: 'Success',
          description: 'Stock entry created successfully'
        });
      } else if (mode === 'edit' && stockItem) {
        const updateData: UpdateStockRequest = {
          quantity_available: formData.quantity_available,
          quantity_reserved: formData.quantity_reserved,
          minimum_stock_level: formData.minimum_stock_level || undefined,
          maximum_stock_level: formData.maximum_stock_level || undefined,
          reorder_point: formData.reorder_point || undefined,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
          updated_by: user?.id || ''
        };

        hackLog.apiRequest('PUT', `/api/stock/product/${stockItem.product_id}`, {
          data: updateData,
          component: 'StockForm'
        });

        await stockApi.updateStock(stockItem.product_id, updateData);
        
        hackLog.apiSuccess('PUT', `/api/stock/product/${stockItem.product_id}`, {
          productId: stockItem.product_id
        });

        toast({
          title: 'Success',
          description: 'Stock entry updated successfully'
        });
      }

      onSuccess();
    } catch (error: any) {
      const endpoint = mode === 'create' ? '/api/stock' : `/api/stock/product/${stockItem?.product_id}`;
      hackLog.apiError(mode === 'create' ? 'POST' : 'PUT', endpoint, {
        error: error.message,
        formData
      });

      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode} stock entry`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Selection */}
      <div className="space-y-2">
        <Label htmlFor="product_id">Product *</Label>
        {isReadOnly ? (
          <div className="p-3 bg-muted rounded-md">
            <div className="font-medium">{stockItem?.product.name}</div>
            <div className="text-sm text-muted-foreground">
              SKU: {stockItem?.product.sku} | Category: {stockItem?.product.category_name || 'N/A'}
            </div>
          </div>
        ) : (
          <Select
            value={formData.product_id}
            onValueChange={(value) => handleChange('product_id', value)}
            disabled={mode === 'edit'}
          >
            <SelectTrigger className={errors.product_id ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {product.sku} | Category: {product.category?.name || 'N/A'}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.product_id && (
          <p className="text-sm text-destructive">{errors.product_id}</p>
        )}
      </div>

      {/* Stock Quantities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity_available">Available Quantity *</Label>
          <Input
            id="quantity_available"
            type="number"
            min="0"
            value={formData.quantity_available}
            onChange={(e) => handleChange('quantity_available', parseInt(e.target.value) || 0)}
            className={errors.quantity_available ? 'border-destructive' : ''}
            readOnly={isReadOnly}
          />
          {errors.quantity_available && (
            <p className="text-sm text-destructive">{errors.quantity_available}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity_reserved">Reserved Quantity</Label>
          <Input
            id="quantity_reserved"
            type="number"
            min="0"
            value={formData.quantity_reserved}
            onChange={(e) => handleChange('quantity_reserved', parseInt(e.target.value) || 0)}
            className={errors.quantity_reserved ? 'border-destructive' : ''}
            readOnly={isReadOnly}
          />
          {errors.quantity_reserved && (
            <p className="text-sm text-destructive">{errors.quantity_reserved}</p>
          )}
        </div>
      </div>

      {/* Stock Levels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
          <Input
            id="minimum_stock_level"
            type="number"
            min="0"
            value={formData.minimum_stock_level}
            onChange={(e) => handleChange('minimum_stock_level', parseInt(e.target.value) || 0)}
            className={errors.minimum_stock_level ? 'border-destructive' : ''}
            readOnly={isReadOnly}
          />
          {errors.minimum_stock_level && (
            <p className="text-sm text-destructive">{errors.minimum_stock_level}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maximum_stock_level">Maximum Stock Level</Label>
          <Input
            id="maximum_stock_level"
            type="number"
            min="0"
            value={formData.maximum_stock_level}
            onChange={(e) => handleChange('maximum_stock_level', parseInt(e.target.value) || 0)}
            className={errors.maximum_stock_level ? 'border-destructive' : ''}
            readOnly={isReadOnly}
          />
          {errors.maximum_stock_level && (
            <p className="text-sm text-destructive">{errors.maximum_stock_level}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorder_point">Reorder Point</Label>
          <Input
            id="reorder_point"
            type="number"
            min="0"
            value={formData.reorder_point}
            onChange={(e) => handleChange('reorder_point', parseInt(e.target.value) || 0)}
            className={errors.reorder_point ? 'border-destructive' : ''}
            readOnly={isReadOnly}
          />
          {errors.reorder_point && (
            <p className="text-sm text-destructive">{errors.reorder_point}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Storage Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="e.g., Warehouse A, Shelf B-3"
          readOnly={isReadOnly}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes about this stock entry..."
          rows={3}
          readOnly={isReadOnly}
        />
      </div>

      {/* Stock Summary (for view/edit mode) */}
      {(mode === 'view' || mode === 'edit') && stockItem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stock Summary</CardTitle>
            <CardDescription>
              Current stock information and calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formData.quantity_available}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formData.quantity_reserved}
                </div>
                <div className="text-sm text-muted-foreground">Reserved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formData.quantity_available + formData.quantity_reserved}
                </div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formData.quantity_available <= (formData.reorder_point || 0) ? (
                    <Badge variant="destructive">Low</Badge>
                  ) : (
                    <Badge variant="default">OK</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          {mode === 'view' ? 'Close' : 'Cancel'}
        </Button>
        {!isReadOnly && (
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : mode === 'create' ? 'Create Stock' : 'Update Stock'}
          </Button>
        )}
      </div>
    </form>
  );
}