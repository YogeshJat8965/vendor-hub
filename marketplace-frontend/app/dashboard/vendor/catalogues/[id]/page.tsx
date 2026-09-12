'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Video, FileText, Lock, Upload, Camera, Loader2, X, Wrench, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { UploadService } from '@/lib/upload-service';

export default function CatalogueBuilderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [vendorPlan, setVendorPlan] = useState('BASIC');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingItemMedia, setUploadingItemMedia] = useState<Record<string, boolean>>({});

  const [catalogue, setCatalogue] = useState({
    name: '',
    description: '',
    coverImage: '',
    items: [] as any[]
  });

  useEffect(() => {
    // Fetch vendor details to know plan limits
    const fetchVendorDetails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${apiUrl}/api/vendor/profile?email=${user?.email}`, {
          headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
        });
        if (res.ok) {
          const data = await res.json();
          setVendorPlan(data.subscriptionPlan || 'BASIC');
        }
      } catch (err) {}
    };

    if (user?.email) {
      fetchVendorDetails();
      if (!isNew) fetchCatalogue();
    }
  }, [user, id]);

  const fetchCatalogue = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${apiUrl}/api/catalogues/${id}`); 
      
      // We also need the vendor's real catalogues to ensure security/proper ownership
      const allRes = await fetch(`${apiUrl}/api/vendor/catalogues?email=${user?.email}`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (allRes.ok) {
        const data = await allRes.json();
        const found = data.find((c: any) => c.id === id);
        if (found) setCatalogue(found);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!catalogue.name) return alert('Name is required');
    if (catalogue.items.length > 3) {
      return toast.error('Maximum 3 items allowed per catalogue.');
    }
    
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      const url = isNew 
        ? `${apiUrl}/api/vendor/catalogues?email=${user?.email}`
        : `${apiUrl}/api/vendor/catalogues/${id}?email=${user?.email}`;
        
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(catalogue)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      
      const saved = await res.json();
      router.push('/dashboard/vendor/catalogues');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const maxItems = 3;
    if (catalogue.items.length >= maxItems) {
      return toast.error(`Maximum 3 items allowed per catalogue.`);
    }
    setCatalogue({
      ...catalogue,
      items: [
        ...catalogue.items,
        {
          title: '',
          description: '',
          itemType: 'SERVICE',
          startingPrice: '',
          stockStatus: 'IN_STOCK',
          stockQuantity: '',
          images: []
        }
      ]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...catalogue.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setCatalogue({ ...catalogue, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = [...catalogue.items];
    newItems.splice(index, 1);
    setCatalogue({ ...catalogue, items: newItems });
  };

  const setItemUploading = (index: number, field: string, value: boolean) => {
    setUploadingItemMedia(prev => ({ ...prev, [`${index}-${field}`]: value }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
    setUploadingCover(true);
    try {
      const url = await UploadService.uploadCatalogueImage(file, user.email);
      setCatalogue({ ...catalogue, coverImage: url });
      toast.success('Cover image uploaded');
    } catch (err) {
      // toast already shown in service
    } finally {
      setUploadingCover(false);
      e.target.value = ''; // reset input
    }
  };

  const handleItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user?.email) return;
    
    const currentImages = catalogue.items[index].images || [];
    const maxAllowed = 5;
    
    if (currentImages.length + files.length > maxAllowed) {
      return toast.error(`Maximum ${maxAllowed} images allowed for your plan.`);
    }

    setItemUploading(index, 'images', true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await UploadService.uploadCatalogueImage(files[i], user.email);
        urls.push(url);
      }
      updateItem(index, 'images', [...currentImages, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
    } finally {
      setItemUploading(index, 'images', false);
      e.target.value = '';
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
    
    if (file.size > 50 * 1024 * 1024) {
      return toast.error('Video must be less than 50MB');
    }

    setItemUploading(index, 'video', true);
    try {
      const url = await UploadService.uploadCatalogueVideo(file, user.email);
      updateItem(index, 'videoUrl', url);
      toast.success('Video uploaded');
    } catch (err) {
    } finally {
      setItemUploading(index, 'video', false);
      e.target.value = '';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;
    
    if (file.size > 20 * 1024 * 1024) {
      return toast.error('PDF must be less than 20MB');
    }

    setItemUploading(index, 'pdf', true);
    try {
      const url = await UploadService.uploadCataloguePdf(file, user.email);
      updateItem(index, 'pdfBrochureUrl', url);
      toast.success('PDF uploaded');
    } catch (err) {
    } finally {
      setItemUploading(index, 'pdf', false);
      e.target.value = '';
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 rounded-3xl flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-[#CDC0B0] border-t-[#2C2621] rounded-full animate-spin"></div>
    </div>
  );

  const isPremium = vendorPlan === 'PREMIUM';

  return (
    <div className="min-h-screen bg-[#FDFBF7] rounded-3xl p-4 sm:p-8 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor/catalogues">
            <Button variant="outline" size="icon" className="rounded-full border-[#CDC0B0] text-[#2C2621] hover:bg-[#EEDDCC]/50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-[#2C2621]">{isNew ? 'Create Catalogue' : 'Edit Catalogue'}</h1>
            <p className="text-[#6B5E54] font-body mt-1">Add details and showcase items below.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-[#C4975A] hover:bg-[#B38549] text-white rounded-xl font-body px-6 shadow-warm-md hover:shadow-warm-lg transition-all">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Catalogue
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-[#CDC0B0] bg-white rounded-3xl shadow-warm-sm overflow-hidden">
            <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4">
              <CardTitle className="font-heading text-xl text-[#2C2621]">Catalogue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label className="font-body text-[#2C2621] font-medium">Name</Label>
                <Input 
                  list="catalogue-names"
                  placeholder="e.g. Modern Kitchens 2024" 
                  value={catalogue.name} 
                  onChange={e => setCatalogue({...catalogue, name: e.target.value})} 
                  className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body text-[#2C2621] font-medium">Description</Label>
                <Textarea 
                  placeholder="Briefly describe this catalogue..." 
                  className="resize-none h-28 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body"
                  value={catalogue.description}
                  onChange={e => setCatalogue({...catalogue, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#CDC0B0] shadow-warm-sm">
            <h2 className="text-xl font-heading font-bold text-[#2C2621] flex items-center gap-3">
              Catalogue Items 
              <Badge className="bg-[#EEDDCC] text-[#2C2621] hover:bg-[#EEDDCC] font-body font-medium">{catalogue.items.length} / 3 Max</Badge>
            </h2>
            <Button 
              variant="outline" 
              onClick={addItem} 
              disabled={catalogue.items.length >= 3}
              className="border-[#C4975A] text-[#C4975A] hover:bg-[#C4975A]/10 hover:text-[#C4975A] rounded-xl font-body disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          {catalogue.items.length === 0 ? (
            <div className="border-2 border-dashed border-[#CDC0B0] rounded-3xl p-16 text-center bg-white">
              <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#CDC0B0]/50">
                <Plus className="h-8 w-8 text-[#CDB79E]" />
              </div>
              <h3 className="text-lg font-heading font-bold text-[#2C2621] mb-2">No Items Added</h3>
              <p className="text-[#6B5E54] font-body max-w-sm mx-auto">
                Click "Add Item" to start showcasing your designs, products or services in this catalogue.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {catalogue.items.map((item, index) => (
                <Card key={index} className="overflow-hidden border-[#CDC0B0] shadow-warm-sm hover:shadow-warm-md transition-shadow bg-white rounded-3xl relative group">
                  <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="destructive" size="icon" className="h-9 w-9 rounded-full bg-white border border-[#B85C5C]/20 text-[#B85C5C] hover:bg-[#B85C5C] hover:text-white shadow-sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader className="bg-[#FDFBF7] border-b border-[#CDC0B0]/50 pb-4 pt-5 px-6">
                    <div className="pr-12 space-y-3">
                      {/* Service / Product toggle */}
                      <div className="inline-flex rounded-xl border border-[#CDC0B0] bg-white p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => updateItem(index, 'itemType', 'SERVICE')}
                          className={`flex items-center gap-1.5 px-4 h-9 rounded-lg font-body text-sm font-medium transition-colors ${
                            (item.itemType || 'SERVICE') === 'SERVICE'
                              ? 'bg-[#2C2621] text-[#EEDDCC]'
                              : 'text-[#6B5E54] hover:bg-[#EEDDCC]/40'
                          }`}
                        >
                          <Wrench className="h-3.5 w-3.5" /> Service
                        </button>
                        <button
                          type="button"
                          onClick={() => updateItem(index, 'itemType', 'PRODUCT')}
                          className={`flex items-center gap-1.5 px-4 h-9 rounded-lg font-body text-sm font-medium transition-colors ${
                            item.itemType === 'PRODUCT'
                              ? 'bg-[#2C2621] text-[#EEDDCC]'
                              : 'text-[#6B5E54] hover:bg-[#EEDDCC]/40'
                          }`}
                        >
                          <Package className="h-3.5 w-3.5" /> Product
                        </button>
                      </div>

                      <Input
                        list={item.itemType === 'PRODUCT' ? 'item-titles-product' : 'item-titles-service'}
                        placeholder={item.itemType === 'PRODUCT' ? 'Product Title (e.g. Solid Teak Wood Dining Table)' : 'Item Title (e.g. L-Shaped Modular Kitchen)'}
                        value={item.title}
                        onChange={e => updateItem(index, 'title', e.target.value)}
                        className="font-heading font-bold text-lg bg-white border border-[#CDC0B0] hover:border-[#C4975A] focus:border-[#C4975A] transition-all px-4 h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-[#CDB79E] text-[#2C2621] w-full"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="font-body text-[#2C2621] font-medium">
                          {item.itemType === 'PRODUCT' ? 'Price (₹)' : 'Starting Price (₹)'}
                        </Label>
                        <Input
                          type="number"
                          placeholder="e.g. 25000"
                          value={item.startingPrice || ''}
                          onChange={e => updateItem(index, 'startingPrice', e.target.value === '' ? '' : Number(e.target.value))}
                          className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      {item.itemType === 'PRODUCT' ? (
                        <div className="space-y-2">
                          <Label className="font-body text-[#2C2621] font-medium">Availability</Label>
                          <Select
                            value={item.stockStatus || 'IN_STOCK'}
                            onValueChange={(value) => updateItem(index, 'stockStatus', value)}
                          >
                            <SelectTrigger className="rounded-xl border-[#CDC0B0] font-body h-12 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#CDC0B0] rounded-xl">
                              <SelectItem value="IN_STOCK" className="font-body">In Stock</SelectItem>
                              <SelectItem value="MADE_TO_ORDER" className="font-body">Made to Order</SelectItem>
                              <SelectItem value="OUT_OF_STOCK" className="font-body">Out of Stock</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="font-body text-[#2C2621] font-medium">Price Range</Label>
                          <Input
                            list="price-ranges"
                            placeholder="e.g. ₹50,000 - ₹1,00,000"
                            value={item.priceRange || ''}
                            onChange={e => updateItem(index, 'priceRange', e.target.value)}
                            className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                          />
                        </div>
                      )}
                    </div>

                    {item.itemType === 'PRODUCT' ? (
                      (item.stockStatus || 'IN_STOCK') === 'IN_STOCK' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label className="font-body text-[#2C2621] font-medium">Quantity in Stock (optional)</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="e.g. 12"
                              value={item.stockQuantity ?? ''}
                              onChange={e => updateItem(index, 'stockQuantity', e.target.value === '' ? '' : Number(e.target.value))}
                              className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <p className="text-xs font-body text-[#9C8E82]">
                              Shown to customers if you&apos;d like — leave blank to just show &ldquo;In Stock&rdquo;.
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="font-body text-[#2C2621] font-medium">Materials Details</Label>
                          <Input
                            list="materials"
                            placeholder="e.g. Premium Plywood & Laminate"
                            value={item.materialsDetails || ''}
                            onChange={e => updateItem(index, 'materialsDetails', e.target.value)}
                            className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body text-[#2C2621] font-medium">Project Timeline</Label>
                          <Input
                            list="timelines"
                            placeholder="e.g. 3-4 Weeks"
                            value={item.projectTimeline || ''}
                            onChange={e => updateItem(index, 'projectTimeline', e.target.value)}
                            className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="font-body text-[#2C2621] font-medium">Description</Label>
                      <Textarea 
                        value={item.description} 
                        onChange={e => updateItem(index, 'description', e.target.value)} 
                        className="h-24 rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body resize-none"
                      />
                    </div>

                    <div className="space-y-5 pt-6 border-t border-[#CDC0B0]/50">
                      <h3 className="font-heading font-bold text-lg text-[#2C2621]">Media & Assets</h3>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-body text-[#2C2621] font-medium">
                          <ImageIcon className="h-4 w-4 text-[#9C8E82]" /> Item Images
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {item.images?.map((url: string, imgIdx: number) => (
                            <div key={imgIdx} className="relative aspect-square rounded-xl overflow-hidden border border-[#CDC0B0]/50 group">
                              <img src={url} alt={`Item ${imgIdx}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full"
                                  onClick={() => {
                                    const newUrls = [...item.images];
                                    newUrls.splice(imgIdx, 1);
                                    updateItem(index, 'images', newUrls);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {(!item.images || item.images.length < 5) && (
                            <div className="relative aspect-square rounded-xl border-2 border-dashed border-[#CDC0B0] bg-[#FDFBF7] flex flex-col items-center justify-center text-[#9C8E82] hover:border-[#C4975A] hover:bg-[#EEDDCC]/20 transition-colors">
                              {uploadingItemMedia[`${index}-images`] ? (
                                <Loader2 className="w-6 h-6 animate-spin text-[#C4975A]" />
                              ) : (
                                <>
                                  <Plus className="w-6 h-6 mb-1 opacity-50" />
                                  <span className="font-body text-xs">Add Image</span>
                                </>
                              )}
                              <input 
                                type="file" accept="image/jpeg,image/png,image/webp" multiple
                                onChange={(e) => handleItemImageUpload(e, index)}
                                disabled={uploadingItemMedia[`${index}-images`]}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                              />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-body text-[#9C8E82]">Max 5 images allowed.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                        <div className={`space-y-2 ${!isPremium ? 'opacity-60 grayscale-[30%] pointer-events-none' : ''}`}>
                          <Label className="flex items-center gap-2 font-body text-[#2C2621] font-medium">
                            <Video className="h-4 w-4 text-[#9C8E82]" /> Item Video {!isPremium && <Lock className="h-3 w-3 text-[#C4975A] ml-1" />}
                          </Label>
                          {item.videoUrl ? (
                            <div className="flex items-center justify-between p-3 border border-[#CDC0B0] rounded-xl bg-[#FDFBF7]">
                              <span className="text-sm font-body text-[#6B5E54] truncate">Video Uploaded</span>
                              <Button type="button" variant="ghost" size="icon" onClick={() => updateItem(index, 'videoUrl', '')} className="h-8 w-8 text-[#B85C5C] hover:bg-[#B85C5C]/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center p-3 border-2 border-dashed border-[#CDC0B0] rounded-xl bg-[#FDFBF7] hover:border-[#C4975A] transition-colors cursor-pointer">
                              {uploadingItemMedia[`${index}-video`] ? (
                                <span className="text-sm font-body text-[#C4975A] flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
                              ) : (
                                <span className="text-sm font-body text-[#9C8E82]">Click to upload MP4 (Max 50MB)</span>
                              )}
                              <input type="file" accept="video/mp4,video/webm" onChange={(e) => handleVideoUpload(e, index)} disabled={uploadingItemMedia[`${index}-video`]} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                          )}
                        </div>
                        <div className={`space-y-2 ${!isPremium ? 'opacity-60 grayscale-[30%] pointer-events-none' : ''}`}>
                          <Label className="flex items-center gap-2 font-body text-[#2C2621] font-medium">
                            <FileText className="h-4 w-4 text-[#9C8E82]" /> PDF Brochure {!isPremium && <Lock className="h-3 w-3 text-[#C4975A] ml-1" />}
                          </Label>
                          {item.pdfBrochureUrl ? (
                            <div className="flex items-center justify-between p-3 border border-[#CDC0B0] rounded-xl bg-[#FDFBF7]">
                              <span className="text-sm font-body text-[#6B5E54] truncate">PDF Uploaded</span>
                              <Button type="button" variant="ghost" size="icon" onClick={() => updateItem(index, 'pdfBrochureUrl', '')} className="h-8 w-8 text-[#B85C5C] hover:bg-[#B85C5C]/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center p-3 border-2 border-dashed border-[#CDC0B0] rounded-xl bg-[#FDFBF7] hover:border-[#C4975A] transition-colors cursor-pointer">
                              {uploadingItemMedia[`${index}-pdf`] ? (
                                <span className="text-sm font-body text-[#C4975A] flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
                              ) : (
                                <span className="text-sm font-body text-[#9C8E82]">Click to upload PDF (Max 20MB)</span>
                              )}
                              <input type="file" accept="application/pdf" onChange={(e) => handlePdfUpload(e, index)} disabled={uploadingItemMedia[`${index}-pdf`]} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!isPremium && (
                        <div className="bg-[#FFF8E7] border border-[#C4975A]/30 text-[#8C6A3D] text-sm p-3 rounded-xl flex items-center gap-2 font-body mt-2">
                          <Lock className="h-4 w-4 shrink-0" /> 
                          <span>Upgrade to <strong className="font-heading font-bold">Premium</strong> to add Videos and PDF Brochures to your items.</span>
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <datalist id="catalogue-names">
        <option value="Modern Kitchen & Modular Designs" />
        <option value="Luxury Living Room & Seating Portfolio" />
        <option value="Executive Bedroom & Wardrobe Collection" />
        <option value="Commercial & Residential Electrical Setup" />
        <option value="Premium Plumbing & Sanitary Fixtures" />
        <option value="False Ceiling & Ambient LED Lighting" />
        <option value="Custom Office Furniture & Workstations" />
        <option value="Architectural Interior & Exterior Projects" />
      </datalist>

      <datalist id="item-titles-service">
        <option value="L-Shaped Acrylic Modular Kitchen" />
        <option value="Full-Height Sliding Glass Wardrobe" />
        <option value="Solid Teak Wood 6-Seater Dining Table (Custom Build)" />
        <option value="Minimalist Wall-Mounted TV Unit" />
        <option value="Complete 3BHK Concealed Electrical Wiring" />
        <option value="Home Electrical Safety Inspection & Rewiring" />
        <option value="Luxury Floating Bathroom Vanity with LED Mirror" />
        <option value="Gypsum False Ceiling with Integrated Strip Lights" />
        <option value="Custom Italian Leatherette Sofa Set" />
        <option value="Bathroom & Kitchen Plumbing Installation" />
        <option value="Water Tank & Overhead Pipeline Setup" />
        <option value="Leak Detection & Pipe Repair" />
        <option value="Full Home Interior & Exterior Painting" />
        <option value="Textured Wall Finish & Waterproofing" />
        <option value="Split AC Installation & Servicing" />
        <option value="Central HVAC System Maintenance" />
        <option value="Garden & Landscape Design" />
        <option value="Lawn Maintenance & Irrigation Setup" />
        <option value="Deep Home Cleaning (2/3/4 BHK)" />
        <option value="Office & Commercial Space Cleaning" />
        <option value="Termite & Pest Control Treatment" />
        <option value="General Handyman & Repair Services" />
        <option value="Wooden & Vinyl Flooring Installation" />
        <option value="Local Packing & Moving Service" />
        <option value="Emergency Lock Installation & Repair" />
        <option value="Washing Machine & Refrigerator Repair" />
        <option value="Window & Door Installation" />
        <option value="Automatic Garage Door Setup" />
        <option value="Swimming Pool Cleaning & Maintenance" />
        <option value="Drywall Installation & Ceiling Repair" />
        <option value="Boundary Wall & Masonry Work" />
        <option value="Compound Fencing & Gate Installation" />
      </datalist>

      <datalist id="item-titles-product">
        <option value="Solid Teak Wood Dining Table (6-Seater)" />
        <option value="Modular Kitchen Cabinet Set" />
        <option value="3-Door Sliding Wardrobe" />
        <option value="Designer Wall-Mounted TV Unit" />
        <option value="LED Ceiling Light Fixture" />
        <option value="Modular Switches & Wiring Kit" />
        <option value="Water Purifier / RO System" />
        <option value="Bathroom Vanity with Mirror Cabinet" />
        <option value="CP Fittings & Sanitary Ware Set" />
        <option value="Interior Emulsion Paint (20L)" />
        <option value="Textured Wallpaper Rolls" />
        <option value="Split AC Unit (1.5 Ton)" />
        <option value="Potted Plants & Landscaping Kit" />
        <option value="Cleaning Supplies & Equipment Kit" />
        <option value="Vinyl / Laminate Flooring (per sq.ft.)" />
        <option value="Smart Door Lock" />
        <option value="Home Appliance Spare Parts" />
        <option value="uPVC Windows & Doors" />
        <option value="Automatic Garage Door Motor Kit" />
        <option value="Decorative Fencing Panels" />
      </datalist>

      <datalist id="price-ranges">
        <option value="Under ₹10,000" />
        <option value="₹10,000 - ₹50,000" />
        <option value="₹50,000 - ₹1,00,000" />
        <option value="₹1,00,000 - ₹5,00,000" />
        <option value="₹5,00,000 - ₹10,00,000" />
        <option value="₹10,00,000+" />
        <option value="Custom Pricing Available" />
        <option value="Free Site Visit & Estimate" />
      </datalist>

      <datalist id="materials">
        <option value="Premium Plywood & High-Gloss Laminate" />
        <option value="Solid Teak Wood" />
        <option value="MDF with Acrylic Finish" />
        <option value="HDF with PU Paint" />
        <option value="Veneer Finish with Polish" />
        <option value="Marine Plywood (Waterproof)" />
        <option value="Stainless Steel & Brass Fittings" />
        <option value="PVC / uPVC Pipes & Fittings" />
        <option value="Asian Paints / Berger Emulsion" />
        <option value="Copper Wiring (ISI Certified)" />
        <option value="Vitrified / Ceramic Tiles" />
        <option value="Aluminium & Glass Panels" />
      </datalist>

      <datalist id="timelines">
        <option value="Same Day" />
        <option value="1-2 Days" />
        <option value="3-5 Days" />
        <option value="1-2 Weeks" />
        <option value="3-4 Weeks" />
        <option value="1-2 Months" />
        <option value="2-3 Months" />
        <option value="3+ Months" />
      </datalist>
    </div>
  );
}
