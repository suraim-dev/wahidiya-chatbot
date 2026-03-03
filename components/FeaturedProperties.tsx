import React, { useRef, useEffect, useState } from 'react';
import { Property } from '../types';
import { Bed, Bath, Maximize2, ChevronRight, ChevronLeft, ArrowRight, Heart, GitCompare } from 'lucide-react';
import { Reveal } from './Reveal';
import { supabase } from '../services/supabaseClient';

interface FeaturedPropertiesProps {
  onNavigate?: (page: string, id?: string) => void;
  showUI?: boolean;
  initialData?: Property[];
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ onNavigate, showUI = true, initialData }) => {
  const [properties, setProperties] = useState<Property[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);

  // Update properties if initialData changes (e.g. late load)
  useEffect(() => {
    if (initialData && initialData.length > 0) {
        setProperties(initialData);
        setIsLoading(false);
    }
  }, [initialData]);

  // Load state from localStorage on mount
  useEffect(() => {
      const loadLocalState = () => {
          const favs = localStorage.getItem('favorites');
          if (favs) {
              try {
                  const parsed = JSON.parse(favs);
                  setFavorites(parsed.map((p: Property) => p.id));
              } catch (e) {}
          }

          const comp = localStorage.getItem('compareList');
          if (comp) {
              try {
                  const parsed = JSON.parse(comp);
                  setCompareList(parsed.map((p: Property) => p.id));
              } catch (e) {}
          }
      };
      loadLocalState();
      
      const handleStorage = () => loadLocalState();
      window.addEventListener('compare-updated', handleStorage);
      return () => {
          window.removeEventListener('compare-updated', handleStorage);
      }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, prop: Property) => {
      e.stopPropagation();
      const stored = localStorage.getItem('favorites');
      let currentFavs: Property[] = stored ? JSON.parse(stored) : [];
      
      const exists = currentFavs.find(p => p.id === prop.id);
      if (exists) {
          currentFavs = currentFavs.filter(p => p.id !== prop.id);
      } else {
          currentFavs.push(prop);
      }
      
      localStorage.setItem('favorites', JSON.stringify(currentFavs));
      setFavorites(currentFavs.map(p => p.id));
  };

  const toggleCompare = (e: React.MouseEvent, prop: Property) => {
      e.stopPropagation();
      const stored = localStorage.getItem('compareList');
      let currentCompare: Property[] = stored ? JSON.parse(stored) : [];
      
      const exists = currentCompare.find(p => p.id === prop.id);
      if (exists) {
          currentCompare = currentCompare.filter(p => p.id !== prop.id);
      } else {
          if (currentCompare.length >= 3) {
              alert("You can only compare up to 3 properties.");
              return;
          }
          currentCompare.push(prop);
      }
      
      localStorage.setItem('compareList', JSON.stringify(currentCompare));
      setCompareList(currentCompare.map(p => p.id));
      window.dispatchEvent(new Event('compare-updated'));
  };

  useEffect(() => {
    // Only fetch if we didn't receive initial data
    if (initialData && initialData.length > 0) return;

    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('featured', true); // Fetch only featured

        if (error) {
          console.error('Supabase Error:', JSON.stringify(error, null, 2));
        } else if (data && data.length > 0) {
          // Map DB columns to Property interface
          const formattedProperties: Property[] = data.map((item: any) => ({
            id: item.id?.toString() || Math.random().toString(),
            title: item.title,
            location: item.location,
            price: item.price,
            image: item.imageUrl || item.imageUrl_url, 
            beds: item.beds,
            baths: item.baths,
            sqft: item.sqft,
            tag: item.tag || 'Sale',
            garage: item.garage || item.garages || 0, // Fallback logic for safety
            type: item.type || 'Residential',
            features: item.features || [],
            facilities: item.facilities || []
          }));
          setProperties(formattedProperties);
        }
      } catch (err) {
        console.error('Unexpected error fetching properties:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [initialData]);

  const getScrollMetrics = () => {
    if (!scrollContainerRef.current) return null;
    const container = scrollContainerRef.current;
    
    // Attempt to find the first item width dynamically
    const item = container.querySelector('.snap-start') as HTMLElement;
    
    let itemWidth = 350; // default desktop fallback
    if (item) {
        itemWidth = item.getBoundingClientRect().width;
    } else {
        // Fallback calculation based on viewport width if item not rendered yet or found
        // On mobile it's 80vw, on MD 350px, on LG 400px
        const vw = window.innerWidth;
        if (vw < 768) itemWidth = vw * 0.8;
        else if (vw < 1024) itemWidth = 350;
        else itemWidth = 400;
    }

    const gap = 24; // 1.5rem gap (gap-6)
    return { container, itemWidth, gap };
  };

  const handlePrevSlide = () => {
    const metrics = getScrollMetrics();
    if (!metrics) return;
    const { container, itemWidth, gap } = metrics;
    const scrollAmount = itemWidth + gap;

    if (container.scrollLeft <= 20) {
      // Loop to end
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNextSlide = () => {
    const metrics = getScrollMetrics();
    if (!metrics) return;
    const { container, itemWidth, gap } = metrics;
    const scrollAmount = itemWidth + gap;
    
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    if (container.scrollLeft >= maxScroll - 30) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (!isPausedRef.current) {
          handleNextSlide();
      }
    }, 4000); // 4 seconds per slide
  };

  useEffect(() => {
    // Only start auto-scroll if UI is shown (preloader finished)
    if (properties.length > 0 && showUI) {
        startAutoScroll();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [properties, showUI]);

  const handleManualNext = () => {
    handleNextSlide();
  };

  // Touch handlers to pause auto-scroll (only on touch interactions)
  const pauseScroll = () => { isPausedRef.current = true; };
  const resumeScroll = () => { isPausedRef.current = false; };

  const handleViewAll = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onNavigate) {
          onNavigate('properties');
          window.scrollTo(0, 0);
      }
  };

  const handlePropertyClick = (id: string) => {
      if (onNavigate) {
          onNavigate('property-details', id);
      }
  };

  if (isLoading) {
    return (
        <section className="py-32 bg-charcoal text-white flex justify-center items-center">
             <div className="flex flex-col items-center gap-4">
                 <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-xs uppercase tracking-widest text-white/50">Loading Properties...</p>
             </div>
        </section>
    );
  }

  // If no properties loaded (and not loading), hide section or show message
  if (properties.length === 0) {
      return null;
  }

  return (
    <section id="properties" className="pt-4 pb-32 bg-charcoal text-white relative">
      {/* Inline styles to guarantee scrollbar is hidden */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header Section */}
      <div className="relative mb-24 px-6">
         {/* Background Text */}
         <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
             <Reveal type="fade" delay={0.1}>
                <span className="text-[13vw] md:text-[6vw] font-sans font-bold text-[#1A1A1A] tracking-wider leading-none">
                    FEATURED
                </span>
             </Reveal>
         </div>

         {/* Foreground Content */}
         <div className="relative z-10 flex flex-col items-center justify-center text-center gap-6">
             <Reveal type="slide-up">
                 <div className="flex items-center gap-2 md:gap-4 justify-center">
                     {/* Lines and Text in Gold */}
                     <span className="w-8 md:w-16 h-[1px] bg-gold-400"></span>
                     <h3 className="text-gold-400 font-sans text-xs md:text-sm font-bold uppercase tracking-[0.2em] leading-none">
                         FEATURED
                     </h3>
                     <span className="w-8 md:w-16 h-[1px] bg-gold-400"></span>
                 </div>
             </Reveal>

             <Reveal type="slide-up" delay={0.2}>
                 <h2 className="text-3xl md:text-4xl lg:text-5xl font-sans font-light text-white uppercase tracking-wider">
                     LATEST LAUNCHES
                 </h2>
             </Reveal>
         </div>
      </div>

      {/* Slider Container */}
      <div 
        className="relative group/slider" 
        onTouchStart={pauseScroll}
        onTouchEnd={resumeScroll}
      >
        
        {/* Left Navigation Button */}
        <button
            onClick={handlePrevSlide}
            className={`flex absolute left-4 md:left-12 top-[45%] -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 bg-charcoal/60 backdrop-blur-md items-center justify-center text-white hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-700 ease-luxury group shadow-2xl overflow-hidden ${showUI ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}
            aria-label="Previous Project"
        >
             {/* Hover Effect Background */}
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             
             <ChevronLeft size={28} className="relative z-10 transform group-hover:-translate-x-1 transition-transform duration-300" />
        </button>

        {/* Horizontal Scroll with Hidden Scrollbar */}
        <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 px-6 pb-12 hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing scroll-smooth"
            style={{ paddingLeft: 'max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))' }}
        >
            {properties.map((prop, idx) => (
            <div 
                key={prop.id} 
                className="group min-w-[80vw] md:min-w-[350px] lg:min-w-[400px] snap-start relative cursor-pointer"
                onClick={() => handlePropertyClick(prop.id)}
            >
                <Reveal type="fade" delay={idx * 0.1} className="h-full">
                    <div className="relative aspect-[3/4] overflow-hidden bg-charcoal-light">
                        {/* Image with Scale Effect */}
                        <img 
                            src={prop.image} 
                            alt={prop.title} 
                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                        
                        {/* Top Tag */}
                        <div className="absolute top-6 left-6 z-20">
                            <div className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-white">
                                {prop.tag}
                            </div>
                        </div>

                         {/* Compare and Save Buttons (Top Right) */}
                         <div className="absolute top-6 right-6 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                    className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${compareList.includes(prop.id) ? 'bg-gold-400 text-charcoal border-gold-400' : 'bg-black/50 border-white/20 text-white hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal'}`}
                                    title="Compare"
                                    onClick={(e) => toggleCompare(e, prop)}
                                >
                                    <GitCompare size={16} />
                                </button>
                                <button 
                                    className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${favorites.includes(prop.id) ? 'bg-gold-400 text-charcoal border-gold-400' : 'bg-black/50 border-white/20 text-white hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal'}`}
                                    title="Save"
                                    onClick={(e) => toggleFavorite(e, prop)}
                                >
                                    <Heart size={16} fill={favorites.includes(prop.id) ? "currentColor" : "none"} />
                                </button>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-luxury">
                                <h3 className="text-3xl font-serif text-white mb-2 leading-tight group-hover:text-gold-300 transition-colors duration-300">
                                    {prop.title}
                                </h3>
                                <p className="text-white/70 font-sans text-sm tracking-wide mb-6">
                                    {prop.location}
                                </p>
                                
                                {/* Divider */}
                                <div className="w-full h-[1px] bg-white/20 mb-6 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100 ease-luxury"></div>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                                        <div className="flex items-center gap-2 text-white/90 text-xs uppercase tracking-wider">
                                            <Bed size={16} className="text-gold-400"/> {prop.beds}
                                        </div>
                                        <div className="flex items-center gap-2 text-white/90 text-xs uppercase tracking-wider">
                                            <Bath size={16} className="text-gold-400"/> {prop.baths}
                                        </div>
                                        <div className="flex items-center gap-2 text-white/90 text-xs uppercase tracking-wider">
                                            <Maximize2 size={16} className="text-gold-400"/> {prop.sqft}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
            ))}
            {/* Spacer for easier end-scrolling */}
            <div className="min-w-[20px]"></div>
        </div>

        {/* Right Navigation Button */}
        <button
            onClick={handleManualNext}
            className={`flex absolute right-4 md:right-12 top-[45%] -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full border border-white/10 bg-charcoal/60 backdrop-blur-md items-center justify-center text-white hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-700 ease-luxury group shadow-2xl overflow-hidden ${showUI ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
            aria-label="Next Project"
        >
             {/* Hover Effect Background */}
             <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             
             <ChevronRight size={28} className="relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      {/* View All Bottom Link */}
      <div className="container mx-auto px-6 mt-8 flex justify-center">
         <Reveal type="fade" delay={0.3}>
            <a href="#" onClick={handleViewAll} className="group flex items-center gap-2 text-sm font-sans uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                View All Properties
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </a>
        </Reveal>
      </div>
    </section>
  );
};