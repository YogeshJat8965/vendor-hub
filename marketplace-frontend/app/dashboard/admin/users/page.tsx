'use client';

import { useState } from 'react';
import { Search, Ban, Eye, Mail, Calendar, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
  registeredDate: string;
  status: 'active' | 'banned';
  quotesCount: number;
  location: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'customer',
    registeredDate: '2024-01-15',
    status: 'active',
    quotesCount: 12,
    location: 'New York, NY',
  },
  {
    id: '2',
    name: 'Mike Williams',
    email: 'mike@example.com',
    role: 'customer',
    registeredDate: '2024-01-20',
    status: 'active',
    quotesCount: 8,
    location: 'Brooklyn, NY',
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily@example.com',
    role: 'customer',
    registeredDate: '2024-01-25',
    status: 'active',
    quotesCount: 5,
    location: 'Manhattan, NY',
  },
  {
    id: '4',
    name: 'Robert Johnson',
    email: 'robert@johnsplumbing.com',
    role: 'vendor',
    registeredDate: '2024-01-10',
    status: 'active',
    quotesCount: 45,
    location: 'Queens, NY',
  },
  {
    id: '5',
    name: 'Spam User',
    email: 'spam@example.com',
    role: 'customer',
    registeredDate: '2024-02-01',
    status: 'banned',
    quotesCount: 0,
    location: 'Unknown',
  },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<'ban' | 'unban' | 'view' | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBan = () => {
    if (selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, status: 'banned' as const } : u)));
      // TODO: Call API to ban user
      console.log('Ban user:', selectedUser.id);
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  const handleUnban = () => {
    if (selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, status: 'active' as const } : u)));
      // TODO: Call API to unban user
      console.log('Unban user:', selectedUser.id);
      setActionDialog(null);
      setSelectedUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
        <p className="text-gray-600">View and manage platform users</p>
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
            <p className="text-3xl font-bold">{users.filter((u) => u.role === 'customer').length}</p>
            <p className="text-sm text-gray-600">Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold">{users.filter((u) => u.role === 'vendor').length}</p>
            <p className="text-sm text-gray-600">Vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-red-600">{users.filter((u) => u.status === 'banned').length}</p>
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
                        <Badge variant={user.role === 'vendor' ? 'default' : 'secondary'}>
                          {user.role === 'vendor' ? 'Vendor' : 'Customer'}
                        </Badge>
                        <Badge className={user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {user.status === 'active' ? 'Active' : 'Banned'}
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
                      Joined {formatDate(user.registeredDate)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCheck className="w-4 h-4" />
                      {user.quotesCount} {user.role === 'vendor' ? 'quotes received' : 'quotes sent'}
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
                  {user.status === 'active' ? (
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
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={handleBan} className="bg-red-600 hover:bg-red-700">Ban User</Button>
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
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={handleUnban} className="bg-green-600 hover:bg-green-700">Unban User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
