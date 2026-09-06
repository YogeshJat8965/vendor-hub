import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { TrustMarquee } from '@/components/home/TrustMarquee';
import { ServicesCarousel } from '@/components/home/ServicesCarousel';
import { InteriorDesignGallery } from '@/components/home/InteriorDesignGallery';
import { Testimonials } from '@/components/home/Testimonials';
import { CallToAction } from '@/components/home/CallToAction';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen selection:bg-[#EEDDCC] selection:text-[#2C2621]">
        <Hero />
        <TrustMarquee />
        <InteriorDesignGallery />
        <ServicesCarousel />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
