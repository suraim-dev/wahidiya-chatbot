import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Reveal } from './Reveal';
import { supabase } from '../services/supabaseClient';
import { ArrowUpRight, Clock, Calendar, Search, Tag, TrendingUp, ChevronRight, MapPin, Bed, Bath, Maximize2, ArrowRight } from 'lucide-react';

// --- Types ---
interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image_url: string;
  excerpt: string;
  created_at?: string;
}

interface SidebarProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  beds: number;
  baths: number;
  sqft: string | number;
}

interface Comment {
  id: number;
  author_name: string;
  created_at: string;
  properties?: {
    title: string;
  } | null;
  news?: {
      title: string;
  } | null;
}

const FALLBACK_FEATURED_PROPERTY = {
  id: "fallback-regal",
  title: "The Regal Penthouse",
  location: "Gulshan 2, Dhaka",
  price: "Price on Request",
  image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2670&auto=format&fit=crop",
  beds: 4,
  baths: 5,
  sqft: "4,200"
};

const PLACEHOLDER_NEWS_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop";

// Helper to calculate time ago
const timeAgo = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

interface NewsPageProps {
  onNavigate?: (page: string, id?: string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [featuredProperty, setFeaturedProperty] = useState<SidebarProperty>(FALLBACK_FEATURED_PROPERTY);
  const [tickerComments, setTickerComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Pagination State
  const [visibleCount, setVisibleCount] = useState(5);
  const LOAD_INCREMENT = 5;

  // --- Handle Scroll for Ticker ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down AND past 100px, header hides, so ticker moves to top (0px)
      // If scrolling up, header shows, so ticker moves down (70px)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsHeaderVisible(false);
      } else {
          setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Fetch Data from Supabase ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch News
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .order('date', { ascending: false });

        if (newsError) console.error('Error fetching news:', newsError);
        else if (newsData) setNewsItems(newsData);

        // 2. Fetch Featured Property
        const { data: propData, error: propError } = await supabase
          .from('properties')
          .select('*')
          .eq('featured', true)
          .limit(1)
          .single();

        if (propData) {
            setFeaturedProperty({
                id: propData.id,
                title: propData.title,
                location: propData.location,
                price: propData.price,
                image: propData.imageUrl || propData.image || propData.image_url || FALLBACK_FEATURED_PROPERTY.image,
                beds: propData.beds,
                baths: propData.baths,
                sqft: propData.sqft
            });
        }

        // 3. Fetch Recent Comments for Ticker
        const { data: commentsData } = await supabase
            .from('comments')
            .select(`
                id, 
                author_name, 
                created_at,
                properties (
                    title
                ),
                news (
                    title
                )
            `)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (commentsData && commentsData.length > 0) {
            // @ts-ignore
            setTickerComments(commentsData);
        } else {
            // Fallback mock data
            setTickerComments([
              { id: 1, author_name: "Ahmed K.", properties: { title: "The Regal Penthouse" }, created_at: new Date(Date.now() - 600000).toISOString() },
              { id: 2, author_name: "Sarah J.", properties: { title: "Riverside Sanctuary" }, created_at: new Date(Date.now() - 1500000).toISOString() },
              { id: 3, author_name: "Tanvir H.", properties: { title: "Gulshan Avenue Plot" }, created_at: new Date(Date.now() - 2500000).toISOString() },
            ]);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, []);

  // --- Reset Pagination when Category Changes ---
  useEffect(() => {
      setVisibleCount(LOAD_INCREMENT);
  }, [activeCategory]);

  // --- Dynamic Categories ---
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    newsItems.forEach(item => {
      const cat = item.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [newsItems]);

  // --- Filtered Stories (All matches) ---
  const allFilteredStories = useMemo(() => {
    if (activeCategory === "All") return newsItems;
    return newsItems.filter(item => item.category === activeCategory);
  }, [newsItems, activeCategory]);

  // --- Displayed Stories (Pagination) ---
  const displayedStories = useMemo(() => {
      return allFilteredStories.slice(0, visibleCount);
  }, [allFilteredStories, visibleCount]);

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + LOAD_INCREMENT);
  };

  const handleArticleClick = (id: string) => {
      if (onNavigate) {
          onNavigate('news-details', id);
      }
  };

  const handlePropertyClick = () => {
      if (onNavigate) {
          if (featuredProperty.id === 'fallback-regal') {
             onNavigate('properties');
          } else {
             onNavigate('property-details', featuredProperty.id);
          }
      }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
  };

  // Helper for Recent Posts (Top 3)
  const recentPosts = newsItems.slice(0, 3);

  // Render Ticker via Portal
  const TickerElement = (
      <div className={`fixed w-full z-[80] border-b border-white/5 bg-charcoal-dark/90 backdrop-blur-md overflow-hidden h-10 flex items-center top-0 transition-transform duration-1000 ease-luxury ${isHeaderVisible ? 'translate-y-[64px] md:translate-y-[72px] lg:translate-y-[80px]' : 'translate-y-0'}`}>
         <div className="animate-marquee whitespace-nowrap flex gap-16 px-4">
             {[...tickerComments, ...tickerComments, ...tickerComments].map((comment, i) => (
                 <div key={`${comment.id}-${i}`} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-white">
                     <span className="text-gold-400">{comment.author_name}</span>
                     
                     {(comment.properties?.title || comment.news?.title) && (
                         <>
                            <span className="text-white/40 px-1">on</span>
                            <span className="text-white">{comment.properties?.title || comment.news?.title}</span>
                         </>
                     )}
                     
                     <span className="text-white/30 ml-2 border-l border-white/10 pl-2">{timeAgo(comment.created_at)}</span>
                 </div>
             ))}
         </div>
         <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 40s linear infinite;
            }
         `}</style>
      </div>
  );

  return (
    <div className="bg-charcoal min-h-screen pb-20 text-white font-sans selection:bg-gold-400 selection:text-charcoal">
      
      {/* --- COMMENTS TICKER (Portaled to body) --- */}
      {createPortal(TickerElement, document.body)}

      {/* --- HERO SECTION --- */}
      <div className="relative h-[55vh] w-full overflow-hidden mt-0">
          <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop" 
                alt="Journal Hero" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-black/30"></div>
          </div>

          <div className="absolute bottom-0 left-0 w-full z-10 pb-20">
              <div className="container mx-auto px-4 md:px-6">
                  <Reveal type="slide-up">
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                          <span className="w-8 md:w-12 h-[1px] bg-gold-400"></span>
                          <span className="text-gold-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                              The Journal
                          </span>
                      </div>
                  </Reveal>

                  <Reveal type="slide-up" delay={0.1}>
                      <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display text-white max-w-4xl leading-tight mb-4 md:mb-6 drop-shadow-2xl">
                          News & Insights
                      </h1>
                  </Reveal>

                  <Reveal type="fade" delay={0.2}>
                      <p className="text-white/60 text-sm sm:text-base md:text-lg font-light max-w-xl md:max-w-2xl leading-relaxed">
                          Curated stories on architecture, luxury living, and market trends from the editorial board.
                      </p>
                  </Reveal>
              </div>
          </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="container mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row gap-16">
              
              {/* LEFT COLUMN: Feed (2/3) */}
              <div className="w-full lg:w-8/12">
                  
                  {/* Filter Bar */}
                  <div className="flex flex-wrap items-center gap-4 mb-12 border-b border-white/10 pb-6 sticky top-24 bg-charcoal z-20 pt-4 transition-colors">
                      <button 
                        onClick={() => setActiveCategory("All")}
                        className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === "All" ? "text-gold-400" : "text-white/40 hover:text-white"}`}
                      >
                          All Stories
                      </button>
                      {categories.map((cat) => (
                          <button 
                            key={cat.name}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`text-xs font-bold uppercase tracking-widest transition-colors ${activeCategory === cat.name ? "text-gold-400" : "text-white/40 hover:text-white"}`}
                          >
                              {cat.name}
                          </button>
                      ))}
                  </div>

                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs uppercase tracking-widest text-white/50">Loading Articles...</p>
                    </div>
                  )}

                  {/* Articles List */}
                  {!isLoading && (
                      <div className="space-y-16">
                          {displayedStories.length > 0 ? (
                            displayedStories.map((item, idx) => (
                              <Reveal key={item.id} type="fade" delay={idx * 0.1}>
                                  <article 
                                    onClick={() => handleArticleClick(item.id)}
                                    className="group flex flex-col md:flex-row gap-8 items-start cursor-pointer"
                                  >
                                      {/* Image */}
                                      <div className="w-full md:w-5/12 aspect-[4/3] overflow-hidden relative bg-charcoal-light">
                                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                                          <img 
                                            src={item.image_url || PLACEHOLDER_NEWS_IMAGE} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = PLACEHOLDER_NEWS_IMAGE;
                                            }}
                                          />
                                      </div>

                                      {/* Content */}
                                      <div className="w-full md:w-7/12 flex flex-col h-full justify-center">
                                          <div className="flex items-center gap-3 mb-4">
                                              <span className="text-[10px] font-bold text-gold-400 border border-gold-400/30 px-2 py-1 uppercase tracking-widest">
                                                  {item.category}
                                              </span>
                                              <span className="text-[10px] text-white/30 uppercase tracking-widest">
                                                  {formatDate(item.date)}
                                              </span>
                                          </div>

                                          <h2 className="text-2xl md:text-3xl font-serif text-white mb-4 leading-tight group-hover:text-gold-300 transition-colors">
                                              {item.title}
                                          </h2>

                                          <p className="text-white/50 text-sm font-light leading-relaxed mb-6 line-clamp-3">
                                              {item.excerpt}
                                          </p>

                                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white group-hover:underline decoration-gold-400 underline-offset-4 decoration-1">
                                              Continue Reading <ChevronRight size={14} />
                                          </div>
                                      </div>
                                  </article>
                              </Reveal>
                            ))
                          ) : (
                              <div className="text-center py-20 border border-dashed border-white/10">
                                  <p className="text-white/50 font-serif">No stories found in this category.</p>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Load More */}
                  {visibleCount < allFilteredStories.length && (
                      <div className="mt-20 text-center">
                          <Reveal type="fade">
                              <button 
                                onClick={handleLoadMore}
                                className="border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-gold-400 hover:text-charcoal hover:border-gold-400 transition-all duration-300"
                              >
                                  Load More Articles
                              </button>
                          </Reveal>
                      </div>
                  )}
              </div>

              {/* RIGHT COLUMN: Sidebar (1/3) */}
              <div className="w-full lg:w-4/12 relative">
                  <div className="sticky top-40 flex flex-col gap-8">
                      
                      {/* Divider placed ABOVE search as requested */}
                      <div className="w-full h-[1px] bg-white/20"></div>

                      {/* Search */}
                      <div className="relative group">
                          <input 
                            type="text" 
                            placeholder="Search articles..." 
                            className="w-full bg-white/5 border border-white/10 p-4 pl-12 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
                          />
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold-400 transition-colors" />
                      </div>

                      {/* Featured Sidebar Property */}
                      <div 
                        className="relative group cursor-pointer overflow-hidden border border-white/5 bg-charcoal-light shadow-2xl"
                        onClick={handlePropertyClick}
                      >
                          {/* Image Container */}
                          <div className="aspect-[3/4] overflow-hidden relative">
                             {/* Badge */}
                             <div className="absolute top-4 left-4 z-20 bg-gold-400 text-charcoal text-[10px] font-bold uppercase tracking-widest px-3 py-1 shadow-lg">
                                Featured
                             </div>
                             
                             <img 
                                src={featuredProperty.image} 
                                alt={featuredProperty.title} 
                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110" 
                             />
                             
                             {/* Gradient Overlay for Text Visibility */}
                             <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent opacity-90"></div>
                             
                             {/* Content Overlay */}
                             <div className="absolute bottom-0 left-0 w-full p-8 z-30">
                                  <h3 className="text-2xl font-serif text-white mb-2 leading-tight group-hover:text-gold-400 transition-colors">
                                      {featuredProperty.title}
                                  </h3>
                                  
                                  <div className="flex items-center gap-2 text-white/70 text-xs font-sans tracking-wide mb-6 uppercase">
                                      <MapPin size={12} className="text-gold-400" />
                                      {featuredProperty.location}
                                  </div>

                                  {/* Specs Divider */}
                                  <div className="w-12 h-[1px] bg-gold-400 mb-6"></div>

                                  <div className="grid grid-cols-3 gap-4 mb-6 text-white/90">
                                      <div className="flex flex-col gap-1">
                                          <div className="flex items-center gap-1 text-gold-400">
                                              <Bed size={14} /> 
                                              <span className="text-white text-sm font-serif">{featuredProperty.beds}</span>
                                          </div>
                                          <span className="text-[9px] uppercase tracking-widest text-white/40">Beds</span>
                                      </div>
                                      <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
                                          <div className="flex items-center gap-1 text-gold-400">
                                              <Bath size={14} /> 
                                              <span className="text-white text-sm font-serif">{featuredProperty.baths}</span>
                                          </div>
                                          <span className="text-[9px] uppercase tracking-widest text-white/40">Baths</span>
                                      </div>
                                      <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
                                          <div className="flex items-center gap-1 text-gold-400">
                                              <Maximize2 size={14} /> 
                                              <span className="text-white text-sm font-serif">{featuredProperty.sqft}</span>
                                          </div>
                                          <span className="text-[9px] uppercase tracking-widest text-white/40">SqFt</span>
                                      </div>
                                  </div>

                                  <button className="w-full bg-white/10 backdrop-blur-md border border-white/20 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                                      View Property <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                  </button>
                             </div>
                          </div>
                      </div>

                      {/* Recent Posts - Dynamic */}
                      {!isLoading && recentPosts.length > 0 && (
                        <div className="bg-charcoal-light border border-white/5 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock size={16} className="text-gold-400" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Recent Posts</h3>
                            </div>
                            <ul className="space-y-6">
                                {recentPosts.map((post, i) => (
                                    <li key={post.id} className="group cursor-pointer" onClick={() => handleArticleClick(post.id)}>
                                        <span className="text-gold-400 text-xs font-serif italic mb-1 block">0{i + 1}.</span>
                                        <h4 className="text-white font-serif text-lg leading-snug group-hover:text-gold-300 transition-colors line-clamp-2">
                                            {post.title}
                                        </h4>
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest mt-2 block">
                                            {formatDate(post.date)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                      )}

                      {/* Categories List - Dynamic */}
                      <div>
                          <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-white/10 pb-2">
                              Explore Topics
                          </h3>
                          <ul className="space-y-4">
                              <li 
                                className={`flex justify-between items-center cursor-pointer transition-colors group ${activeCategory === "All" ? "text-gold-400" : "text-white/60 hover:text-gold-400"}`}
                                onClick={() => setActiveCategory("All")}
                              >
                                  <span className="text-sm font-light">All Stories</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${activeCategory === "All" ? "bg-gold-400 text-charcoal" : "bg-white/5 group-hover:bg-gold-400 group-hover:text-charcoal"}`}>
                                      {newsItems.length}
                                  </span>
                              </li>
                              {categories.map(cat => (
                                  <li 
                                    key={cat.name} 
                                    className={`flex justify-between items-center cursor-pointer transition-colors group ${activeCategory === cat.name ? "text-gold-400" : "text-white/60 hover:text-gold-400"}`}
                                    onClick={() => setActiveCategory(cat.name)}
                                  >
                                      <span className="text-sm font-light">{cat.name}</span>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${activeCategory === cat.name ? "bg-gold-400 text-charcoal" : "bg-white/5 group-hover:bg-gold-400 group-hover:text-charcoal"}`}>
                                          {cat.count}
                                      </span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};