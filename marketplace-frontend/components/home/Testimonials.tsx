'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Aisha Sharma",
    role: "Homeowner",
    text: "VendorHub made finding an interior designer for our new apartment completely seamless. The quality of professionals here is unmatched.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Vikram Mehta",
    role: "Real Estate Developer",
    text: "The platform's curated list of architects has been a game-changer for our boutique projects. Highly recommend to anyone seeking premium talent.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Priya Patel",
    role: "Restaurateur",
    text: "From concept to execution, the landscaping firm we found on VendorHub transformed our outdoor dining area into an organic oasis.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#EEDDCC] rounded-full blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#CDC0B0] rounded-full blur-3xl opacity-30 -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="font-accent text-3xl text-[#CDB79E] mb-2">Testimonials</h2>
          <h3 className="font-heading text-4xl sm:text-5xl font-bold text-[#2C2621] mb-6">
            Stories of Transformation
          </h3>
          <p className="font-body text-[#6B5E54]">
            Hear from our community of homeowners and businesses who have elevated their spaces with VendorHub professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-warm-sm border border-[#CDC0B0]/30 relative"
            >
              {/* Quote Mark */}
              <div className="absolute top-6 right-8 font-heading text-6xl text-[#EEDDCC] opacity-50">
                "
              </div>
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#C4975A]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="font-body text-[#2C2621] text-lg mb-8 leading-relaxed">
                {testimonial.text}
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#EEDDCC]"
                />
                <div>
                  <h4 className="font-heading font-semibold text-[#2C2621]">{testimonial.name}</h4>
                  <p className="font-body text-sm text-[#9C8E82]">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
