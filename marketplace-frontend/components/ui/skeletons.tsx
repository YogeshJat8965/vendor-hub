export function VendorCardSkeleton() {
  return (
    <div className="animate-pulse bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-warm-sm border border-[#CDC0B0]/30">
      <div className="h-48 bg-[#EEDDCC]" />
      <div className="p-6 space-y-3">
        <div className="h-6 bg-[#EEDDCC] rounded-lg w-3/4" />
        <div className="h-4 bg-[#EEDDCC] rounded-lg w-1/2" />
        <div className="h-4 bg-[#EEDDCC] rounded-lg w-2/3" />
        <div className="h-12 bg-[#EEDDCC] rounded-xl w-full mt-4" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 max-w-6xl mx-auto py-8 px-4 sm:px-8">
      <div className="h-10 bg-[#EEDDCC] rounded-xl w-1/3" />
      <div className="h-5 bg-[#EEDDCC] rounded-lg w-2/3" />
      <div className="h-5 bg-[#EEDDCC] rounded-lg w-1/2" />
    </div>
  );
}

export function VendorProfileSkeleton() {
  return (
    <div className="animate-pulse min-h-screen bg-[#FDFBF7] rounded-3xl overflow-hidden">
      {/* Banner */}
      <div className="h-64 sm:h-80 bg-[#EEDDCC]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="h-10 bg-[#EEDDCC] rounded-xl w-1/2" />
              <div className="h-5 bg-[#EEDDCC] rounded-lg w-3/4" />
              <div className="h-5 bg-[#EEDDCC] rounded-lg w-2/3" />
            </div>
            
            {/* Gallery */}
            <div className="grid grid-cols-2 gap-4 mt-12">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 sm:h-64 bg-[#EEDDCC] rounded-2xl" />
              ))}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="h-40 bg-[#EEDDCC] rounded-3xl" />
            <div className="h-64 bg-[#EEDDCC] rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
