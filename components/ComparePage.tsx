import React, { useEffect, useState, useRef } from 'react';
import { Property } from '../types';
import { X, MapPin, ArrowRight, GitCompare, Trash2 } from 'lucide-react';
import { Reveal } from './Reveal';

interface ComparePageProps {
  onNavigate?: (page: string, id?: string) => void;
  embedded?: boolean;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate, embedded = false }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Scroll & Drag Refs
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velX = useRef(0);
  const momentumID = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const lastX = useRef<number>(0);

  // Load Data
  const loadProperties = () => {
    try {
      const stored = localStorage.getItem('compareList');
      if (stored) {
        setProperties(JSON.parse(stored));
      } else {
        setProperties([]);
      }
    } catch (e) {
      console.error("Failed to load compare list", e);
      setProperties([]);
    }
  };

  useEffect(() => {
    loadProperties();
    const handleStorage = () => loadProperties();
    window.addEventListener('compare-updated', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('compare-updated', handleStorage);
      window.removeEventListener('storage', handleStorage);
      cancelAnimationFrame(momentumID.current);
    };
  }, []);

  const removeProperty = (id: string) => {
    const updated = properties.filter(p => p.id !== id);
    setProperties(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
    window.dispatchEvent(new Event('compare-updated'));
  };

  const handleNav = (id: string) => {
    // Prevent click if we were dragging (small threshold)
    if (Math.abs(velX.current) < 2) {
       if (onNavigate) onNavigate('property-details', id);
    }
  };

  // --- PHYSICS ENGINE ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    isDown.current = true;
    sliderRef.current.classList.add('cursor-grabbing');
    sliderRef.current.classList.remove('cursor-grab');
    
    // Stop any ongoing momentum
    cancelAnimationFrame(momentumID.current);
    
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
    
    lastX.current = e.pageX;
    lastTime.current = performance.now();
    velX.current = 0;
  };

  const handleMouseLeave = () => {
    if (!isDown.current) return;
    isDown.current = false;
    if (sliderRef.current) {
        sliderRef.current.classList.remove('cursor-grabbing');
        sliderRef.current.classList.add('cursor-grab');
    }
    beginMomentum();
  };

  const handleMouseUp = () => {
    if (!isDown.current) return;
    isDown.current = false;
    if (sliderRef.current) {
        sliderRef.current.classList.remove('cursor-grabbing');
        sliderRef.current.classList.add('cursor-grab');
    }
    beginMomentum();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current); // 1:1 movement
    sliderRef.current.scrollLeft = scrollLeft.current - walk;

    // Calculate Velocity
    const now = performance.now();
    const dt = now - lastTime.current;
    const dx = e.pageX - lastX.current;
    
    if (dt > 0) {
        velX.current = dx; // pixels moved per event check
    }

    lastX.current = e.pageX;
    lastTime.current = now;
  };

  const beginMomentum = () => {
    cancelAnimationFrame(momentumID.current);
    
    const loop = () => {
        if (!sliderRef.current) return;
        
        // Apply friction
        velX.current *= 0.95;
        
        if (Math.abs(velX.current) > 0.5) {
            sliderRef.current.scrollLeft -= velX.current;
            momentumID.current = requestAnimationFrame(loop);
        } else {
            velX.current = 0;
        }
    };
    loop();
  };

  // --- RENDER HELPERS ---

  const labels = [
    { label: 'Price', key: 'price' },
    { label: 'Location', key: 'location' },
    { label: 'Type', key: 'type' },
    { label: 'Status', key: 'tag' },
    { label: 'Area', key: 'sqft', suffix: ' Sq Ft' },
    { label: 'Bedrooms', key: 'beds' },
    { label: 'Bathrooms', key: 'baths' },
    { label: 'Garages', key: 'garage' }, // Updated from garages
  ];

  if (properties.length === 0) {
    return (
        <div className={`flex flex-col items-center justify-center text-center ${embedded ? 'h-full py-20' : 'min-h-screen pt-40'}`}>
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <GitCompare className="text-white/20" size={24} />
             </div>
             <h3 className="text-xl font-serif text-white mb-2">Comparison List Empty</h3>
             <p className="text-white/50 text-sm max-w-xs mx-auto mb-8">Add properties to compare their features side by side.</p>
             <button 
                onClick={() => onNavigate && onNavigate('properties')}
                className="group flex items-center gap-3 text-white text-xs font-bold uppercase tracking-[0.2em] bg-charcoal border border-white/20 px-8 py-4 hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-300"
             >
                Browse Properties 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
             </button>
        </div>
    );
  }

  return (
    <div className={`bg-charcoal ${embedded ? '' : 'min-h-screen pt-32 pb-20'} relative`}>
        {!embedded && (
            <div className="container mx-auto px-6 mb-12 text-center">
                 <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Compare Properties</h1>
                 <p className="text-white/50 text-xs font-bold uppercase tracking-[0.2em]">{properties.length} Selected</p>
            </div>
        )}

        {/* Scroll Container */}
        <div 
            ref={sliderRef}
            className="overflow-x-auto cursor-grab active:cursor-grabbing hide-scrollbar select-none relative w-full"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ 
                scrollBehavior: 'auto', // Disable CSS smooth scroll to allow physics engine
                overscrollBehaviorX: 'contain'
            }}
        >
            <div className="inline-block min-w-full align-top">
                <div 
                    className="grid bg-[#151515] border-t border-l border-white/10"
                    style={{ 
                        gridTemplateColumns: `140px repeat(${properties.length}, minmax(260px, 1fr))` 
                    }}
                >
                    {/* --- HEADER ROW --- */}
                    {/* Sticky Corner */}
                    <div className="sticky left-0 z-30 bg-[#151515] p-4 border-b border-r border-white/10 flex items-center justify-center shadow-[4px_0_12px_rgba(0,0,0,0.3)]">
                        <span className="text-gold-400 text-[10px] font-bold uppercase tracking-widest">Features</span>
                    </div>

                    {/* Property Headers */}
                    {properties.map(prop => (
                        <div key={prop.id} className="p-4 border-b border-r border-white/10 relative group min-w-0 bg-[#151515]">
                             <button 
                                onClick={(e) => { e.stopPropagation(); removeProperty(prop.id); }}
                                className="absolute top-2 right-2 text-white/30 hover:text-red-500 z-10 p-1 bg-black/50 rounded-full transition-colors"
                             >
                                <X size={14} />
                             </button>
                             
                             <div 
                                className="aspect-[4/3] w-full mb-4 overflow-hidden bg-charcoal-light relative cursor-pointer"
                                onClick={() => handleNav(prop.id)}
                             >
                                <img src={prop.image} alt={prop.title} className="w-full h-full object-cover pointer-events-none" />
                             </div>
                             
                             <h3 className="text-lg font-serif text-white truncate mb-2 cursor-pointer hover:text-gold-400 transition-colors" onClick={() => handleNav(prop.id)}>
                                {prop.title}
                             </h3>
                             
                             <button 
                                onClick={() => handleNav(prop.id)}
                                className="text-[10px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1 hover:text-white transition-colors"
                             >
                                View Details <ArrowRight size={12} />
                             </button>
                        </div>
                    ))}

                    {/* --- DATA ROWS --- */}
                    {labels.map(row => (
                        <React.Fragment key={row.key}>
                            {/* Sticky Label */}
                            <div className="sticky left-0 z-20 bg-[#151515] p-4 border-b border-r border-white/10 flex items-center shadow-[4px_0_12px_rgba(0,0,0,0.3)]">
                                <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{row.label}</span>
                            </div>

                            {/* Values */}
                            {properties.map(prop => (
                                <div key={`${prop.id}-${row.key}`} className="p-4 border-b border-r border-white/10 flex items-center min-w-0 bg-[#151515]/50">
                                    {row.key === 'location' ? (
                                        <div className="flex items-start gap-2 max-w-full">
                                            <MapPin size={14} className="text-gold-600 shrink-0 mt-0.5" />
                                            <span className="text-sm font-light text-white leading-snug whitespace-normal break-words">
                                                {prop.location}
                                            </span>
                                        </div>
                                    ) : row.key === 'price' ? (
                                        <span className="text-gold-400 font-medium text-sm">{prop.price}</span>
                                    ) : (
                                        <span className="text-sm font-light text-white/90">
                                            {/* @ts-ignore */}
                                            {prop[row.key] || '-'} {row.suffix || ''}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}

                    {/* --- FEATURES ROW --- */}
                     <div className="sticky left-0 z-20 bg-[#151515] p-4 border-b border-r border-white/10 flex items-center shadow-[4px_0_12px_rgba(0,0,0,0.3)]">
                        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Amenities</span>
                    </div>
                    
                    {properties.map(prop => (
                        <div key={`${prop.id}-features`} className="p-4 border-b border-r border-white/10 min-w-0 bg-[#151515]/50">
                            <div className="flex flex-wrap gap-2">
                                {(prop.features || []).slice(0, 5).map((feat, i) => (
                                    <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 text-white/70 rounded whitespace-normal text-center">
                                        {feat}
                                    </span>
                                ))}
                                {(prop.features?.length || 0) > 5 && (
                                    <span className="text-[10px] text-gold-400 px-2 py-1 self-center">
                                        +{(prop.features?.length || 0) - 5} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
        `}</style>
    </div>
  );
};