'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Folder, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function CataloguesPage() {
  const { user } = useAuth();
  const [catalogues, setCatalogues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchCatalogues();
    }
  }, [user]);

  const fetchCatalogues = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/catalogues?email=${user?.email}`);
      if (!res.ok) throw new Error('Failed to fetch catalogues');
      const data = await res.json();
      setCatalogues(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalogue?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor/catalogues/${id}?email=${user?.email}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete catalogue');
      setCatalogues(catalogues.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Catalogues</h1>
          <p className="text-slate-500 mt-2">Manage and showcase your services and designs.</p>
        </div>
        <Link href="/dashboard/vendor/catalogues/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all">
            <Plus className="mr-2 h-4 w-4" /> Create Catalogue
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
      ) : catalogues.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-blue-100 p-3 rounded-full mb-4">
              <Folder className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Catalogues Yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm text-center">
              Create your first catalogue to showcase your designs and services to potential customers.
            </p>
            <Link href="/dashboard/vendor/catalogues/new">
              <Button variant="outline">Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogues.map((catalogue, index) => (
            <motion.div
              key={catalogue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 bg-slate-200 relative">
                  {catalogue.coverImage ? (
                    <img 
                      src={catalogue.coverImage.startsWith('http') ? catalogue.coverImage : `${process.env.NEXT_PUBLIC_API_URL}${catalogue.coverImage}`} 
                      alt={catalogue.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <ImageIcon className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                  <Badge className="absolute top-4 right-4 bg-white/90 text-slate-900 border-none shadow-sm backdrop-blur-sm">
                    {catalogue.type === 'PREMIUM' ? '✨ Premium' : 'Basic'}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{catalogue.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{catalogue.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>{catalogue.items?.length || 0} Items</span>
                    <span>Last updated: {new Date(catalogue.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-slate-50/50 pt-4">
                  <Link href={`/dashboard/vendor/catalogues/${catalogue.id}`}>
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(catalogue.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
