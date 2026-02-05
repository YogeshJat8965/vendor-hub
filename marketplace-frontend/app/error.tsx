'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              <span className="gradient-text">Oops!</span>
            </h1>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Something Went Wrong</h2>
            <p className="text-lg text-gray-600 mb-2">
              We encountered an unexpected error while processing your request.
            </p>
            <p className="text-gray-500">
              Our team has been notified and is working to fix the issue.
            </p>
          </motion.div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left"
            >
              <p className="text-sm font-mono text-red-700 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={reset}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 touch-target"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto touch-target">
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
          </motion.div>

          {/* Support Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-12 p-6 bg-white rounded-lg shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-3">
                  If this problem persists, please contact our support team.
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:support@vendorhub.com" className="text-blue-600 hover:underline">
                      support@vendorhub.com
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <strong>Phone:</strong>{' '}
                    <a href="tel:+15551234567" className="text-blue-600 hover:underline">
                      (555) 123-4567
                    </a>
                  </p>
                  {error.digest && (
                    <p className="text-gray-500 mt-2">
                      Reference ID: <code className="bg-gray-100 px-2 py-1 rounded">{error.digest}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
