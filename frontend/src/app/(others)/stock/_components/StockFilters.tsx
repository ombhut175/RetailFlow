'use client';

import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { categoriesApi } from '@/lib/api/inventory';
import { StockFilters, StockStatus } from '@/types/stock';
import { Category } from '@/types/inventory';
import hackLog from '@/lib/logger';

interface StockFiltersComponentProps {
  filters: StockFilters;
  onFiltersChange: (filters: StockFilters) => void;
}

export function StockFiltersComponent({ filters, onFiltersChange }: StockFiltersComponentProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [localFilters, setLocalFilters] = useState<StockFilters>(filters);

  // Load categories for filtering
  const loadCategories = async () => {
    try {
      hackLog.apiRequest('GET', '/api/categories', {
        component: 'StockFilters',
        action: 'loadCategories'
      });

      const response = await categoriesApi.getCategories({ limit: 1000 });
      setCategories(response.data);

      hackLog.apiSuccess('GET', '/api/categories', {
        count: response.data.length
      });
    } catch (error: any) {
      hackLog.apiError('GET', '/api/categories', {
        error: error.message
      });

      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
    }
  };

  // Initialize local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof StockFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: StockFilters = {
      page: 1,
      limit: filters.limit,
      sort_by: 'product_name',
      sort_order: 'asc'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setIsOpen(false);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category_id) count++;
    if (filters.status) count++;
    if (filters.location) count++;
    if (filters.low_stock !== undefined) count++;
    if (filters.out_of_stock !== undefined) count++;
    if (filters.has_reserved !== undefined) count++;
    if (filters.min_quantity !== undefined) count++;
    if (filters.max_quantity !== undefined) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Filter Stock</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={localFilters.category_id || ''}
              onValueChange={(value) => handleFilterChange('category_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Stock Status</Label>
            <Select
              value={localFilters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value={StockStatus.IN_STOCK}>In Stock</SelectItem>
                <SelectItem value={StockStatus.LOW_STOCK}>Low Stock</SelectItem>
                <SelectItem value={StockStatus.OUT_OF_STOCK}>Out of Stock</SelectItem>
                <SelectItem value={StockStatus.RESERVED}>Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Filter by location..."
              value={localFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          {/* Quantity Range */}
          <div className="space-y-2">
            <Label>Quantity Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                min="0"
                value={localFilters.min_quantity || ''}
                onChange={(e) => handleFilterChange('min_quantity', e.target.value ? parseInt(e.target.value) : undefined)}
              />
              <Input
                type="number"
                placeholder="Max"
                min="0"
                value={localFilters.max_quantity || ''}
                onChange={(e) => handleFilterChange('max_quantity', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-2">
            <Label>Quick Filters</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.low_stock === true}
                  onChange={(e) => handleFilterChange('low_stock', e.target.checked ? true : undefined)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Low stock items only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.out_of_stock === true}
                  onChange={(e) => handleFilterChange('out_of_stock', e.target.checked ? true : undefined)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Out of stock items only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.has_reserved === true}
                  onChange={(e) => handleFilterChange('has_reserved', e.target.checked ? true : undefined)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Items with reservations</span>
              </label>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
            >
              Clear All
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}