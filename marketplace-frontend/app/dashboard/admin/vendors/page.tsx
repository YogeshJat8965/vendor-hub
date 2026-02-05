'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Eye, MoreVertical, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  registeredDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isPremium: boolean;
  rating: number;
  reviewCount: number;
}

const mockVendors: Vendor[] = [
  {
    id: '1',
    businessName: 'Elite Electrical Services',
    ownerName: 'John Smith',
    email: 'john@eliteelectrical.com',
    phone: '(555) 123-4567',
    category: 'Electrical',
    location: 'New York, NY',
    registeredDate: '2024-02-03',
    status: 'pending',
    isPremium: false,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: '2',
    businessName: 'Perfect Painting Co.',
    ownerName: 'Mike Williams',
    email: 'mike@perfectpainting.com',
    phone: '(555) 234-5678',
    category: 'Painting',
    location: 'Brooklyn, NY',
    registeredDate: '2024-02-02',
    status: 'pending',
    isPremium: true,
    rating: 0,
    reviewCount: 0,
  },
  {
    id: '3',
    businessName: 'Johns Plumbing Services',
    ownerName: 'Robert Johnson',
    email: 'contact@johnsplumbing.com',
    phone: '(555) 345-6789',
    category: 'Plumbing',
    location: 'Manhattan, NY',
    registeredDate: '2024-01-15',
    status: 'approved',
    isPremium: true,
    rating: 4.8,
    reviewCount: 127,
  },
  {
    id: '4',
    businessName: 'Green Landscaping',
    ownerName: 'David Brown',
    email: 'info@greenlandscaping.com',
    phone: '(555) 456-7890',
    category: 'Landscaping',
    location: 'Queens, NY',
    registeredDate: '2024-01-20',
    status: 'approved',
    isPremium: false,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: '5',
    businessName: 'Budget Plumbing',
    ownerName: 'Tom Wilson',
    email: 'tom@budgetplumbing.com',
    phone: '(555) 567-8901',
    category: 'Plumbing',
    location: 'Bronx, NY',
    registeredDate: '2024-01-10',
    status: 'suspended',
    isPremium: false,
    rating: 3.2,
    reviewCount: 45,
  },
];

export default function ManageVendorsPage() {
  const [vendors, setVendors] = useState(mockVendors);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'suspend' | 'view' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === 'pending').length,
    approved: vendors.filter((v) => v.status === 'approved').length,
    rejected: vendors.filter((v) => v.status === 'rejected').length,
    suspended: vendors.filter((v) => v.status === 'suspended').length,
  };

  const handleApprove = () => {
    if (selectedVendor) {
      setVendors(vendors.map((v) => (v.id === selectedVendor.id ? { ...v, status: 'approved' as const } : v)));
      // TODO: Call API to approve vendor
      console.log('Approve vendor:', selectedVendor.id);
      setActionDialog(null);
      setSelectedVendor(null);
    }
  };

  const handleReject = () => {
    if (selectedVendor) {
      setVendors(vendors.map((v) => (v.id === selectedVendor.id ? { ...v, status: 'rejected' as const } : v)));
      // TODO: Call API to reject vendor with reason
      console.log('Reject vendor:', selectedVendor.id, 'Reason:', rejectionReason);
      setActionDialog(null);
      setSelectedVendor(null);
      setRejectionReason('');
    }
  };

  const handleSuspend = () => {
    if (selectedVendor) {
      setVendors(vendors.map((v) => (v.id === selectedVendor.id ? { ...v, status: 'suspended' as const } : v)));
      // TODO: Call API to suspend vendor
      console.log('Suspend vendor:', selectedVendor.id);
      setActionDialog(null);
      setSelectedVendor(null);
    }
  };

  const getStatusBadge = (status: Vendor['status']) => {
    const styles = {
      pending: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      suspended: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={styles[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
        <h1 className="text-3xl font-bold mb-2">Manage Vendors</h1>
        <p className="text-gray-600">Review and manage vendor registrations</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 touch-target"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12 touch-target">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Painting">Painting</SelectItem>
                <SelectItem value="Landscaping">Landscaping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({statusCounts.suspended})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Vendors List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vendors found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500">
                    <AvatarFallback className="bg-transparent text-white text-xl">
                      {vendor.businessName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{vendor.businessName}</h3>
                          {vendor.isPremium && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">Premium</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{vendor.ownerName}</p>
                      </div>
                      {getStatusBadge(vendor.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {vendor.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {vendor.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {vendor.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Registered {formatDate(vendor.registeredDate)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{vendor.category}</Badge>
                      {vendor.rating > 0 && (
                        <span className="text-sm text-gray-600">
                          ⭐ {vendor.rating} ({vendor.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setActionDialog('view');
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {vendor.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setActionDialog('approve');
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setActionDialog('reject');
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {vendor.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setActionDialog('suspend');
                        }}
                      >
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={actionDialog === 'approve'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedVendor?.businessName}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionDialog === 'reject'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vendor</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedVendor?.businessName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700">Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={actionDialog === 'suspend'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend {selectedVendor?.businessName}? They will not appear in search results.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
            <Button onClick={handleSuspend} className="bg-orange-600 hover:bg-orange-700">Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
