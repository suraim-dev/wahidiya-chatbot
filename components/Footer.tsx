import React from 'react';
import { Reveal } from './Reveal';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    if (onNavigate) onNavigate(page);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-[#1F1F1F] text-white border-t border-white/5 relative overflow-hidden font-sans">
      
      {/* Hotline Section */}
      <div className="relative z-10 py-20 md:py-24 flex flex-col items-center justify-center bg-[#1F1F1F] overflow-hidden px-4">
          
          {/* Complex Architectural Background Design */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Subtle texture base */}
              <div className="absolute inset-0 opacity-[0.03]" 
                   style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
              </div>

              {/* Rotating Architectural Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] md:w-[1000px] md:h-[1000px] border border-white/10 rounded-full opacity-20 animate-[spin_120s_linear_infinite]">
                 <div className="absolute top-0 left-1/2 w-4 h-4 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                 <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white/20 rounded-full -translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160vw] h-[160vw] md:w-[800px] md:h-[800px] border border-gold-400/20 rounded-full opacity-25 animate-[spin_90s_linear_infinite_reverse]">
                  <div className="absolute top-1/2 right-0 w-2 h-2 bg-gold-400/40 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 w-2 h-2 bg-gold-400/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[600px] md:h-[600px] border border-white/10 rounded-full opacity-30 animate-[spin_60s_linear_infinite]"></div>

              {/* Complex Grid Overlay */}
              <div className="absolute inset-0 opacity-[0.05]" 
                  style={{ 
                      backgroundImage: `
                          linear-gradient(to right, #D4AF37 1px, transparent 1px),
                          linear-gradient(to bottom, #D4AF37 1px, transparent 1px)
                      `,
                      backgroundSize: '100px 100px'
                  }}>
              </div>
          </div>
          
          <div className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0">
              <span className="text-[13vw] md:text-[5vw] font-black text-[#171717] tracking-widest uppercase leading-none block">
                  Contact
              </span>
          </div>

          <Reveal type="slide-up">
              <div className="text-center mb-6 relative z-10">
                  <h2 className="text-3xl md:text-6xl lg:text-7xl font-light text-white tracking-tight">
                      HOTLINE# <span className="font-bold block md:inline mt-2 md:mt-0">09610-000300</span>
                  </h2>
              </div>
          </Reveal>
          
          <Reveal type="fade" delay={0.2}>
              <div className="flex items-center gap-6 relative z-10">
                  <span className="w-8 md:w-16 h-[1px] bg-gradient-to-r from-transparent to-gold-400"></span>
                  <span className="text-gold-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-shadow-glow">
                      Contact Us
                  </span>
                  <span className="w-8 md:w-16 h-[1px] bg-gradient-to-l from-transparent to-gold-400"></span>
              </div>
          </Reveal>
      </div>

      {/* Main Grid Content */}
      <div className="container mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              
              {/* Brand Column */}
              <div className="space-y-6">
                  <Reveal type="fade" delay={0.1}>
                      <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                              <img 
                                src="https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Main%20logo/Main%20Logo.png"
                                alt="Navana Real Estate"
                                className="h-16 md:h-24 w-auto object-contain" 
                              />
                          </div>
                          <p className="text-white/50 text-sm font-light tracking-wide pl-1 border-l-2 border-gold-400/30 py-1">
                              Elevating the standard of living with exceptional properties and personalized service. Your journey to the perfect home starts here.
                          </p>
                      </div>
                  </Reveal>
              </div>

              {/* Navigation */}
              <div>
                  <Reveal type="fade" delay={0.2}>
                      <div className="flex items-center gap-3 mb-6 md:mb-8">
                          <h4 className="text-white font-sans text-xs font-bold uppercase tracking-[0.2em]">Navigation</h4>
                          <span className="w-8 h-[1px] bg-gold-400"></span>
                      </div>
                      <ul className="space-y-4">
                          <li>
                              <a href="#" onClick={(e) => handleNav(e, 'home')} className="text-white/60 hover:text-white text-sm font-light transition-colors flex items-center gap-2 group">
                                  <span className="w-0 h-[1px] bg-gold-400 transition-all duration-300 group-hover:w-2"></span>
                                  Home
                              </a>
                          </li>
                          <li>
                              <a href="#" onClick={(e) => handleNav(e, 'properties')} className="text-white/60 hover:text-white text-sm font-light transition-colors flex items-center gap-2 group">
                                  <span className="w-0 h-[1px] bg-gold-400 transition-all duration-300 group-hover:w-2"></span>
                                  Properties
                              </a>
                          </li>
                          <li>
                              <a href="#" onClick={(e) => handleNav(e, 'news')} className="text-white/60 hover:text-white text-sm font-light transition-colors flex items-center gap-2 group">
                                  <span className="w-0 h-[1px] bg-gold-400 transition-all duration-300 group-hover:w-2"></span>
                                  News
                              </a>
                          </li>
                          <li>
                              <a href="#" onClick={(e) => handleNav(e, 'contact')} className="text-white/60 hover:text-white text-sm font-light transition-colors flex items-center gap-2 group">
                                  <span className="w-0 h-[1px] bg-gold-400 transition-all duration-300 group-hover:w-2"></span>
                                  Contact
                              </a>
                          </li>
                          <li>
                              <a href="#" onClick={(e) => handleNav(e, 'admin')} className="text-white/40 hover:text-gold-400 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group mt-4 pt-4 border-t border-white/5">
                                  <span className="w-0 h-[1px] bg-gold-400 transition-all duration-300 group-hover:w-2"></span>
                                  Admin
                              </a>
                          </li>
                      </ul>
                  </Reveal>
              </div>

              {/* Contact Details */}
              <div>
                  <Reveal type="fade" delay={0.3}>
                      <div className="flex items-center gap-3 mb-6 md:mb-8">
                          <h4 className="text-white font-sans text-xs font-bold uppercase tracking-[0.2em]">Contact</h4>
                          <span className="w-8 h-[1px] bg-gold-400"></span>
                      </div>
                      <ul className="space-y-4 text-sm font-light text-white/60">
                          <li className="flex gap-4 items-baseline">
                              <span className="font-bold text-white min-w-[20px]">P :</span>
                              <span className="hover:text-gold-400 transition-colors cursor-pointer">+ (880) 171-1151207</span>
                          </li>
                          <li className="flex gap-4 items-baseline">
                              <span className="font-bold text-white min-w-[20px]">H :</span>
                              <div className="flex flex-col">
                                  <span className="text-gold-400 font-medium">09610-000300</span>
                              </div>
                          </li>
                          <li className="flex gap-4 items-baseline">
                              <span className="font-bold text-white min-w-[20px]">E :</span>
                              <a href="mailto:sales@rangapori.properties" className="hover:text-gold-400 transition-colors break-all">sales@rangapori.properties</a>
                          </li>
                      </ul>
                  </Reveal>
              </div>

              {/* Address */}
              <div>
                  <Reveal type="fade" delay={0.4}>
                      <div className="flex items-center gap-3 mb-6 md:mb-8">
                          <h4 className="text-white font-sans text-xs font-bold uppercase tracking-[0.2em]">Address</h4>
                          <span className="w-8 h-[1px] bg-gold-400"></span>
                      </div>
                      <address className="text-white/60 text-sm font-light not-italic leading-loose">
                          House-137, Sector-3, Uposhohor Housing Estate<br />
                          Rajshahi,<br />
                          Bangladesh
                      </address>
                  </Reveal>
              </div>
          </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 bg-[#0F0F0F] relative z-10">
          <div className="container mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row justify-center items-center gap-4 text-[10px] text-white/30 uppercase tracking-[0.2em] text-center">
              <p className="text-white">&copy; Rangapori All rights reserved.</p>
          </div>
      </div>
    </footer>
  );
};