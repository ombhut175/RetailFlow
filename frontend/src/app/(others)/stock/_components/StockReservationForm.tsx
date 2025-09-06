'use client';

import React, { useState } from 'react';
import { Package, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { stockApi } from '@/lib/api/stock';
import { StockResponse } from '@/types/stock';
import hackLog from '@/lib/logger';

interface StockReservationFormProps {
  mode: 'reserve' | 'release';
  stockItem: StockResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StockReservationForm({ mode, stockItem, onSuccess, onCancel }: StockReservationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 0,
    reference: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isReserve = mode === 'reserve';
  const maxQuantity = isReserve ? stockItem.quantity_available : stockItem.quantity_reserved;

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

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.quantity > maxQuantity) {
      newErrors.quantity = `Cannot ${mode} more than ${maxQuantity} units`;
    }

    if (isReserve && !formData.reference.trim()) {
      newErrors.reference = 'Reference (order ID, customer, etc.) is required for reservations';
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
      if (isReserve) {
        hackLog.apiRequest('POST', `/api/stock/product/${stockItem.product_id}/reserve`, {
          quantity: formData.quantity,
          component: 'StockReservationForm'
        });

        await stockApi.reserveStock(stockItem.product_id, {
          quantity: formData.quantity,
          updated_by: 'current-user-id', // TODO: Get from auth context
          notes: formData.notes || undefined
        });
        
        hackLog.apiSuccess('POST', `/api/stock/product/${stockItem.product_id}/reserve`, {
          productId: stockItem.product_id,
          quantity: formData.quantity
        });

        toast({
          title: 'Success',
          description: `${formData.quantity} units reserved successfully`
        });
      } else {
        hackLog.apiRequest('POST', `/api/stock/product/${stockItem.product_id}/release`, {
          quantity: formData.quantity,
          component: 'StockReservationForm'
        });

        await stockApi.releaseStock(stockItem.product_id, {
          quantity: formData.quantity,
          updated_by: 'current-user-id', // TODO: Get from auth context
          notes: formData.notes || undefined
        });
        
        hackLog.apiSuccess('POST', `/api/stock/product/${stockItem.product_id}/release`, {
          productId: stockItem.product_id,
          quantity: formData.quantity
        });

        toast({
          title: 'Success',
          description: `${formData.quantity} units released successfully`
        });
      }

      onSuccess();
    } catch (error: any) {
      const endpoint = `/api/stock/product/${stockItem.product_id}/${mode}`;
      hackLog.apiError('POST', endpoint, {
        error: error.message,
        formData
      });

      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode} stock`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate new quantities after operation
  const getNewQuantities = () => {
    if (isReserve) {
      return {
        available: stockItem.quantity_available - formData.quantity,
        reserved: stockItem.quantity_reserved + formData.quantity
      };
    } else {
      return {
        available: stockItem.quantity_available + formData.quantity,
        reserved: stockItem.quantity_reserved - formData.quantity
      };
    }
  };

  const newQuantities = getNewQuantities();

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
            SKU: {stockItem.product.sku} | 
            Available: {stockItem.quantity_available} | 
            Reserved: {stockItem.quantity_reserved}
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

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity">
          Quantity to {isReserve ? 'Reserve' : 'Release'} *
        </Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={maxQuantity}
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
          className={errors.quantity ? 'border-destructive' : ''}
          placeholder={`Enter quantity to ${mode}`}
        />
        {errors.quantity && (
          <p className="text-sm text-destructive">{errors.quantity}</p>
        )}
        {formData.quantity > 0 && (
          <p className="text-sm text-muted-foreground">
            Maximum {isReserve ? 'available' : 'reserved'}: {maxQuantity} units
          </p>
        )}
      </div>

      {/* Reference (for reservations) */}
      {isReserve && (
        <div className="space-y-2">
          <Label htmlFor="reference">Reference *</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => handleChange('reference', e.target.value)}
            className={errors.reference ? 'border-destructive' : ''}
            placeholder="Order ID, Customer name, etc."
          />
          {errors.reference && (
            <p className="text-sm text-destructive">{errors.reference}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Enter a reference to identify what this reservation is for
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder={`Optional notes about this ${mode} operation...`}
          rows={3}
        />
      </div>

      {/* Preview */}
      {formData.quantity > 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isReserve ? (
                <Lock className="h-5 w-5 text-orange-600" />
              ) : (
                <Unlock className="h-5 w-5 text-green-600" />
              )}
              {isReserve ? 'Reservation' : 'Release'} Preview
            </CardTitle>
            <CardDescription>
              Review the changes before confirming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current vs New */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Current</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Available:</span>
                      <Badge variant="outline" className="text-green-600">
                        {stockItem.quantity_available}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Reserved:</span>
                      <Badge variant="outline" className="text-orange-600">
                        {stockItem.quantity_reserved}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-medium mb-2">After {isReserve ? 'Reservation' : 'Release'}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Available:</span>
                      <Badge 
                        variant="outline" 
                        className={newQuantities.available < stockItem.quantity_available ? 'text-red-600' : 'text-green-600'}
                      >
                        {newQuantities.available}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Reserved:</span>
                      <Badge 
                        variant="outline" 
                        className={newQuantities.reserved > stockItem.quantity_reserved ? 'text-orange-600' : 'text-green-600'}
                      >
                        {newQuantities.reserved}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operation Summary */}
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center justify-center gap-2">
                  {isReserve ? (
                    <>
                      <Lock className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-600">
                        Reserving {formData.quantity} units
                      </span>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        Releasing {formData.quantity} units
                      </span>
                    </>
                  )}
                </div>
                {isReserve && formData.reference && (
                  <div className="text-center text-sm text-muted-foreground mt-1">
                    Reference: {formData.reference}
                  </div>
                )}
              </div>

              {/* Warnings */}
              {isReserve && newQuantities.available <= 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ Warning: This reservation will result in zero available stock!
                  </p>
                </div>
              )}
              
              {isReserve && newQuantities.available <= (stockItem.reorder_point || 10) && newQuantities.available > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-700 font-medium">
                    ⚠️ Notice: Available stock will be below reorder point ({stockItem.reorder_point || 10} units)
                  </p>
                </div>
              )}
            </div>
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
          className={isReserve ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
        >
          {loading ? 'Processing...' : `Confirm ${isReserve ? 'Reservation' : 'Release'}`}
        </Button>
      </div>
    </form>
  );
}