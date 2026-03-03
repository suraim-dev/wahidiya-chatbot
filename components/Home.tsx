import React, { useEffect, useRef } from 'react';
import { Hero } from './Hero';
import { FeaturedProperties } from './FeaturedProperties';
import { PartnersAndNews } from './PartnersAndNews';
import { Reveal } from './Reveal';
import { Property } from '../types';

interface HomeProps {
  onNavigate?: (page: string, id?: string) => void;
  showUI?: boolean;
  featuredProperties?: Property[];
}

export const Home: React.FC<HomeProps> = ({ onNavigate, showUI = true, featuredProperties }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNav = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    if (onNavigate) onNavigate(page);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
        video.muted = true; // Ensure muted for autoplay
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                // Auto-play was prevented or interrupted
                if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                    console.warn("Video playback failed:", error);
                }
            });
        }
    }
  }, []);

  return (
    <>
      <Hero onNavigate={onNavigate} />
      
      {/* Philosophy Section */}
      <section className="py-20 md:py-32 px-4 md:px-6 container mx-auto bg-charcoal">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
           <div className="w-full md:w-1/2 space-y-6 md:space-y-8">
              <Reveal type="slide-up">
                  <h3 className="text-gold-400 font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                      <span className="w-8 h-[1px] bg-gold-400"></span>
                      Our Philosophy
                  </h3>
              </Reveal>
              
              <Reveal type="slide-up" delay={0.2} className="pb-2 md:pb-4">
                  <h2 className="text-3xl md:text-4xl lg:text-6xl font-serif text-white leading-[1.1]">
                     The Art of <br />
                     <span className="italic text-white/50">Exceptional Living</span>
                  </h2>
              </Reveal>

              <Reveal type="fade" delay={0.4}>
                  <p className="text-gray-400 leading-relaxed text-base md:text-lg font-light max-w-md">
                  Rangapori Properties represents the pinnacle of luxury living. We curate only the most exceptional properties, ensuring that every residence we represent is a masterpiece of design, comfort, and exclusivity.
                  </p>
              </Reveal>
              
              <Reveal type="fade" delay={0.6}>
                  <button onClick={(e) => handleNav(e, 'news')} className="group flex items-center gap-3 text-white text-xs uppercase tracking-widest hover:text-gold-400 transition-colors pt-2">
                     <span className="w-16 md:w-20 h-[1px] bg-white group-hover:bg-gold-400 transition-colors"></span>
                  </button>
              </Reveal>
           </div>

           <div className="w-full md:w-1/2 relative">
              <Reveal type="zoom" className="w-full h-[400px] md:h-[600px] relative overflow-hidden group">
                 <img 
                  src="https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/for%20philosophy.png" 
                  className="w-full h-full object-cover" 
                  alt="Interior Design"
                 />
              </Reveal>

              {/* Overlapping Quote Box - Desktop (Reverted to Left Offset) */}
              <div className="absolute -bottom-6 -left-4 md:-bottom-10 md:-left-10 z-20 hidden md:block">
                  <Reveal type="fade" delay={0.6}>
                      <div className="bg-gold-400 p-6 md:p-8 w-64 md:w-80 shadow-2xl transition-transform duration-500 hover:-translate-y-2">
                           <p className="font-serif text-xl md:text-2xl text-charcoal mb-4 leading-snug">
                              "Architecture should speak of its time and place, but yearn for timelessness."
                           </p>
                           <div className="h-[1px] w-12 bg-white mb-4"></div>
                           <p className="text-[10px] uppercase tracking-widest text-charcoal font-bold">
                              — Frank Gehry
                           </p>
                      </div>
                  </Reveal>
              </div>

               {/* Mobile Quote Box (Centered Horizontally) */}
               <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] z-20 md:hidden block">
                    <Reveal type="fade" delay={0.4}>
                        <div className="bg-gold-400 p-6 shadow-2xl">
                           <p className="font-serif text-lg text-charcoal mb-3 leading-snug">
                              "Architecture should speak of its time and place, but yearn for timelessness."
                           </p>
                           <div className="h-[1px] w-8 bg-charcoal/20 mb-3"></div>
                           <p className="text-[10px] uppercase tracking-widest text-charcoal font-bold">
                              — Frank Gehry
                           </p>
                        </div>
                    </Reveal>
               </div>
           </div>
        </div>
      </section>

      <FeaturedProperties onNavigate={onNavigate} showUI={showUI} initialData={featuredProperties} />
      
      <PartnersAndNews onNavigate={onNavigate} />
      
      {/* Building Projects Section - Stacked on Mobile, Overlay on Desktop */}
      <section className="relative w-full md:h-screen flex flex-col md:block bg-charcoal overflow-hidden">
         {/* Background Video */}
         {/* Mobile: Relative block, 50vh height. Desktop: Absolute full cover. */}
         <div className="relative w-full h-[50vh] md:absolute md:inset-0 md:h-full z-0 overflow-hidden bg-black">
           <Reveal type="zoom" threshold={0} className="w-full h-full">
              <video 
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover opacity-100 block"
                  src="https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Panshi%20Tower/Panshi%20Tower%20project%20video.mp4"
              >
                  Your browser does not support the video tag.
              </video>
           </Reveal>
           <div className="absolute inset-0 bg-black/20 md:bg-black/10"></div>
         </div>
         
         {/* Content Overlay */}
         <div className="relative z-10 w-full md:container md:mx-auto md:px-6 pointer-events-none md:h-full flex flex-col justify-center -mt-2 md:mt-0">
            {/* 
                Mobile: Full width, dark background, standard padding.
                Desktop: Partial width, glassmorphism, right border.
            */}
            <div className="w-full md:w-1/2 lg:w-5/12 md:h-full bg-gradient-to-b from-[#1F1F1F] to-charcoal md:bg-black/10 md:bg-none backdrop-blur-none md:backdrop-blur-xl border-t border-white/10 md:border-t-0 md:border-r md:border-white/10 shadow-2xl flex flex-col justify-center px-4 md:px-12 lg:px-16 py-12 md:py-0 pointer-events-auto transition-colors duration-500 hover:bg-[#151515] md:hover:bg-black/20">
                <Reveal type="slide-up" delay={0.2}>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-sans font-light mb-3 md:mb-4 uppercase tracking-tight text-white drop-shadow-md">
                      Building Projects
                    </h2>
                </Reveal>
                
                <Reveal type="slide-up" delay={0.3}>
                    <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-8">
                       <h3 className="text-gold-400 font-serif italic text-base sm:text-lg md:text-xl shrink-0">
                          Diverse Choice <span className="hidden xs:inline">of Building Projects</span>
                          <span className="xs:hidden">of Projects</span>
                       </h3>
                       <div className="h-[1px] flex-grow bg-gradient-to-r from-gold-400 to-transparent"></div>
                    </div>
                </Reveal>

                <Reveal type="fade" delay={0.4}>
                    <div className="space-y-4 md:space-y-6 text-gray-300 md:text-gray-100 font-light leading-relaxed text-sm md:text-base mb-8 md:mb-10 text-shadow-sm">
                        <p>
                          Rangapori Properties develops modern apartment, residential, and commercial building projects in prime locations across Rajshahi. With a focus on quality construction, smart design, and strategic locations, our projects support comfortable living, business growth, and long-term investment value—shaping the future of real estate in Rajshahi.
                        </p>
                        <p className="hidden md:block">
                          We are providing you a good considerable price to buy an apartment in Rajshahi's prime residential location.
                        </p>
                    </div>
                </Reveal>

                <Reveal type="fade" delay={0.5}>
                    <button onClick={(e) => handleNav(e, 'properties')} className="group relative px-6 py-3 md:px-8 md:py-4 bg-white/10 hover:bg-gold-400 transition-colors duration-500 overflow-hidden border border-white/20 inline-block w-max">
                        <span className="relative z-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white group-hover:text-charcoal transition-colors">
                            View More
                        </span>
                        <div className="absolute left-0 bottom-0 h-[2px] w-full bg-gold-400 group-hover:h-full transition-all duration-300 ease-luxury opacity-100"></div>
                    </button>
                </Reveal>
            </div>
         </div>
      </section>
    </>
  );
};