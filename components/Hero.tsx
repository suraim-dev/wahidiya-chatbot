import React, { useState, useEffect } from 'react';
import { Reveal } from './Reveal';
import { ChevronDown, Crown, Palette, Map, DollarSign, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroProps {
    onNavigate?: (page: string, id?: string) => void;
}

export const HERO_IMAGES = [
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/Slider%20Main.jpg",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/Slider%201.png",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/Slider%202.png",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/Slider%203.jpg"
];

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const handleCTA = () => {
      if (onNavigate) {
          onNavigate('properties');
      }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-charcoal-dark">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
             <div className={`w-full h-full transform transition-transform duration-[6000ms] ease-out ${
                 index === currentImageIndex ? 'scale-110' : 'scale-100'
             }`}>
                <img 
                    src={src} 
                    alt={`Luxury Estate ${index + 1}`} 
                    className="w-full h-full object-cover opacity-60"
                />
             </div>
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-4 md:px-12 h-full flex items-end pb-8 md:pb-12">
        <div className="w-full max-w-4xl">
            {/* Text Content */}
            <div className="flex flex-col items-start text-left gap-2 md:gap-6">
                <Reveal type="slide-up" delay={0.2}>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-semibold text-white leading-tight tracking-tight drop-shadow-2xl pb-1">
                        Discover luxury live with<br />
                        <span className="text-gold-400">pride</span> & confidence.
                    </h1>
                </Reveal>
                
                <Reveal type="slide-up" delay={0.4}>
                    <p className="text-white/80 text-[10px] sm:text-sm md:text-lg font-sans font-light leading-relaxed max-w-4xl tracking-tight">
                        RANGAPORI helps you explore high-end homes across top neighborhoods with<br /> expert insight, curated tours, and a smooth buying experience from start to finish.
                    </p>
                </Reveal>

                <Reveal type="slide-up" delay={0.6}>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <button 
                            onClick={() => onNavigate && onNavigate('properties')}
                            className="group relative px-8 py-3 bg-transparent border-[0.5px] border-white overflow-hidden transition-all duration-300 hover:border-gold-400"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gold-400 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                            <span className="relative z-10 text-white font-sans font-bold text-xs md:text-sm uppercase tracking-widest group-hover:text-charcoal-dark transition-colors duration-300">
                                View Properties
                            </span>
                        </button>
                    </div>
                </Reveal>
            </div>
        </div>
      </div>
    </div>
  );
};