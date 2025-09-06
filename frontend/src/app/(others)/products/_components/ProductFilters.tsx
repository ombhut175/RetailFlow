'use client';

import React, { useState } from 'react';
import { Filter, X, DollarSign, Package, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductFilters, Category } from '@/types/inventory';

interface ProductFiltersComponentProps {
  filters: ProductFilters;
  categories: Category[];
  onFiltersChange: (filters: ProductFilters) => void;
}

interface LocalFilters {
  category_id?: string;
  min_price?: string;
  max_price?: string;
  min_stock?: string;
  is_active?: string;
  has_barcode?: string;
}

export function ProductFiltersComponent({ filters, categories, onFiltersChange }: ProductFiltersComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    category_id: filters.category_id || '',
    min_price: filters.min_price?.toString() || '',
    max_price: filters.max_price?.toString() || '',
    min_stock: filters.min_stock?.toString() || '',
    is_active: filters.is_active !== undefined ? filters.is_active.toString() : '',
    has_barcode: filters.has_barcode !== undefined ? filters.has_barcode.toString() : ''
  });

  // Handle local filter changes
  const handleLocalFilterChange = (key: keyof LocalFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    const newFilters: ProductFilters = {
      ...filters,
      category_id: (localFilters.category_id && localFilters.category_id !== '__all__') ? localFilters.category_id : undefined,
      min_price: localFilters.min_price ? parseFloat(localFilters.min_price) : undefined,
      max_price: localFilters.max_price ? parseFloat(localFilters.max_price) : undefined,
      min_stock: localFilters.min_stock ? parseInt(localFilters.min_stock) : undefined,
      is_active: (localFilters.is_active && localFilters.is_active !== '__all__') ? localFilters.is_active === 'true' : undefined,
      has_barcode: (localFilters.has_barcode && localFilters.has_barcode !== '__all__') ? localFilters.has_barcode === 'true' : undefined,
      page: 1 // Reset to first page when applying filters
    };

    onFiltersChange(newFilters);
    setIsOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    const resetLocalFilters: LocalFilters = {
      category_id: '__all__',
      min_price: '',
      max_price: '',
      min_stock: '',
      is_active: '__all__',
      has_barcode: '__all__'
    };
    
    setLocalFilters(resetLocalFilters);
    
    const resetFilters: ProductFilters = {
      page: 1,
      limit: filters.limit,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
      search: filters.search
    };
    
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category_id) count++;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    if (filters.min_stock) count++;
    if (filters.is_active !== undefined) count++;
    if (filters.has_barcode !== undefined) count++;
    return count;
  };

  // Get active filters for display
  const getActiveFiltersDisplay = () => {
    const activeFilters: string[] = [];
    
    if (filters.category_id) {
      const category = categories.find(c => c.id === filters.category_id);
      if (category) {
        activeFilters.push(`Category: ${category.name}`);
      }
    }
    
    if (filters.min_price !== undefined && filters.max_price !== undefined) {
      activeFilters.push(`Price: $${filters.min_price} - $${filters.max_price}`);
    } else if (filters.min_price !== undefined) {
      activeFilters.push(`Min Price: $${filters.min_price}`);
    } else if (filters.max_price !== undefined) {
      activeFilters.push(`Max Price: $${filters.max_price}`);
    }
    
    if (filters.min_stock !== undefined) {
      activeFilters.push(`Min Stock: ${filters.min_stock}`);
    }
    
    if (filters.is_active !== undefined) {
      activeFilters.push(`Status: ${filters.is_active ? 'Active' : 'Inactive'}`);
    }
    
    if (filters.has_barcode !== undefined) {
      activeFilters.push(`Barcode: ${filters.has_barcode ? 'Has Barcode' : 'No Barcode'}`);
    }
    
    return activeFilters;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const activeFiltersDisplay = getActiveFiltersDisplay();

  return (
    <div className="flex items-center gap-2">
      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFiltersDisplay.slice(0, 2).map((filter, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {filter}
            </Badge>
          ))}
          {activeFiltersDisplay.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{activeFiltersDisplay.length - 2} more
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Filter Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filter Products</h4>
              <p className="text-sm text-muted-foreground">
                Apply filters to narrow down your product search
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4" />
                  Category
                </Label>
                <Select
                  value={localFilters.category_id}
                  onValueChange={(value) => handleLocalFilterChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  Price Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Min price"
                      value={localFilters.min_price}
                      onChange={(e) => handleLocalFilterChange('min_price', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Max price"
                      value={localFilters.max_price}
                      onChange={(e) => handleLocalFilterChange('max_price', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Stock Level Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Package className="h-4 w-4" />
                  Minimum Stock Level
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Min stock level"
                  value={localFilters.min_stock}
                  onChange={(e) => handleLocalFilterChange('min_stock', e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={localFilters.is_active}
                  onValueChange={(value) => handleLocalFilterChange('is_active', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All statuses</SelectItem>
                    <SelectItem value="true">Active only</SelectItem>
                    <SelectItem value="false">Inactive only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Barcode Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Barcode</Label>
                <Select
                  value={localFilters.has_barcode}
                  onValueChange={(value) => handleLocalFilterChange('has_barcode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All products</SelectItem>
                    <SelectItem value="true">With barcode</SelectItem>
                    <SelectItem value="false">Without barcode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            {/* Action Buttons */}
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={applyFilters}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}