'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  AdminFilters,
  UserRole,
  SortField,
  SortOrder,
} from '@/types/admin';

interface UserFiltersProps {
  filters: AdminFilters;
  onChange: (filters: AdminFilters) => void;
}

export function UserFilters({ filters, onChange }: UserFiltersProps) {
  const hasActiveFilters = !!(
    filters.role || 
    filters.isEmailVerified !== undefined || 
    filters.sortBy !== 'createdAt' || 
    filters.sortOrder !== 'desc'
  );

  const handleFilterChange = (key: keyof AdminFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    onChange(newFilters);
  };

  const clearFilters = () => {
    onChange({
      page: 1,
      limit: filters.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.role) count++;
    if (filters.isEmailVerified !== undefined) count++;
    if (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') count++;
    return count;
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge 
                variant="destructive" 
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Filter Users</CardTitle>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Role</Label>
                <Select
                  value={filters.role || 'all'}
                  onValueChange={(value) => 
                    handleFilterChange('role', value === 'all' ? undefined : value as UserRole)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Verification Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Email Status</Label>
                <Select
                  value={
                    filters.isEmailVerified === undefined 
                      ? 'all' 
                      : filters.isEmailVerified 
                        ? 'verified' 
                        : 'unverified'
                  }
                  onValueChange={(value) => 
                    handleFilterChange(
                      'isEmailVerified', 
                      value === 'all' ? undefined : value === 'verified'
                    )
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sort By</Label>
                <Select
                  value={filters.sortBy || 'createdAt'}
                  onValueChange={(value) => handleFilterChange('sortBy', value as SortField)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Sort Order</Label>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value as SortOrder)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Items Per Page */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Items Per Page</Label>
                <Select
                  value={filters.limit?.toString() || '10'}
                  onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-2 border-t">
                  <Label className="text-xs font-medium mb-2 block">Active Filters:</Label>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {filters.role && <div>• Role: {filters.role}</div>}
                    {filters.isEmailVerified !== undefined && (
                      <div>• Email: {filters.isEmailVerified ? 'Verified' : 'Unverified'}</div>
                    )}
                    {(filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc') && (
                      <div>• Sort: {filters.sortBy} ({filters.sortOrder})</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Quick Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1">
          {filters.role && (
            <Badge 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFilterChange('role', undefined)}
            >
              Role: {filters.role}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
          {filters.isEmailVerified !== undefined && (
            <Badge 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-secondary/80"
              onClick={() => handleFilterChange('isEmailVerified', undefined)}
            >
              {filters.isEmailVerified ? 'Verified' : 'Unverified'}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}