'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft, Play, FileText, ChevronLeft, ChevronRight, Calendar, Layers, DollarSign, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { QuoteRequestDialog } from '@/components/dialogs/QuoteRequestDialog';

function HeroCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((curr) => (curr === images.length - 1 ? 0 : curr + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] md:aspect-auto md:h-full bg-[#FDFBF7] flex items-center justify-center border border-[#CDC0B0] rounded-3xl">
        <span className="text-[#9C8E82] font-body">No images available</span>
      </div>
    );
  }

  const prev = () => setCurrentIndex(curr => (curr === 0 ? images.length - 1 : curr - 1));
  const next = () => setCurrentIndex(curr => (curr === images.length - 1 ? 0 : curr + 1));

  return (
    <div className="absolute inset-0 overflow-hidden group bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${title} - image ${currentIndex + 1}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      
      {images.length > 1 && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-[#C4975A]' : 'w-2 bg-white/60 hover:bg-white'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CatalogueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [catalogue, setCatalogue] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteServiceType, setQuoteServiceType] = useState('');
  const [quoteDescription, setQuoteDescription] = useState('');

  useEffect(() => {
    if (params.id) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      fetch(`${apiUrl}/api/catalogues/${params.id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setCatalogue(data);
            if (data.vendorId) {
              fetch(`${apiUrl}/api/explore/id/${data.vendorId}/profile`)
                .then(vRes => vRes.json())
                .then(vData => {
                  if (!vData.error) setVendor(vData);
                })
                .catch(console.error);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-[#CDC0B0] border-t-[#C4975A] rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!catalogue) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col justify-center items-center text-center p-8">
          <h1 className="text-3xl font-heading font-bold text-[#2C2621] mb-4">Catalogue not found</h1>
          <Button onClick={() => router.back()} className="bg-[#C4975A] hover:bg-[#B38549]">Go Back</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Collect all images from the catalogue
  const allImages = catalogue ? [
    catalogue.coverImage,
    ...(catalogue.items || []).flatMap((item: any) => item.images || [])
  ].filter(Boolean) : [];
  
  const images = Array.from(new Set(allImages));

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#EEDDCC] selection:text-[#2C2621]">
      <Header />

      <main className="flex-1">
        {/* Global Hero Carousel */}
        <section className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] bg-black overflow-hidden group">
          {/* Back Button Floating Top Left */}
          <div className="absolute top-6 left-6 z-50">
            <Button 
              onClick={() => router.back()} 
              className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/20 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
          </div>

          <HeroCarousel images={images} title={catalogue.name} />
        </section>

        {/* Catalogue Items Details */}
        <section className="py-16 bg-[#FDFBF7]">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="mb-12">
              <Badge className="bg-[#EEDDCC] text-[#8C6A3D] hover:bg-[#EEDDCC] mb-4 text-sm py-1.5 px-4 font-body border border-[#C4975A]/20">
                {catalogue.type === 'PREMIUM' ? 'Premium Catalogue' : 'Catalogue'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-heading font-black text-[#2C2621] mb-4">
                {catalogue.name}
              </h1>
              {catalogue.description && (
                <p className="text-lg font-body text-[#6B5E54] leading-relaxed">
                  {catalogue.description}
                </p>
              )}
            </div>

            <div className="space-y-12">
              {catalogue.items?.map((item: any, index: number) => (
                <div key={item.id || index} className="bg-white rounded-[2rem] p-8 lg:p-10 border border-[#CDC0B0]/40 shadow-warm-sm hover:shadow-warm-md transition-shadow">
                  <div className="mb-8">
                    <h3 className="text-2xl md:text-3xl font-heading font-bold text-[#2C2621] mb-3">{item.title}</h3>
                    {item.description && (
                      <p className="text-[#6B5E54] font-body text-lg leading-relaxed">{item.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FDFBF7] p-6 rounded-3xl border border-[#CDC0B0]/40 mb-8">
                    {item.startingPrice > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-[#9C8E82] font-body text-sm mb-1">
                          <DollarSign className="w-4 h-4" /> Starting Price
                        </div>
                        <div className="font-heading font-bold text-xl text-[#2C2621]">₹{item.startingPrice.toLocaleString('en-IN')}</div>
                      </div>
                    )}
                    
                    {item.priceRange && (
                      <div>
                        <div className="flex items-center gap-2 text-[#9C8E82] font-body text-sm mb-1">
                          <DollarSign className="w-4 h-4" /> Price Range
                        </div>
                        <div className="font-body font-medium text-[#2C2621]">{item.priceRange}</div>
                      </div>
                    )}

                    {item.materialsDetails && (
                      <div>
                        <div className="flex items-center gap-2 text-[#9C8E82] font-body text-sm mb-1">
                          <Layers className="w-4 h-4" /> Materials
                        </div>
                        <div className="font-body font-medium text-[#2C2621]">{item.materialsDetails}</div>
                      </div>
                    )}

                    {item.projectTimeline && (
                      <div>
                        <div className="flex items-center gap-2 text-[#9C8E82] font-body text-sm mb-1">
                          <Calendar className="w-4 h-4" /> Timeline
                        </div>
                        <div className="font-body font-medium text-[#2C2621]">{item.projectTimeline}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                      {item.videoUrl && (
                        <Button asChild variant="outline" className="rounded-xl font-body border-[#C4975A] text-[#C4975A] hover:bg-[#C4975A] hover:text-white flex-1 sm:flex-none">
                          <a href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Play className="w-4 h-4 mr-2" /> Watch Video
                          </a>
                        </Button>
                      )}
                      {item.pdfBrochureUrl && (
                        <Button asChild variant="outline" className="rounded-xl font-body border-[#6B5E54] text-[#6B5E54] hover:bg-[#6B5E54] hover:text-white flex-1 sm:flex-none">
                          <a href={item.pdfBrochureUrl} target="_blank" rel="noopener noreferrer" download>
                            <FileText className="w-4 h-4 mr-2" /> Download Brochure
                          </a>
                        </Button>
                      )}
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto rounded-xl font-body font-bold bg-[#C4975A] hover:bg-[#B38549] text-white shadow-warm-md hover:shadow-warm-lg transition-all"
                      onClick={() => {
                        setQuoteServiceType(`Quote for: ${item.title} (${catalogue.name})`);
                        setQuoteDescription(`I'm interested in the "${item.title}" design from your "${catalogue.name}" catalogue. Please provide more details and a quote.`);
                        setShowQuoteDialog(true);
                      }}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Get Quote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {vendor && (
        <QuoteRequestDialog 
          open={showQuoteDialog} 
          onOpenChange={setShowQuoteDialog}
          vendorSlug={vendor.slug}
          vendorName={vendor.businessName || vendor.ownerName || 'Vendor'}
          catalogueId={catalogue.id}
          initialServiceType={quoteServiceType}
          initialDescription={quoteDescription}
        />
      )}
    </div>
  );
}
