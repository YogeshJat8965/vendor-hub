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

  if (fetching) return <div className="p-20 text-center">Loading...</div>;

  const isPremium = vendorPlan === 'PREMIUM';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vendor/catalogues">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{isNew ? 'Create Catalogue' : 'Edit Catalogue'}</h1>
            <p className="text-slate-500">Add details and showcase items below.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Saving...' : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Catalogue
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catalogue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input 
                  placeholder="e.g. Modern Kitchens 2024" 
                  value={catalogue.name} 
                  onChange={e => setCatalogue({...catalogue, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Briefly describe this catalogue..." 
                  className="resize-none h-24"
                  value={catalogue.description}
                  onChange={e => setCatalogue({...catalogue, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={catalogue.coverImage}
                  onChange={e => setCatalogue({...catalogue, coverImage: e.target.value})}
                />
                <p className="text-xs text-slate-500">Paste an image URL for the catalogue cover.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Catalogue Items 
              <Badge variant="secondary">{catalogue.items.length}</Badge>
            </h2>
            <Button variant="outline" onClick={addItem} className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          {catalogue.items.length === 0 ? (
            <div className="border-2 border-dashed rounded-xl p-12 text-center text-slate-500 bg-slate-50">
              No items added yet. Click "Add Item" to start showcasing your designs.
            </div>
          ) : (
            <div className="space-y-6">
              {catalogue.items.map((item, index) => (
                <Card key={index} className="overflow-hidden border-slate-200 shadow-sm relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Button variant="destructive" size="icon" className="h-8 w-8 opacity-50 hover:opacity-100" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader className="bg-slate-50 border-b pb-4">
                    <div className="pr-12 space-y-1">
                      <Input 
                        value={item.title} 
                        onChange={e => updateItem(index, 'title', e.target.value)} 
                        className="font-semibold text-lg bg-transparent border-transparent hover:border-slate-300 focus:bg-white transition-all px-2 -ml-2"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Starting Price (₹)</Label>
                        <Input 
                          type="number" 
                          value={item.startingPrice} 
                          onChange={e => updateItem(index, 'startingPrice', Number(e.target.value))} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price Range</Label>
                        <Input 
                          placeholder="e.g. ₹50k - ₹1L" 
                          value={item.priceRange || ''} 
                          onChange={e => updateItem(index, 'priceRange', e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        value={item.description} 
                        onChange={e => updateItem(index, 'description', e.target.value)} 
                        className="h-20"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-sm">Media & Assets</h3>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" /> Image URLs (comma separated)
                        </Label>
                        <Input 
                          placeholder="URL1, URL2..." 
                          value={item.images?.join(', ') || ''} 
                          onChange={e => {
                            const urls = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            updateItem(index, 'images', urls);
                          }} 
                        />
                        <p className="text-xs text-slate-500">Max {isPremium ? '7' : '3'} images allowed.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={`space-y-2 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Label className="flex items-center gap-2">
                            <Video className="h-4 w-4" /> Video URL {!isPremium && <Lock className="h-3 w-3 text-orange-500" />}
                          </Label>
                          <Input 
                            placeholder="Video Link" 
                            value={item.videoUrl || ''} 
                            onChange={e => updateItem(index, 'videoUrl', e.target.value)} 
                          />
                        </div>
                        <div className={`space-y-2 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4" /> PDF Brochure {!isPremium && <Lock className="h-3 w-3 text-orange-500" />}
                          </Label>
                          <Input 
                            placeholder="PDF Link" 
                            value={item.pdfBrochureUrl || ''} 
                            onChange={e => updateItem(index, 'pdfBrochureUrl', e.target.value)} 
                          />
                        </div>
                      </div>
                      
                      {!isPremium && (
                        <div className="bg-orange-50 text-orange-600 text-xs p-2 rounded flex items-center gap-2">
                          <Lock className="h-3 w-3" /> Upgrade to Premium to add Videos and PDF Brochures.
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
