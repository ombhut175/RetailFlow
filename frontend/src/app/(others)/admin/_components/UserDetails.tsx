'use client';

import React from 'react';
import { Crown, Briefcase, HardHat, Users, Mail, Calendar, Shield, Check, X, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, UserRole } from '@/types/admin';

interface UserDetailsProps {
  user: User;
}

export function UserDetails({ user }: UserDetailsProps) {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return Crown;
      case 'MANAGER': return Briefcase;
      case 'STAFF': return HardHat;
      default: return Users;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'MANAGER': return 'default';
      case 'STAFF': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupPermissions = (permissions: string[]) => {
    const groups: Record<string, string[]> = {
      'Products': permissions.filter(p => p.includes('PRODUCTS')),
      'Categories': permissions.filter(p => p.includes('CATEGORIES')),
      'Stock': permissions.filter(p => p.includes('STOCK')),
      'Purchase Orders': permissions.filter(p => p.includes('PURCHASE_ORDERS')),
      'Suppliers': permissions.filter(p => p.includes('SUPPLIERS')),
      'Users': permissions.filter(p => p.includes('USERS')),
      'System': permissions.filter(p => p.includes('ADMIN')),
    };

    // Remove empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, perms]) => perms.length > 0)
    );
  };

  const RoleIcon = user.role ? getRoleIcon(user.role.role) : Users;

  return (
    <div className="space-y-6">
      {/* User Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {user.email}
                  {user.isEmailVerified && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>User ID: {user.id}</CardDescription>
              </div>
            </div>
            {user.role && (
              <Badge variant={getRoleBadgeVariant(user.role.role)} className="flex items-center gap-1">
                <RoleIcon className="h-3 w-3" />
                {user.role.role}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email Status:</span>
                <Badge variant={user.isEmailVerified ? 'default' : 'secondary'}>
                  {user.isEmailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Updated:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(user.updatedAt)}
                </span>
              </div>
            </div>
            {user.role && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Role Status:</span>
                  <Badge variant={user.role.is_active ? 'default' : 'destructive'}>
                    {user.role.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Assigned By:</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {user.role.assigned_by}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Role Created:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(user.role.created_at)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      {user.role ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RoleIcon className="h-5 w-5" />
              Role Information
            </CardTitle>
            <CardDescription>
              Detailed role and permission information for this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Role</div>
                  <div className="text-sm text-muted-foreground">
                    {user.role.role === 'ADMIN' && 'Full system administrator with all permissions'}
                    {user.role.role === 'MANAGER' && 'Management level access with most permissions'}
                    {user.role.role === 'STAFF' && 'Basic staff access with limited permissions'}
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role.role)} className="flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {user.role.role}
                </Badge>
              </div>

              <Separator />

              <div>
                <div className="font-medium mb-3">
                  Permissions ({user.role.permissions.length})
                </div>
                {user.role.permissions.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(groupPermissions(user.role.permissions)).map(([category, permissions]) => (
                      <div key={category} className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {category}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission.replace(/_/g, ' ').toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                    No permissions assigned
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <div className="font-medium mb-1">Role ID</div>
                  <div className="text-muted-foreground font-mono break-all">
                    {user.role.id}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Last Role Update</div>
                  <div className="text-muted-foreground">
                    {user.role.updated_at ? formatDate(user.role.updated_at) : 'Never updated'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="font-medium">No Role Assigned</div>
              <div className="text-sm text-muted-foreground">
                This user does not have a role assigned yet.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Quick overview of account status and access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Email Verification</span>
              <div className="flex items-center gap-2">
                {user.isEmailVerified ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Role Assignment</span>
              <div className="flex items-center gap-2">
                {user.role ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {user.role ? `${user.role.role} Role` : 'No Role Assigned'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Role Status</span>
              <div className="flex items-center gap-2">
                {user.role?.is_active ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">
                  {user.role?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium">System Access</span>
              <div className="flex items-center gap-2">
                {user.role?.permissions.includes('ADMIN_ACCESS') ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <X className="h-4 w-4 text-orange-600" />
                )}
                <span className="text-sm">
                  {user.role?.permissions.includes('ADMIN_ACCESS') ? 'Admin Access' : 'Limited Access'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}