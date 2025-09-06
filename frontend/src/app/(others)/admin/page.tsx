'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Shield, Users, UserCheck, UserX, Crown, Briefcase, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api/admin';
import {
  User,
  UserRole,
  AdminTableState,
  AdminFilters,
  AdminModalState,
} from '@/types/admin';
import { UserForm } from './_components/UserForm';
import { UserFilters } from './_components/UserFilters';
import { UserDetails } from './_components/UserDetails';
import hackLog from '@/lib/logger';

export default function AdminPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    usersByRole: Record<UserRole, number>;
    verifiedUsers: number;
    unverifiedUsers: number;
  } | null>(null);
  
  const [tableState, setTableState] = useState<AdminTableState>({
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [filters, setFilters] = useState<AdminFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [modalState, setModalState] = useState<AdminModalState>({
    isOpen: false,
    mode: 'create',
    selectedUser: null
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Load users and stats
  const loadUsers = async (newFilters?: AdminFilters) => {
    setTableState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const filterParams = newFilters || filters;
      const response = await adminApi.getUsers(filterParams);
      
      setUsers(response.users);
      setTableState(prev => ({
        ...prev,
        loading: false,
        total: response.total,
        totalPages: response.totalPages,
        page: response.page,
        limit: response.limit
      }));
    } catch (error: any) {
      setTableState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load users'
      }));
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await adminApi.getUserStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Initial load
  useEffect(() => {
    hackLog.componentMount('AdminPage');
    loadUsers();
    loadStats();
  }, []);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== (filters.email || '')) {
        const newFilters = { ...filters, email: searchTerm || undefined, page: 1 };
        setFilters(newFilters);
        loadUsers(newFilters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleFilterChange = (newFilters: AdminFilters) => {
    setFilters(newFilters);
    loadUsers(newFilters);
  };

  const handleCreateUser = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      selectedUser: null
    });
  };

  const handleEditUser = (user: User) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      selectedUser: user
    });
  };

  const handleViewUser = (user: User) => {
    setModalState({
      isOpen: true,
      mode: 'view',
      selectedUser: user
    });
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await adminApi.deleteUser(user.id);
      toast({
        title: 'Success',
        description: `User ${user.email} deleted successfully`
      });
      loadUsers();
      loadStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const handleFormSuccess = () => {
    setModalState({ isOpen: false, mode: 'create', selectedUser: null });
    loadUsers();
    loadStats();
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage users, roles, and permissions across the platform
            </p>
          </div>
          <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}% verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unverified Users</CardTitle>
              <UserX className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.unverifiedUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? Math.round((stats.unverifiedUsers / stats.totalUsers) * 100) : 0}% unverified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Crown className="h-3 w-3 text-red-500" />
                    Admin
                  </span>
                  <span className="font-medium">{stats.usersByRole.ADMIN}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-blue-500" />
                    Manager
                  </span>
                  <span className="font-medium">{stats.usersByRole.MANAGER}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <HardHat className="h-3 w-3 text-gray-500" />
                    Staff
                  </span>
                  <span className="font-medium">{stats.usersByRole.STAFF}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">User Management</CardTitle>
          <CardDescription>Search, filter, and manage all system users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <UserFilters filters={filters} onChange={handleFilterChange} />
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableState.loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const RoleIcon = user.role ? getRoleIcon(user.role.role) : Users;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.role ? (
                            <Badge variant={getRoleBadgeVariant(user.role.role)} className="flex items-center gap-1 w-fit">
                              <RoleIcon className="h-3 w-3" />
                              {user.role.role}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No Role</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={user.isEmailVerified ? 'default' : 'secondary'} className="w-fit">
                              {user.isEmailVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                            {user.role && (
                              <Badge variant={user.role.is_active ? 'default' : 'destructive'} className="w-fit">
                                {user.role.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete user "{user.email}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {tableState.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((tableState.page - 1) * tableState.limit) + 1} to {Math.min(tableState.page * tableState.limit, tableState.total)} of {tableState.total} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, page: tableState.page - 1 };
                    setFilters(newFilters);
                    loadUsers(newFilters);
                  }}
                  disabled={tableState.page === 1 || tableState.loading}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {tableState.page} of {tableState.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, page: tableState.page + 1 };
                    setFilters(newFilters);
                    loadUsers(newFilters);
                  }}
                  disabled={tableState.page === tableState.totalPages || tableState.loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      <Dialog open={modalState.isOpen} onOpenChange={(open) => setModalState(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalState.mode === 'create' && 'Create New User'}
              {modalState.mode === 'edit' && 'Edit User'}
              {modalState.mode === 'view' && 'User Details'}
            </DialogTitle>
            <DialogDescription>
              {modalState.mode === 'create' && 'Create a new user with role and permissions'}
              {modalState.mode === 'edit' && 'Update user information and permissions'}
              {modalState.mode === 'view' && 'View detailed user information'}
            </DialogDescription>
          </DialogHeader>
          
          {modalState.mode === 'view' && modalState.selectedUser ? (
            <UserDetails user={modalState.selectedUser} />
          ) : (modalState.mode === 'create' || modalState.mode === 'edit') ? (
            <UserForm
              mode={modalState.mode}
              user={modalState.selectedUser}
              onSuccess={handleFormSuccess}
              onCancel={() => setModalState(prev => ({ ...prev, isOpen: false }))}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}