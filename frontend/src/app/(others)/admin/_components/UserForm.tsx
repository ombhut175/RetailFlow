'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api/admin';
import {
  User,
  UserRole,
  CreateUserRequest,
  UpdateUserRequest,
  USER_PERMISSIONS,
  ROLE_PERMISSIONS,
  Permission,
} from '@/types/admin';
import hackLog from '@/lib/logger';

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ mode, user, onSuccess, onCancel }: UserFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    email: string;
    role: UserRole;
    permissions: string[];
    isEmailVerified: boolean;
    isRoleActive: boolean;
  }>({
    email: '',
    role: 'STAFF',
    permissions: ROLE_PERMISSIONS.STAFF || [],
    isEmailVerified: false,
    isRoleActive: true,
  });

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        email: user.email,
        role: user.role?.role || 'STAFF',
        permissions: user.role?.permissions || [],
        isEmailVerified: user.isEmailVerified,
        isRoleActive: user.role?.is_active || true,
      });
    } else {
      // Set default permissions for new users based on role
      setFormData(prev => ({
        ...prev,
        permissions: ROLE_PERMISSIONS.STAFF || [],
      }));
    }
  }, [mode, user]);

  // Update permissions when role changes
  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: ROLE_PERMISSIONS[newRole],
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...(prev.permissions || []), permission]
        : (prev.permissions || []).filter(p => p !== permission),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        const createData: CreateUserRequest = {
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions || [],
          isEmailVerified: formData.isEmailVerified,
        };
        await adminApi.createUser(createData);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      } else if (mode === 'edit' && user) {
        const updateData: UpdateUserRequest = {
          email: formData.email,
          role: formData.role,
          permissions: formData.permissions || [],
          isEmailVerified: formData.isEmailVerified,
          isRoleActive: formData.isRoleActive,
        };
        await adminApi.updateUser(user.id, updateData);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      }

      hackLog.info(`User ${mode === 'create' ? 'created' : 'updated'}:`, {
        email: formData.email,
        role: formData.role,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} user`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = {
    'Product Management': USER_PERMISSIONS.filter(p => p.includes('PRODUCTS')),
    'Category Management': USER_PERMISSIONS.filter(p => p.includes('CATEGORIES')),
    'Stock Management': USER_PERMISSIONS.filter(p => p.includes('STOCK')),
    'Purchase Orders': USER_PERMISSIONS.filter(p => p.includes('PURCHASE_ORDERS')),
    'Supplier Management': USER_PERMISSIONS.filter(p => p.includes('SUPPLIERS')),
    'User Management': USER_PERMISSIONS.filter(p => p.includes('USERS')),
    'System Access': USER_PERMISSIONS.filter(p => p.includes('ADMIN')),
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            {mode === 'create' ? 'Enter user details' : 'Update user information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin - Full system access</SelectItem>
                <SelectItem value="MANAGER">Manager - Management access</SelectItem>
                <SelectItem value="STAFF">Staff - Basic access</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isEmailVerified"
              checked={formData.isEmailVerified}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isEmailVerified: checked as boolean }))
              }
            />
            <Label htmlFor="isEmailVerified">Email Verified</Label>
          </div>

          {mode === 'edit' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRoleActive"
                checked={formData.isRoleActive}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isRoleActive: checked as boolean }))
                }
              />
              <Label htmlFor="isRoleActive">Role Active</Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role & Permissions</CardTitle>
          <CardDescription>
            Configure user role and specific permissions. Default permissions are set based on role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Label>Selected Role:</Label>
              <Badge variant="secondary">{formData.role}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Default permissions are automatically assigned based on role. You can customize them below.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category} className="space-y-2">
                <Label className="text-sm font-medium">{category}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={(formData.permissions || []).includes(permission)}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission, checked as boolean)
                        }
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission.replace(/_/g, ' ').toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Permissions Summary:</strong> {(formData.permissions || []).length} permissions selected
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(formData.permissions || []).slice(0, 5).map(permission => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {permission.replace(/_/g, ' ').toLowerCase()}
                </Badge>
              ))}
              {(formData.permissions || []).length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{(formData.permissions || []).length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Update User'}
        </Button>
      </div>
    </form>
  );
}