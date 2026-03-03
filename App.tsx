import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { PropertiesPage } from './components/PropertiesPage';
import { NewsPage } from './components/NewsPage';
import { NewsDetailsPage } from './components/NewsDetailsPage';
import { ContactPage } from './components/ContactPage';
import { FavouritePage } from './components/FavouritePage';
import { PropertyDetailsPage } from './components/PropertyDetailsPage';
import { AdminPage } from './components/AdminPage';
import { Preloader } from './components/Preloader';
import { Footer } from './components/Footer';
import { ComparisonTray } from './components/ComparisonTray';
import { Chatbot } from './components/Chatbot';
import { HERO_IMAGES } from './components/Hero';
import { supabase } from './services/supabaseClient';
import { Property } from './types';

// Define static assets globally to ensure they are captured for preloading
const STATIC_ASSETS = [
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/for%20our%20philosophy%20section.jpg",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/KSRM.png",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/TRADEXCEL.png",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/PHPFamily.png",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/ROSEWOOD%20HOME.png",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/IRONWOOD.png",
  "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Main%20logo/Main%20Logo.png"
];

function App() {
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [navKey, setNavKey] = useState(0);
  
  // Data for Home View (Preloaded)
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  
  // Current View State
  const [currentView, setCurrentView] = useState('home');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [initialSearchQuery, setInitialSearchQuery] = useState('');

  // Pending Navigation State (used during preloader transition)
  const [pendingView, setPendingView] = useState<string | null>(null);
  const [pendingProps, setPendingProps] = useState<{id?: string, query?: string}>({});

  // Detect actual page load & Preload Assets
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // 1. Fetch Critical Data (Featured Properties for Home)
        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('featured', true);
        
        let formattedProps: Property[] = [];
        if (data && data.length > 0) {
           formattedProps = data.map((item: any) => ({
            id: item.id?.toString() || Math.random().toString(),
            title: item.title,
            location: item.location,
            price: item.price,
            image: item.imageUrl || item.imageUrl_url, 
            beds: item.beds,
            baths: item.baths,
            sqft: item.sqft,
            tag: item.tag || 'Sale',
            garages: item.garage || item.garages,
            type: item.type || 'Residential',
            features: item.features || [],
            facilities: item.facilities || []
          }));
          setFeaturedProperties(formattedProps);
        }

      } catch (err) {
          console.error("Preloading error:", err);
      }
    };

    preloadAssets();

    // Simple 2-second delay before finishing load
    const timer = setTimeout(() => {
        setIsPageLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Lock scroll during loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => { 
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    };
  }, [loading]);

  const handleTransitionStart = () => {
    if (pendingView) {
        if (pendingView === 'property-details' && pendingProps.id) {
            setSelectedPropertyId(pendingProps.id);
        }
        if (pendingView === 'news-details' && pendingProps.id) {
            setSelectedNewsId(pendingProps.id);
        }
        
        if (pendingView === 'properties' && pendingProps.query !== undefined) {
            setInitialSearchQuery(pendingProps.query);
        } else if (pendingView !== 'properties') {
            setInitialSearchQuery(''); 
        }

        setCurrentView(pendingView);
        setPendingView(null);
        setPendingProps({});
    }

    window.scrollTo(0, 0);
    setContentVisible(true);
  };

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  const handleNavigate = (page: string, id?: string, query?: string) => {
      setPendingView(page);
      setPendingProps({ id, query });
      setContentVisible(false);
      setNavKey(prev => prev + 1);
      setLoading(true);
  };

  return (
    <>
      {loading && (
        <Preloader 
          key={navKey}
          isLoaded={isPageLoaded} 
          onTransitionStart={handleTransitionStart} 
          onComplete={handleLoadingComplete} 
        />
      )}

      <div className={`min-h-screen bg-charcoal text-white selection:bg-gold-500 selection:text-charcoal font-sans overflow-x-hidden relative transition-opacity duration-1000 ${contentVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className="fixed inset-0 bg-charcoal -z-50" />
        {currentView !== 'admin' && <Header onNavigate={handleNavigate} currentPage={currentView} />}
        
        <main className="relative z-0 bg-charcoal">
             {currentView === 'home' && <Home onNavigate={handleNavigate} showUI={!loading} featuredProperties={featuredProperties} />}
             {currentView === 'properties' && <PropertiesPage onNavigate={handleNavigate} initialSearch={initialSearchQuery} />}
             {currentView === 'property-details' && selectedPropertyId && <PropertyDetailsPage propertyId={selectedPropertyId} onNavigate={handleNavigate} />}
             {currentView === 'news' && <NewsPage onNavigate={handleNavigate} />}
             {currentView === 'news-details' && selectedNewsId && <NewsDetailsPage newsId={selectedNewsId} onNavigate={handleNavigate} />}
             {currentView === 'contact' && <ContactPage />}
             {currentView === 'favourite' && <FavouritePage onNavigate={handleNavigate} initialTab="saved" />}
             {currentView === 'compare' && <FavouritePage onNavigate={handleNavigate} initialTab="compare" />}
             {currentView === 'admin' && <AdminPage onNavigate={handleNavigate} />}
        </main>
        
        <ComparisonTray onNavigate={(page) => handleNavigate(page)} />
        <Chatbot />
        {currentView !== 'admin' && <Footer onNavigate={(page) => handleNavigate(page)} />}
      </div>
    </>
  );
}

export default App;