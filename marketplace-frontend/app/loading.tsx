import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#CDC0B0]/30 border-t-[#C4975A] rounded-full animate-spin" />
        <p className="font-heading font-medium text-[#9C8E82] tracking-widest uppercase text-sm animate-pulse">
          Loading
        </p>
      </div>
    </div>
  );
}
