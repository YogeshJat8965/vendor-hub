'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Eye, MoreVertical, Mail, Phone, MapPin, Calendar, Loader2, Download } from 'lucide-react';
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
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  vendorType: string;
  city: string;
  state: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isPremium: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export default function ManageVendorsPage() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | 'suspend' | 'view' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVendors();
    }
  }, [user]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin/vendors');
      setVendors(response.data || []);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'all' || vendor.vendorType === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusCounts = {
    all: vendors.length,
    pending: vendors.filter((v) => v.status === 'PENDING').length,
    approved: vendors.filter((v) => v.status === 'APPROVED').length,
    rejected: vendors.filter((v) => v.status === 'REJECTED').length,
    suspended: vendors.filter((v) => v.status === 'SUSPENDED').length,
  };

  const handleApprove = async () => {
    if (!selectedVendor) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/vendors/${selectedVendor.id}/approve`);
      toast.success(`${selectedVendor.businessName} approved successfully`);
      await fetchVendors();
      setActionDialog(null);
      setSelectedVendor(null);
    } catch (error) {
      console.error('Failed to approve vendor:', error);
      toast.error('Failed to approve vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVendor) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/vendors/${selectedVendor.id}/reject`, {
        reason: rejectionReason,
      });
      toast.success(`${selectedVendor.businessName} rejected`);
      await fetchVendors();
      setActionDialog(null);
      setSelectedVendor(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Failed to reject vendor:', error);
      toast.error('Failed to reject vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedVendor) return;
    
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/vendors/${selectedVendor.id}/suspend`);
      toast.success(`${selectedVendor.businessName} suspended`);
      await fetchVendors();
      setActionDialog(null);
      setSelectedVendor(null);
    } catch (error) {
      console.error('Failed to suspend vendor:', error);
      toast.error('Failed to suspend vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const csvData = filteredVendors.map((vendor) => ({
      'Business Name': vendor.businessName,
      'Owner Name': vendor.ownerName,
      Email: vendor.email,
      Phone: vendor.phone,
      Type: vendor.vendorType,
      City: vendor.city,
      State: vendor.state,
      Status: vendor.status,
      'Premium': vendor.isPremium ? 'Yes' : 'No',
      'Average Rating': vendor.averageRating || 'N/A',
      'Total Reviews': vendor.totalReviews || 0,
      'Registered': new Date(vendor.createdAt).toLocaleDateString(),
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
    link.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Vendors data exported successfully');
  };

  const getStatusBadge = (status: Vendor['status']) => {
    const styles = {
      PENDING: 'bg-orange-100 text-orange-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      SUSPENDED: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={styles[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
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
      <div className="max-w-7xl mx-auto py-8 space-y-6">\n      {/* Header */}\n      <div className="flex items-center justify-between">\n        <div>\n          <h1 className="text-3xl font-bold mb-2">Manage Vendors</h1>\n          <p className="text-gray-600">Review and manage vendor registrations</p>\n        </div>\n        <Button onClick={exportToCSV} variant="outline">\n          <Download className="w-4 h-4 mr-2" />\n          Export CSV\n        </Button>\n      </div>

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
                        {vendor.city}, {vendor.state}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Registered {formatDate(vendor.createdAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{vendor.vendorType}</Badge>
                      {vendor.averageRating && vendor.averageRating > 0 && (
                        <span className="text-sm text-gray-600">
                          ⭐ {vendor.averageRating.toFixed(1)} ({vendor.totalReviews || 0} reviews)
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
                    {vendor.status === 'PENDING' && (
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
                    {vendor.status === 'APPROVED' && (
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
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Approving...' : 'Approve'}
            </Button>
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
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </Button>
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
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSuspend} 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Suspending...' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
