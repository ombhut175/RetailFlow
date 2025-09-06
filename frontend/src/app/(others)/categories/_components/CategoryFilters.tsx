'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CategoryFilters } from '@/types/inventory';

interface CategoryFiltersComponentProps {
  filters: CategoryFilters;
  onFiltersChange: (filters: CategoryFilters) => void;
}

export function CategoryFiltersComponent({ filters, onFiltersChange }: CategoryFiltersComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<CategoryFilters>(filters);

  // Apply filters
  const handleApplyFilters = () => {
    onFiltersChange({ ...tempFilters, page: 1 });
    setIsOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters: CategoryFilters = {
      page: 1,
      limit: filters.limit || 10,
      sort_by: 'name',
      sort_order: 'asc'
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.is_active !== undefined) count++;
    if (filters.sort_by !== 'name' || filters.sort_order !== 'asc') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
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
            <h4 className="font-medium leading-none">Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={tempFilters.is_active === undefined ? 'all' : tempFilters.is_active.toString()}
              onValueChange={(value) => {
                setTempFilters(prev => ({
                  ...prev,
                  is_active: value === 'all' ? undefined : value === 'true'
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="true">Active Only</SelectItem>
                <SelectItem value="false">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={tempFilters.sort_by || 'name'}
              onValueChange={(value) => {
                setTempFilters(prev => ({
                  ...prev,
                  sort_by: value as 'name' | 'created_at'
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sort field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order Filter */}
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select
              value={tempFilters.sort_order || 'asc'}
              onValueChange={(value) => {
                setTempFilters(prev => ({
                  ...prev,
                  sort_order: value as 'asc' | 'desc'
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Per Page */}
          <div className="space-y-2">
            <Label>Items Per Page</Label>
            <Select
              value={(tempFilters.limit || 10).toString()}
              onValueChange={(value) => {
                setTempFilters(prev => ({
                  ...prev,
                  limit: parseInt(value)
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="flex-1"
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}