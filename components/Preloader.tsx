import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onTransitionStart: () => void;
  onComplete: () => void;
  isLoaded: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ onTransitionStart, onComplete, isLoaded }) => {
  const [count, setCount] = useState(0);
  const [showContent, setShowContent] = useState(true);
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    // Phase 1: Counting
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) return 100;

        // Logic for Initial Load (if network is slow)
        if (!isLoaded) {
            if (prev < 80) {
                const jump = Math.random() * 2 + 0.5;
                return Math.min(prev + jump, 80);
            } else if (prev < 90) {
                return prev + 0.2;
            } else {
                return prev + 0.05 < 98 ? prev + 0.05 : 98;
            }
        } 
        
        // Logic for Page Transitions (Content Ready)
        // We set a fixed, smooth increment so the user always sees the animation (~1.5s duration)
        const jump = 2.5; 
        return Math.min(prev + jump, 100);
      });
    }, 40);

    return () => clearInterval(timer);
  }, [isLoaded]);

  useEffect(() => {
    if (count >= 100) {
      // Phase 2: Fade out text (Logo + Counter)
      const t1 = setTimeout(() => {
        setShowContent(false);
      }, 200);

      // Phase 3: Wait on black screen, then trigger App Reveal & Slide Up
      const t2 = setTimeout(() => {
        onTransitionStart(); // Reveal underlying app content
        setSlideUp(true);    // Start sliding curtain up
      }, 1000); // 800ms of pure black screen

      // Phase 4: Unmount
      const t3 = setTimeout(() => {
        onComplete();
      }, 2200); // 1000 delay + 1200 transition

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [count, onTransitionStart, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#0F0F0F] transition-transform duration-[1200ms] ease-luxury will-change-transform ${
        slideUp ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div 
        className={`flex flex-col items-center gap-6 transition-opacity duration-700 ease-out ${
          showContent ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
        }`}
      >
         {/* Logo Icon - Responsive sizes */}
         <div className="relative w-32 h-32 md:w-64 md:h-64 flex items-center justify-center mb-2">
            <img 
              src="https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Main%20logo/preloader.png" 
              alt="Rangapori Real Estate" 
              className="w-full h-full object-contain"
              loading="eager"
              fetchPriority="high"
            />
         </div>
         
         {/* Percentage */}
         <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <span className="text-4xl md:text-8xl font-sans font-thin text-white tracking-tighter tabular-nums">
                    {Math.round(count)}
                </span>
                <span className="absolute top-0 md:top-2 -right-3 md:-right-4 text-xs md:text-lg font-light text-gold-400">%</span>
            </div>
            <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white/40 animate-pulse">
                Loading Experience
            </span>
         </div>
      </div>
    </div>
  );
};