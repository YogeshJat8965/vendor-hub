'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface MediaViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Cloudinary's fl_attachment flag forces a real download (Content-Disposition:
// attachment) instead of navigating to the file — needed because the plain
// `download` attribute on an <a> is unreliable across origins, and this file
// is served from Cloudinary's domain, not ours. Fine for images/video, which
// Cloudinary already serves with the correct content-type.
function toCloudinaryDownloadUrl(url: string): string {
  return url.includes('/upload/') ? url.replace('/upload/', '/upload/fl_attachment/') : url;
}

// PDFs are uploaded as Cloudinary "raw" resources (the only way to avoid a
// 401 — see MessageController), which always come back as
// application/octet-stream with no filename extension. That's fine for
// storage but means the file won't render inline and downloads look
// unverified to the browser. Our own backend fetches the raw bytes and
// re-serves them with the real PDF content-type and a proper filename.
function toPdfProxyUrl(url: string, download: boolean): string {
  return `${API_BASE}/media/pdf?url=${encodeURIComponent(url)}&download=${download}`;
}

export function MediaViewerDialog({ isOpen, onClose, url, type }: MediaViewerDialogProps) {
  if (!url || !type) return null;

  const previewUrl = type === 'PDF' ? toPdfProxyUrl(url, false) : url;
  const downloadUrl = type === 'PDF' ? toPdfProxyUrl(url, true) : toCloudinaryDownloadUrl(url);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-[#1A1712] border-none rounded-3xl" showCloseButton={true}>
        <DialogTitle className="sr-only">
          {type === 'IMAGE' ? 'Image preview' : type === 'VIDEO' ? 'Video preview' : 'PDF preview'}
        </DialogTitle>

        <div className="flex items-center justify-center min-h-[50vh] max-h-[80vh] bg-black">
          {type === 'IMAGE' && (
            <img src={previewUrl} alt="Shared attachment" className="max-w-full max-h-[80vh] object-contain" />
          )}
          {type === 'VIDEO' && (
            <video src={previewUrl} controls autoPlay className="max-w-full max-h-[80vh]" />
          )}
          {type === 'PDF' && (
            <iframe src={previewUrl} title="PDF preview" className="w-full h-[80vh] bg-white" />
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#2C2621]">
          <div className="flex items-center gap-2 text-[#EEDDCC] font-body text-sm min-w-0">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="truncate">{type === 'PDF' ? 'PDF Document' : type === 'VIDEO' ? 'Video' : 'Image'}</span>
          </div>
          <Button asChild size="sm" className="bg-[#C4975A] hover:bg-[#B38549] text-white rounded-xl font-body shrink-0">
            <a href={downloadUrl} download>
              <Download className="w-4 h-4 mr-2" /> Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
