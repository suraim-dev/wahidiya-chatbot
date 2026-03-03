import React, { useEffect, useState } from 'react';
import { Reveal } from './Reveal';
import { Heart, Trash2, ArrowRight, MapPin, Bed, Bath, Maximize2, GitCompare } from 'lucide-react';
import { Property } from '../types';

interface FavouritePageProps {
  onNavigate?: (page: string, id?: string) => void;
  initialTab?: string; // Kept for interface compatibility but ignored
}

export const FavouritePage: React.FC<FavouritePageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<Property[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = localStorage.getItem('favorites');
    if (stored) {
        try {
            setItems(JSON.parse(stored));
        } catch (e) {
            console.error("Failed to parse favorites", e);
        }
    }
  }, []);

  const removeItem = (id: string) => {
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      localStorage.setItem('favorites', JSON.stringify(newItems));
  };

  const handleNavClick = (page: string, id?: string) => {
      if (onNavigate) {
          onNavigate(page, id);
      }
  };

  return (
    <div className="bg-charcoal min-h-screen pt-32 pb-20 relative">
       {/* Decorative Background */}
       <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
       
       <div className="container mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16 border-b border-white/10 pb-12">
              <Reveal type="slide-up">
                  <div className="inline-block p-4 rounded-full bg-white/5 mb-6 border border-white/10 transition-all duration-300">
                    <Heart className="text-gold-400 fill-gold-400" size={32} />
                  </div>
              </Reveal>
              
              <Reveal type="slide-up" delay={0.1}>
                  <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
                      Your <span className="italic text-gold-400">Curated</span> Selection
                  </h1>
              </Reveal>
              
              <Reveal type="fade" delay={0.2}>
                  <p className="text-white/50 text-sm font-sans tracking-widest uppercase mb-8">
                      {items.length} {items.length === 1 ? 'Property' : 'Properties'} Saved
                  </p>
              </Reveal>

              <Reveal type="fade" delay={0.3}>
                  <button
                      onClick={() => window.dispatchEvent(new Event('open-compare-modal'))}
                      className="px-6 py-3 border border-white/20 rounded-full flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest text-white hover:bg-gold-400 hover:text-charcoal hover:border-gold-400 transition-all duration-300 group"
                  >
                      <GitCompare size={16} />
                      View Compare List
                  </button>
              </Reveal>
          </div>

          {/* Content Area */}
          {items.length > 0 ? (
              <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                  {items.map((item, idx) => (
                      <Reveal key={item.id} type="fade" delay={idx * 0.1}>
                          <div className="bg-[#151515] border border-white/5 p-4 md:p-0 flex flex-col md:flex-row group hover:border-gold-400/30 transition-all duration-500 overflow-hidden relative">
                              
                              {/* Image Section */}
                              <div 
                                className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative shrink-0 cursor-pointer"
                                onClick={() => handleNavClick('property-details', item.id)}
                              >
                                  <div className="absolute top-4 left-4 z-20">
                                      <span className="px-3 py-1 bg-white text-charcoal text-[10px] uppercase font-bold tracking-widest shadow-lg">
                                          {item.tag}
                                      </span>
                                  </div>
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                              </div>
                              
                              {/* Content Section */}
                              <div className="flex-grow flex flex-col justify-center p-6 md:p-10 relative">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h3 
                                            className="text-2xl md:text-3xl font-serif text-white group-hover:text-gold-400 transition-colors duration-300 cursor-pointer"
                                            onClick={() => handleNavClick('property-details', item.id)}
                                          >
                                              {item.title}
                                          </h3>
                                          <div className="flex items-center gap-2 mt-2 text-white/50 text-xs font-sans tracking-wide uppercase">
                                              <MapPin size={12} className="text-gold-600" />
                                              {item.location}
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => removeItem(item.id)}
                                        className="text-white/20 hover:text-red-400 transition-colors p-3 rounded-full hover:bg-white/5"
                                        title="Remove from wishlist"
                                      >
                                          <Trash2 size={20} />
                                      </button>
                                  </div>
                                  
                                  <div className="h-[1px] w-full bg-white/5 my-6 group-hover:bg-white/10 transition-colors"></div>
                                  
                                  {/* Specs - Single Line Layout */}
                                  <div className="flex flex-wrap items-center gap-8 mb-8">
                                      <div className="flex items-center gap-3">
                                          <Bed size={18} className="text-gold-400" />
                                          <div className="flex items-baseline gap-2">
                                              <span className="font-serif text-xl text-white">{item.beds}</span>
                                              <span className="text-[10px] uppercase text-white/40 tracking-widest">Beds</span>
                                          </div>
                                      </div>

                                      <div className="w-[1px] h-4 bg-white/10"></div>

                                      <div className="flex items-center gap-3">
                                          <Bath size={18} className="text-gold-400" />
                                          <div className="flex items-baseline gap-2">
                                              <span className="font-serif text-xl text-white">{item.baths}</span>
                                              <span className="text-[10px] uppercase text-white/40 tracking-widest">Baths</span>
                                          </div>
                                      </div>

                                      <div className="w-[1px] h-4 bg-white/10"></div>

                                      <div className="flex items-center gap-3">
                                          <Maximize2 size={18} className="text-gold-400" />
                                          <div className="flex items-baseline gap-2">
                                              <span className="font-serif text-xl text-white">{item.sqft}</span>
                                              <span className="text-[10px] uppercase text-white/40 tracking-widest">Sq Ft</span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 mt-auto">
                                      <button 
                                        onClick={() => handleNavClick('property-details', item.id)}
                                        className="w-full md:w-auto px-8 py-4 bg-white text-charcoal text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold-400 transition-colors duration-500 shadow-lg"
                                      >
                                          Details
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </Reveal>
                  ))}
              </div>
          ) : (
              <Reveal type="fade">
                  <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-lg bg-white/5">
                      <div className="w-20 h-20 border border-dashed border-white/20 rounded-full flex items-center justify-center mb-6 bg-white/5">
                          <Heart size={24} className="text-white/20" />
                      </div>
                      <h3 className="text-2xl font-serif text-white mb-2">Your collection is empty</h3>
                      <p className="text-white/50 max-w-sm mb-8 font-light text-sm leading-relaxed">
                          Start exploring our exclusive portfolio to curate your personal list of exceptional properties.
                      </p>
                      <button 
                        onClick={() => handleNavClick('properties')}
                        className="group flex items-center gap-3 text-white text-xs font-bold uppercase tracking-[0.2em] bg-charcoal border border-white/20 px-8 py-4 hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-300"
                      >
                          Browse Properties 
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                      </button>
                  </div>
              </Reveal>
          )}
       </div>
    </div>
  );
};