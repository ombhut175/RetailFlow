'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrderFilters, PurchaseOrderStatus } from '@/types/purchase-orders';
import hackLog from '@/lib/logger';

interface PurchaseOrderFiltersComponentProps {
  filters: PurchaseOrderFilters;
  onFiltersChange: (filters: PurchaseOrderFilters) => void;
}

export function PurchaseOrderFiltersComponent({ 
  filters, 
  onFiltersChange 
}: PurchaseOrderFiltersComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<PurchaseOrderFilters>(filters);

  // Apply filters
  const applyFilters = () => {
    hackLog.dev('Applying purchase order filters', { 
      filters: tempFilters,
      component: 'PurchaseOrderFiltersComponent'
    });
    
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    hackLog.dev('Resetting purchase order filters', {
      component: 'PurchaseOrderFiltersComponent'
    });
    
    const resetFilters: PurchaseOrderFilters = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  // Count active filters
  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof PurchaseOrderFilters];
    return value !== undefined && 
           value !== '' && 
           key !== 'page' && 
           key !== 'limit' && 
           key !== 'sort_by' && 
           key !== 'sort_order';
  }).length;

  // Remove individual filter
  const removeFilter = (filterKey: keyof PurchaseOrderFilters) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Purchase Orders</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={tempFilters.status || ''}
                onValueChange={(value) => 
                  setTempFilters(prev => ({
                    ...prev,
                    status: (value && value !== '__all__') ? value as PurchaseOrderStatus : undefined
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All statuses</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.CONFIRMED}>Confirmed</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.RECEIVED}>Received</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order Date From</label>
              <Input
                type="date"
                value={tempFilters.order_date_from || ''}
                onChange={(e) => 
                  setTempFilters(prev => ({
                    ...prev,
                    order_date_from: e.target.value || undefined
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Date To</label>
              <Input
                type="date"
                value={tempFilters.order_date_to || ''}
                onChange={(e) => 
                  setTempFilters(prev => ({
                    ...prev,
                    order_date_to: e.target.value || undefined
                  }))
                }
              />
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={tempFilters.sort_by || 'created_at'}
                onValueChange={(value) => 
                  setTempFilters(prev => ({
                    ...prev,
                    sort_by: value
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="order_date">Order Date</SelectItem>
                  <SelectItem value="order_number">Order Number</SelectItem>
                  <SelectItem value="total_amount">Total Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort Order</label>
              <Select
                value={tempFilters.sort_order || 'desc'}
                onValueChange={(value) => 
                  setTempFilters(prev => ({
                    ...prev,
                    sort_order: value as 'asc' | 'desc'
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset
              </Button>
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('status')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.order_date_from && (
            <Badge variant="secondary" className="gap-1">
              From: {filters.order_date_from}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('order_date_from')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.order_date_to && (
            <Badge variant="secondary" className="gap-1">
              To: {filters.order_date_to}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeFilter('order_date_to')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
