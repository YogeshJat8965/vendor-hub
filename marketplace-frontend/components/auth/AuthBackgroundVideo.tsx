'use client';

export function AuthBackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0 bg-[#2C2621]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/2ndvideoHeroSectionKitchen.mp4" type="video/mp4" />
      </video>

      {/* Dark Ambient Overlay for Form Contrast */}
      <div className="absolute inset-0 bg-[#2C2621]/65 backdrop-blur-[2px] z-20" />
    </div>
  );
}
