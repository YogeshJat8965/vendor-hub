'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Video, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function CatalogueBuilderPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [vendorPlan, setVendorPlan] = useState('BASIC');

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/profile?email=${user?.email}`);
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
      // Actually we need to fetch catalogue by id. 
      // But we didn't expose a direct GET /vendor/catalogues/{id} yet, only the public one or all.
      // Let's use the public one since it fetches by ID
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/catalogues/${id}`); 
      // Wait, is there a GET by ID endpoint? I created getVendorCatalogues but did I create getCatalogueById public endpoint?
      // Ah, I need to fetch all and filter, or create a specific endpoint.
      const allRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/catalogues?email=${user?.email}`);
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
    
    try {
      setLoading(true);
      const url = isNew 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/catalogues?email=${user?.email}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/vendor/catalogues/${id}?email=${user?.email}`;
        
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    const maxItems = vendorPlan === 'PREMIUM' ? 30 : 10;
    if (catalogue.items.length >= maxItems) {
      return alert(`Your ${vendorPlan} plan allows maximum ${maxItems} items per catalogue.`);
    }
    setCatalogue({
      ...catalogue,
      items: [
        ...catalogue.items,
        {
          title: 'New Design',
          description: '',
          startingPrice: 0,
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
              <div className="space-y-2">
                <Label className="font-body text-[#2C2621] font-medium">Cover Image URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={catalogue.coverImage}
                  onChange={e => setCatalogue({...catalogue, coverImage: e.target.value})}
                  className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                />
                <p className="text-xs font-body text-[#9C8E82] mt-1">Paste an image URL for the catalogue cover.</p>
              </div>
              {catalogue.coverImage && (
                <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-[#CDC0B0]/50 bg-[#FDFBF7]">
                  <img src={catalogue.coverImage} alt="Cover preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#CDC0B0] shadow-warm-sm">
            <h2 className="text-xl font-heading font-bold text-[#2C2621] flex items-center gap-3">
              Catalogue Items 
              <Badge className="bg-[#EEDDCC] text-[#2C2621] hover:bg-[#EEDDCC] font-body font-medium">{catalogue.items.length}</Badge>
            </h2>
            <Button variant="outline" onClick={addItem} className="border-[#C4975A] text-[#C4975A] hover:bg-[#C4975A]/10 hover:text-[#C4975A] rounded-xl font-body">
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
                    <div className="pr-12 space-y-1">
                      <Input 
                        value={item.title} 
                        onChange={e => updateItem(index, 'title', e.target.value)} 
                        className="font-heading font-bold text-xl bg-transparent border-transparent hover:border-[#CDC0B0] focus:bg-white focus:border-[#CDB79E] transition-all px-3 -ml-3 h-12 shadow-none focus-visible:ring-1 focus-visible:ring-[#CDB79E] text-[#2C2621]"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="font-body text-[#2C2621] font-medium">Starting Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={item.startingPrice} 
                          onChange={e => updateItem(index, 'startingPrice', Number(e.target.value))} 
                          className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body text-[#2C2621] font-medium">Price Range</Label>
                        <Input 
                          placeholder="e.g. ₹50k - ₹1L" 
                          value={item.priceRange || ''} 
                          onChange={e => updateItem(index, 'priceRange', e.target.value)} 
                          className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                        />
                      </div>
                    </div>
                    
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
                          <ImageIcon className="h-4 w-4 text-[#9C8E82]" /> Image URLs (comma separated)
                        </Label>
                        <Input 
                          placeholder="URL1, URL2..." 
                          value={item.images?.join(', ') || ''} 
                          onChange={e => {
                            const urls = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            updateItem(index, 'images', urls);
                          }} 
                          className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12"
                        />
                        <p className="text-xs font-body text-[#9C8E82]">Max {isPremium ? '7' : '3'} images allowed.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className={`space-y-2 ${!isPremium ? 'opacity-60 grayscale-[30%] pointer-events-none relative' : ''}`}>
                          <Label className="flex items-center gap-2 font-body text-[#2C2621] font-medium">
                            <Video className="h-4 w-4 text-[#9C8E82]" /> Video URL {!isPremium && <Lock className="h-3 w-3 text-[#C4975A] ml-1" />}
                          </Label>
                          <Input 
                            placeholder="Video Link" 
                            value={item.videoUrl || ''} 
                            onChange={e => updateItem(index, 'videoUrl', e.target.value)} 
                            className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12 bg-white"
                          />
                        </div>
                        <div className={`space-y-2 ${!isPremium ? 'opacity-60 grayscale-[30%] pointer-events-none relative' : ''}`}>
                          <Label className="flex items-center gap-2 font-body text-[#2C2621] font-medium">
                            <FileText className="h-4 w-4 text-[#9C8E82]" /> PDF Brochure {!isPremium && <Lock className="h-3 w-3 text-[#C4975A] ml-1" />}
                          </Label>
                          <Input 
                            placeholder="PDF Link" 
                            value={item.pdfBrochureUrl || ''} 
                            onChange={e => updateItem(index, 'pdfBrochureUrl', e.target.value)} 
                            className="rounded-xl border-[#CDC0B0] focus-visible:ring-[#CDB79E] font-body h-12 bg-white"
                          />
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
    </div>
  );
}
