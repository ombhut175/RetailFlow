'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { stockTransactionsApi } from '@/lib/api/stock';
import { 
  StockResponse, 
  StockTransactionType, 
  StockReferenceType,
  StockTransactionCreateRequest 
} from '@/types/stock';
import hackLog from '@/lib/logger';

interface StockAdjustmentFormProps {
  stockItem: StockResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StockAdjustmentForm({ stockItem, onSuccess, onCancel }: StockAdjustmentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: StockTransactionType.ADJUSTMENT as StockTransactionType,
    quantity: 0,
    reason: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form field changes
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.transaction_type) {
      newErrors.type = 'Transaction type is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.transaction_type === StockTransactionType.OUT && formData.quantity > stockItem.quantity_available) {
      newErrors.quantity = `Cannot remove more than available quantity (${stockItem.quantity_available})`;
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const transactionData: StockTransactionCreateRequest = {
        product_id: stockItem.product_id,
        transaction_type: formData.transaction_type,
        reference_type: StockReferenceType.ADJUSTMENT,
        created_by: 'current-user', // TODO: Get from auth context
        quantity: formData.quantity,
        reason: formData.reason,
        notes: formData.notes || undefined
      };

      hackLog.apiRequest('POST', '/api/stock/transactions', {
        data: transactionData,
        component: 'StockAdjustmentForm'
      });

      await stockTransactionsApi.createTransaction(transactionData);
      
      hackLog.apiSuccess('POST', '/api/stock/transactions', {
        productId: stockItem.product_id,
        type: formData.transaction_type,
        quantity: formData.quantity
      });

      toast({
        title: 'Success',
        description: `Stock ${formData.transaction_type.toLowerCase()} recorded successfully`
      });

      onSuccess();
    } catch (error: any) {
      hackLog.apiError('POST', '/api/stock/transactions', {
        error: error.message,
        formData
      });

      toast({
        title: 'Error',
        description: error.message || 'Failed to record stock adjustment',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate new quantity after adjustment
  const getNewQuantity = () => {
    if (formData.transaction_type === StockTransactionType.IN) {
      return stockItem.quantity_available + formData.quantity;
    } else if (formData.transaction_type === StockTransactionType.OUT) {
      return stockItem.quantity_available - formData.quantity;
    }
    return stockItem.quantity_available;
  };

  const newQuantity = getNewQuantity();
  const isIncrease = formData.transaction_type === StockTransactionType.IN;
    const isDecrease = formData.transaction_type === StockTransactionType.OUT;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            {stockItem.product.name}
          </CardTitle>
          <CardDescription>
            SKU: {stockItem.product.sku} | Current Available: {stockItem.quantity_available} units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stockItem.quantity_available}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {stockItem.quantity_reserved}
              </div>
              <div className="text-sm text-muted-foreground">Reserved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stockItem.quantity_total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Adjustment Type *</Label>
        <Select
          value={formData.transaction_type}
          onValueChange={(value) => handleChange('transaction_type', value)}
        >
          <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select adjustment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={StockTransactionType.IN}>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span>Stock In (Increase)</span>
              </div>
            </SelectItem>
            <SelectItem value={StockTransactionType.OUT}>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span>Stock Out (Decrease)</span>
              </div>
            </SelectItem>
            <SelectItem value={StockTransactionType.ADJUSTMENT}>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span>Manual Adjustment</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type}</p>
        )}
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={isDecrease ? stockItem.quantity_available : undefined}
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
          className={errors.quantity ? 'border-destructive' : ''}
          placeholder="Enter quantity to adjust"
        />
        {errors.quantity && (
          <p className="text-sm text-destructive">{errors.quantity}</p>
        )}
        {isDecrease && formData.quantity > 0 && (
          <p className="text-sm text-muted-foreground">
            Maximum available: {stockItem.quantity_available} units
          </p>
        )}
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason *</Label>
        <Select
          value={formData.reason}
          onValueChange={(value) => handleChange('reason', value)}
        >
          <SelectTrigger className={errors.reason ? 'border-destructive' : ''}>
            <SelectValue placeholder="Select reason for adjustment" />
          </SelectTrigger>
          <SelectContent>
            {isIncrease && (
              <>
                <SelectItem value="Purchase">New Purchase</SelectItem>
                <SelectItem value="Return">Customer Return</SelectItem>
                <SelectItem value="Production">Production Completed</SelectItem>
                <SelectItem value="Transfer In">Transfer In</SelectItem>
                <SelectItem value="Found">Stock Found</SelectItem>
              </>
            )}
            {isDecrease && (
              <>
                <SelectItem value="Sale">Sale/Order</SelectItem>
                <SelectItem value="Damage">Damaged Goods</SelectItem>
                <SelectItem value="Expired">Expired Items</SelectItem>
                <SelectItem value="Transfer Out">Transfer Out</SelectItem>
                <SelectItem value="Lost">Stock Lost</SelectItem>
                <SelectItem value="Theft">Theft</SelectItem>
              </>
            )}
            {formData.transaction_type === StockTransactionType.ADJUSTMENT && (
              <>
                <SelectItem value="Inventory Count">Physical Inventory Count</SelectItem>
                <SelectItem value="System Error">System Error Correction</SelectItem>
                <SelectItem value="Audit">Audit Adjustment</SelectItem>
              </>
            )}
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.reason && (
          <p className="text-sm text-destructive">{errors.reason}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Optional additional details about this adjustment..."
          rows={3}
        />
      </div>

      {/* Preview */}
      {formData.quantity > 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Adjustment Preview</CardTitle>
            <CardDescription>
              Review the changes before confirming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-xl font-bold">
                  {stockItem.quantity_available}
                </div>
                <div className="text-sm text-muted-foreground">Current</div>
              </div>
              <div className="flex items-center gap-2">
                {isIncrease && (
                  <>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <Badge variant="outline" className="text-green-600">
                      +{formData.quantity}
                    </Badge>
                  </>
                )}
                {isDecrease && (
                  <>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <Badge variant="outline" className="text-red-600">
                      -{formData.quantity}
                    </Badge>
                  </>
                )}
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  newQuantity < stockItem.quantity_available ? 'text-red-600' : 
                  newQuantity > stockItem.quantity_available ? 'text-green-600' : 
                  'text-blue-600'
                }`}>
                  {newQuantity}
                </div>
                <div className="text-sm text-muted-foreground">New Total</div>
              </div>
            </div>
            
            {newQuantity <= 0 && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Warning: This adjustment will result in zero or negative stock!
                </p>
              </div>
            )}
            
            {newQuantity <= (stockItem.reorder_point || 10) && newQuantity > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-700 font-medium">
                  ⚠️ Notice: Stock will be below reorder point ({stockItem.reorder_point || 10} units)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || formData.quantity <= 0}
          className={isDecrease ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
        >
          {loading ? 'Processing...' : `Confirm ${formData.transaction_type === StockTransactionType.IN ? 'Increase' : formData.transaction_type === StockTransactionType.OUT ? 'Decrease' : 'Adjustment'}`}
        </Button>
      </div>
    </form>
  );
}