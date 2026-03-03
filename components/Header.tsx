import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { NavItem } from '../types';

interface HeaderProps {
  onNavigate?: (page: string, id?: string, query?: string) => void;
  currentPage?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: 'home' },
  { label: 'Properties', href: 'properties' },
  { label: 'News', href: 'news' },
  { label: 'Contact', href: 'contact' },
  { label: 'Favourite', href: 'favourite' },
];

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine background style
      setScrolled(currentScrollY > 50);

      // Smart Hide/Show Logic
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsVisible(false);
      } else {
          setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  // Lock body scroll when menu is open to prevent layout shift
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (mobileMenuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      if (headerRef.current) {
        headerRef.current.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      timeoutId = setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        if (headerRef.current) {
          headerRef.current.style.paddingRight = '';
        }
      }, 700);
    }
    
    return () => {
        if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
    setMobileMenuOpen(false);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        window.scrollTo({ top: 0 });
    }, 710);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          const val = searchInputRef.current?.value;
          if (val && onNavigate) {
              onNavigate('properties', undefined, val);
          }
      }
  };

  const isItemActive = (href: string) => {
    if (href === 'properties' && (currentPage === 'properties' || currentPage === 'property-details')) return true;
    if (href === 'news' && (currentPage === 'news' || currentPage === 'news-details')) return true;
    return currentPage === href;
  };

  const shouldShow = isVisible || mobileMenuOpen;

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-[100] py-2 md:py-1 transform transition-[transform,background-color,border-color,box-shadow,backdrop-filter] duration-1000 ease-luxury ${
          shouldShow ? 'translate-y-0' : '-translate-y-full'
        } ${
          mobileMenuOpen
            ? 'bg-black border-b border-white/5'
            : scrolled
            ? 'bg-charcoal-dark/90 backdrop-blur-xl border-b border-white/5 shadow-2xl'
            : 'bg-black border-b border-white/10'
        }`}
      >
        <div className="w-full pl-6 md:pl-12 pr-8 md:pr-12 flex justify-between items-center">
          
          {/* Logo (Left) */}
          <div className="flex items-center gap-2 z-50 relative">
            <a 
                href="#" 
                className="flex items-center gap-3 group" 
                onClick={(e) => handleNavClick(e, 'home')}
            >
                <img 
                    src="https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Main%20logo/Main%20Logo.png" 
                    alt="Navana Real Estate" 
                    className="h-12 md:h-16 lg:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-8 z-50">
            
            {/* Search Box */}
            <div 
                className="flex items-center border border-white px-3 py-2 gap-2 rounded-full transition-[border-color,background-color] duration-700 ease-luxury hover:border-gold-400 group focus-within:border-gold-400 focus-within:bg-white/5 cursor-text"
                onClick={() => searchInputRef.current?.focus()}
            >
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="SEARCH" 
                  onKeyDown={handleSearchKeyDown}
                  className="bg-transparent border-none outline-none text-white text-[10px] font-bold uppercase tracking-[0.2em] w-8 focus:w-28 md:focus:w-48 transition-all duration-700 ease-luxury placeholder:text-transparent focus:placeholder:text-white/30"
                />
                <Search size={14} className="text-white group-hover:text-gold-400 transition-colors" />
            </div>
            
            <button
              className="text-white hover:text-gold-400 transition-colors flex items-center gap-3 group relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <div className="hidden md:block overflow-hidden h-4">
                  <div className="flex flex-col transition-transform duration-500 ease-luxury group-hover:-translate-y-4">
                    <span className="text-xs font-bold font-sans uppercase tracking-widest h-4 block leading-4">
                      Menu
                    </span>
                    <span className="text-xs font-bold font-sans uppercase tracking-widest h-4 block leading-4 text-gold-400">
                      {mobileMenuOpen ? 'Close' : 'Open'}
                    </span>
                  </div>
                </div>
                {mobileMenuOpen ? <X size={24} className="md:w-6 md:h-6 w-5 h-5" /> : <Menu size={24} className="md:w-6 md:h-6 w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black z-[90] transition-all duration-700 ease-luxury ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible delay-500'
        }`}
      >
        <div className="h-full w-full flex flex-col justify-center items-center relative overflow-hidden">
          
          {/* Background Decor: Giant 'MENU' Text */}
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0 transition-[transform,opacity] ease-luxury ${
                mobileMenuOpen ? 'duration-1000 scale-100 opacity-100' : 'duration-300 scale-110 opacity-0'
            }`}
          >
             <span className="font-display font-black text-[25vw] md:text-[20vw] text-[#111] tracking-widest leading-none">
                MENU
             </span>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 z-10 w-full px-6">
            {NAV_ITEMS.map((item, index) => (
                <div key={item.label} className="overflow-hidden px-4 pb-4 text-center shrink-0">
                    <a
                        href="#"
                        className={`block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal hover:text-gold-400 transform transition-[opacity,transform,color] ease-out will-change-transform ${
                            isItemActive(item.href) ? 'text-gold-400' : 'text-white'
                        } ${
                            mobileMenuOpen 
                            ? 'duration-700 translate-y-0 opacity-100' 
                            : 'duration-300 translate-y-10 opacity-0'
                        }`}
                        style={{ 
                            transitionDelay: mobileMenuOpen 
                                ? `${100 + index * 100}ms` 
                                : '0ms' 
                        }}
                        onClick={(e) => handleNavClick(e, item.href)}
                    >
                        {item.label}
                    </a>
                </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};