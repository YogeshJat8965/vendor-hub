'use client';

import { motion } from 'framer-motion';
import { Users, Target, Heart, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const stats = [
  { label: 'Active Vendors', value: '500+', icon: Users },
  { label: 'Happy Customers', value: '10,000+', icon: Heart },
  { label: 'Services Completed', value: '25,000+', icon: CheckCircle },
  { label: 'Customer Satisfaction', value: '98%', icon: Award },
];

const values = [
  {
    title: 'Trust & Transparency',
    description: 'We verify all vendors and maintain transparent pricing to build trust between customers and service providers.',
    icon: CheckCircle,
  },
  {
    title: 'Quality Service',
    description: 'Only the best vendors make it to our platform. We ensure quality through rigorous vetting and customer reviews.',
    icon: Award,
  },
  {
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We provide 24/7 support and guarantee quality workmanship on all services.',
    icon: Heart,
  },
  {
    title: 'Innovation',
    description: 'We continuously improve our platform with the latest technology to make finding and booking services effortless.',
    icon: TrendingUp,
  },
];

const team = [
  {
    name: 'John Smith',
    role: 'CEO & Founder',
    bio: '15+ years in home services industry',
    initial: 'J',
  },
  {
    name: 'Sarah Johnson',
    role: 'Head of Operations',
    bio: 'Expert in vendor relations',
    initial: 'S',
  },
  {
    name: 'Mike Williams',
    role: 'CTO',
    bio: 'Tech innovator and platform architect',
    initial: 'M',
  },
  {
    name: 'Emily Chen',
    role: 'Customer Success Lead',
    bio: 'Passionate about customer experience',
    initial: 'E',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About VendorHub
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-white/90">
              Connecting homeowners with trusted local service providers since 2020
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 touch-target">
                  Find Services
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 touch-target">
                  Become a Vendor
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} variants={itemVariants}>
                  <Card className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-gray-600">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Target className="w-16 h-16 mx-auto mb-6 text-blue-600" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                To simplify the process of finding and hiring trusted local service providers by creating a transparent, 
                efficient marketplace that benefits both homeowners and skilled professionals. We believe everyone deserves 
                access to quality home services without the hassle of endless searching and uncertainty.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} variants={itemVariants}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Passionate people building the future of home services</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
          >
            {team.map((member) => (
              <motion.div key={member.name} variants={itemVariants}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{member.initial}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join thousands of satisfied customers and vendors on our platform today
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 touch-target">
                  Find a Service Provider
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 touch-target">
                  List Your Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
