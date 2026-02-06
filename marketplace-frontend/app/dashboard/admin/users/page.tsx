'use client';

import { useState, useEffect } from 'react';
import { Search, Ban, Eye, Mail, Calendar, UserCheck, UserX, Loader2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'VENDOR';
  createdAt: string;
  status: 'ACTIVE' | 'BANNED';
  quotesCount?: number;
  city?: string;
  state?: string;
}

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<'ban' | 'unban' | 'view' | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBan = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/users/${selectedUser.id}/ban`);
      toast.success(`${selectedUser.name || selectedUser.email} has been banned`);
      await fetchUsers();
      setActionDialog(null);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to ban user:', error);
      toast.error('Failed to ban user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnban = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/users/${selectedUser.id}/unban`);
      toast.success(`${selectedUser.name || selectedUser.email} has been unbanned`);
      await fetchUsers();
      setActionDialog(null);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to unban user:', error);
      toast.error('Failed to unban user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredUsers.map((user) => ({
      Name: user.name || 'N/A',
      Email: user.email,
      Role: user.role,
      Status: user.status,
      'Registered': new Date(user.createdAt).toLocaleDateString(),
      'Quotes': user.quotesCount || 0,
      City: user.city || 'N/A',
      State: user.state || 'N/A',
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users data exported successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 px-4">
      <div className="max-w-7xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
          <p className="text-gray-600">View and manage platform users</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{users.filter((u) => u.role === 'CUSTOMER').length}</p>
            <p className="text-sm text-gray-600">Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{users.filter((u) => u.role === 'VENDOR').length}</p>
            <p className="text-sm text-gray-600">Vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-600">{users.filter((u) => u.status === 'BANNED').length}</p>
            <p className="text-sm text-gray-600">Banned</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 touch-target"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 touch-target">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 touch-target">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Avatar className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500">
                  <AvatarFallback className="bg-transparent text-white text-lg">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{user.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'VENDOR' ? 'default' : 'secondary'}>
                          {user.role === 'VENDOR' ? 'Vendor' : 'Customer'}
                        </Badge>
                        <Badge className={user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {user.status === 'ACTIVE' ? 'Active' : 'Banned'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Joined {formatDate(user.createdAt)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCheck className="w-4 h-4" />
                      {user.quotesCount || 0} {user.role === 'VENDOR' ? 'quotes received' : 'quotes sent'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedUser(user);
                      setActionDialog('view');
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {user.status === 'ACTIVE' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedUser(user);
                        setActionDialog('ban');
                      }}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Ban
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => {
                        setSelectedUser(user);
                        setActionDialog('unban');
                      }}
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Unban
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ban Dialog */}
      <Dialog open={actionDialog === 'ban'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.name}? They will not be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleBan} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Banning...
                </>
              ) : (
                'Ban User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Dialog */}
      <Dialog open={actionDialog === 'unban'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to unban {selectedUser?.name}? They will regain access to the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleUnban} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Unbanning...
                </>
              ) : (
                'Unban User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}
