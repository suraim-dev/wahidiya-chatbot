import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Reveal } from './Reveal';
import { supabase } from '../services/supabaseClient';
import { Calendar, Share2, Facebook, Twitter, Linkedin, Search, MapPin, Bed, Bath, Maximize2, ArrowRight, MessageSquare, User, Mail, Clock, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsDetailsPageProps {
  newsId: string | number;
  onNavigate: (page: string, id?: string) => void;
}

// --- Types ---
interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image_url: string;
  gallery_urls?: string | string[]; // Raw column from DB (text or array)
  gallery_images?: string[]; // Processed array for UI
  excerpt: string;
  content: string; // Plain text or Markdown/HTML
  author?: string;
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
  // Join with properties table
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

export const NewsDetailsPage: React.FC<NewsDetailsPageProps> = ({ newsId, onNavigate }) => {
  const [enableTransition, setEnableTransition] = useState(false);
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<NewsItem[]>([]);
  const [featuredProperty, setFeaturedProperty] = useState<SidebarProperty>(FALLBACK_FEATURED_PROPERTY);
  
  // Comments State for Ticker
  const [tickerComments, setTickerComments] = useState<Comment[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State for sidebar categories
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  // Comment Form State
  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // --- Handle Scroll for Ticker ---
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
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

  // --- Fetch Article & Sidebar Data ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch specific article
        const { data: rawData, error: newsError } = await supabase
          .from('news')
          .select('*')
          .eq('id', newsId)
          .single();

        if (newsError) throw newsError;

        // Parse gallery_urls column
        let parsedGalleryImages: string[] = [];
        if (rawData.gallery_urls) {
            // Check if it's already an array (Supabase might parse JSONB/Array automatically)
            if (Array.isArray(rawData.gallery_urls)) {
                parsedGalleryImages = rawData.gallery_urls;
            } else if (typeof rawData.gallery_urls === 'string') {
                try {
                    // Try parsing as JSON string (e.g. "['url1', 'url2']")
                    const parsed = JSON.parse(rawData.gallery_urls);
                    if (Array.isArray(parsed)) {
                        parsedGalleryImages = parsed;
                    } else {
                        // Fallback if JSON valid but not array?
                        parsedGalleryImages = [rawData.gallery_urls]; 
                    }
                } catch (e) {
                    // If JSON parse fails, assume comma-separated string or single URL
                    if (rawData.gallery_urls.includes(',')) {
                        parsedGalleryImages = rawData.gallery_urls.split(',').map((u: string) => u.trim());
                    } else {
                        parsedGalleryImages = [rawData.gallery_urls];
                    }
                }
            }
        }

        const newsData: NewsItem = {
            ...rawData,
            image_url: rawData.image_url || rawData.image, // Fallback to 'image' if 'image_url' missing
            gallery_images: parsedGalleryImages
        };

        setArticle(newsData);
        if (newsData.category) {
            setActiveCategory(newsData.category);
        }

        // 2. Fetch All News (for sidebar counts and recent posts)
        const { data: allNewsData } = await supabase
          .from('news')
          .select('*')
          .order('date', { ascending: false });
          
        if (allNewsData) {
            setNewsItems(allNewsData);
            // Filter for recent posts sidebar (exclude current article)
            const recent = allNewsData
                .filter(n => n.id.toString() !== newsId.toString())
                .slice(0, 3);
            setRecentPosts(recent);
        }

        // 3. Fetch Featured Property
        const { data: propData } = await supabase
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

        // 4. Fetch Recent Comments for Ticker (With Property AND News Join)
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
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (newsId) {
      fetchData();
    }
    window.scrollTo(0, 0);
  }, [newsId]);

  useEffect(() => {
    // Enable transition shortly after mount to prevent initial slide animation
    const timer = setTimeout(() => setEnableTransition(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // --- Calculate Categories for Sidebar ---
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    newsItems.forEach(item => {
      const cat = item.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [newsItems]);

  // --- Gallery Images Logic ---
  const galleryImages = useMemo(() => {
      if (!article) return [];
      // Prefer parsed gallery_images, fall back to main image_url if array empty
      return (article.gallery_images && article.gallery_images.length > 0) 
          ? article.gallery_images 
          : (article.image_url ? [article.image_url] : []);
  }, [article]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
  };

  const handlePropertyClick = () => {
    if (onNavigate) {
        // If it's the fallback ID, just go to properties list, otherwise go to detail
        if (featuredProperty.id === 'fallback-regal') {
           onNavigate('properties');
        } else {
           onNavigate('property-details', featuredProperty.id);
        }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!article) return;

      setIsSubmittingComment(true);
      try {
          const { error } = await supabase.from('comments').insert({
              news_id: article.id,
              author_name: commentForm.name,
              email: commentForm.email,
              content: commentForm.message
          });

          if (error) throw error;
          
          alert("Thank you! Your comment has been submitted.");
          setCommentForm({ name: '', email: '', message: '' });
      } catch (err) {
          console.error("Error submitting comment:", err);
          alert("There was an error submitting your comment. Please try again.");
      } finally {
          setIsSubmittingComment(false);
      }
  };

  // --- Gallery Actions ---
  const openGallery = (index: number = 0) => {
      setCurrentImageIndex(index);
      setIsGalleryOpen(true);
      document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
      setIsGalleryOpen(false);
      document.body.style.overflow = '';
  };

  const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // --- Gallery Modal Component ---
  const GalleryModal = (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-fade-in">
          {/* Close Button */}
          <button 
              onClick={closeGallery} 
              className="absolute top-8 right-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-2"
          >
              <X size={32} />
          </button>

          {/* Left Navigation */}
          {galleryImages.length > 1 && (
            <button 
                onClick={prevImage} 
                className="absolute left-4 md:left-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-4 rounded-full hover:bg-white/10"
            >
                <ChevronLeft size={40} />
            </button>
          )}

          {/* Main Image */}
          <div className="w-full h-full p-4 md:p-10 flex items-center justify-center">
              <img
                  src={galleryImages[currentImageIndex]}
                  alt={`Gallery Image ${currentImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain shadow-2xl"
              />
          </div>

          {/* Right Navigation */}
          {galleryImages.length > 1 && (
            <button 
                onClick={nextImage} 
                className="absolute right-4 md:right-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-4 rounded-full hover:bg-white/10"
            >
                <ChevronRight size={40} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
              <span className="text-white/80 font-sans tracking-widest text-sm">
                  {currentImageIndex + 1} / {galleryImages.length}
              </span>
          </div>
      </div>
  );

  // Render Ticker via Portal
  const TickerElement = (
      <div className={`fixed w-full z-[80] border-b border-white/5 bg-charcoal-dark/90 backdrop-blur-md overflow-hidden h-10 flex items-center top-0 ${enableTransition ? 'transition-transform duration-1000 ease-luxury' : ''} ${isHeaderVisible ? 'translate-y-[64px] md:translate-y-[72px] lg:translate-y-[80px]' : 'translate-y-0'}`}>
         <div className="animate-marquee whitespace-nowrap flex gap-16 px-4">
             {/* Duplicate comments array multiple times to ensure smooth infinite scroll even with few items */}
             {[...tickerComments, ...tickerComments, ...tickerComments].map((comment, i) => (
                 <div key={`${comment.id}-${i}`} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
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
    <>
    
    {(!article) ? (
         <div className="min-h-screen bg-charcoal" />
    ) : (
        <div className="bg-charcoal min-h-screen pb-20 text-white font-sans selection:bg-gold-400 selection:text-charcoal">
          
          {/* --- COMMENTS TICKER (Portaled to body) --- */}
          {createPortal(TickerElement, document.body)}

          {/* --- HERO SECTION --- */}
          <div className="relative h-[80vh] w-full overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img 
                  src={article.image_url || PLACEHOLDER_NEWS_IMAGE} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.src = PLACEHOLDER_NEWS_IMAGE;
                  }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal"></div>
            </div>

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 w-full z-10 pb-20 px-6 md:px-12">
                <div className="container mx-auto">
                    <Reveal type="slide-up">
                        <span className="inline-block bg-gold-400 text-charcoal px-4 py-1 text-[10px] font-bold uppercase tracking-widest mb-6">
                            {article.category}
                        </span>
                    </Reveal>
                    
                    <Reveal type="slide-up" delay={0.1}>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white max-w-5xl leading-[1.1] mb-8 drop-shadow-2xl">
                            {article.title}
                        </h1>
                    </Reveal>

                    <Reveal type="fade" delay={0.2}>
                        <div className="flex items-center gap-8 text-white/60 text-xs font-sans uppercase tracking-widest border-t border-white/10 pt-8 max-w-2xl">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>{formatDate(article.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gold-400 font-serif italic">By {article.author || 'Admin'}</span>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
          </div>

          {/* --- CONTENT LAYOUT --- */}
          <div className="container mx-auto px-6 py-20">
              <div className="flex flex-col lg:flex-row gap-20">
                  
                  {/* Main Content (Left) */}
                  <div className="w-full lg:w-8/12">
                      <article className="prose prose-invert prose-lg max-w-none">
                          {/* Render Excerpt as Intro */}
                          {article.excerpt && (
                             <Reveal type="fade" delay={0.1}>
                                  <p className="text-xl md:text-2xl text-white font-serif leading-relaxed mb-12 italic border-l-2 border-gold-400 pl-6">
                                      {article.excerpt}
                                  </p>
                              </Reveal>
                          )}
                          
                          {/* Render HTML Content */}
                          <Reveal type="fade" delay={0.2}>
                              <div 
                                className="article-content text-white/80 font-light leading-loose text-lg"
                                dangerouslySetInnerHTML={{ __html: article.content }} 
                              />
                              <style>{`
                                .article-content p {
                                    margin-bottom: 2rem;
                                }
                                .article-content br {
                                    margin-bottom: 1rem;
                                    display: block;
                                    content: "";
                                }
                                .article-content ul {
                                    list-style-type: disc;
                                    padding-left: 1.5rem;
                                    margin-bottom: 2rem;
                                }
                                .article-content li {
                                    margin-bottom: 0.5rem;
                                }
                                .article-content strong {
                                    font-weight: 700;
                                    color: #fff;
                                }
                              `}</style>
                          </Reveal>
                      </article>

                      {/* --- NEW GALLERY SECTION --- */}
                      {galleryImages.length > 0 && (
                        <Reveal type="slide-up" delay={0.2}>
                            <div className="mt-20 mb-16 border-t border-b border-white/10 py-12">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-serif text-white">Visual Story</h3>
                                </div>
                                
                                {/* Gallery Preview Grid - Show ALL images */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {galleryImages.map((img, idx) => (
                                        <div 
                                          key={idx} 
                                          className="relative cursor-pointer group overflow-hidden aspect-[4/3]"
                                          onClick={() => openGallery(idx)}
                                        >
                                            <img 
                                              src={img} 
                                              alt={`Gallery Image ${idx + 1}`} 
                                              className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
                                            />
                                            
                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                                {/* Button-like Appearance */}
                                                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                                    <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white p-4 rounded-full hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-300 shadow-2xl flex flex-col items-center gap-2 group/btn">
                                                        <Camera size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                      )}

                      {/* Share */}
                      <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="flex items-center gap-4">
                              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Share</span>
                              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 transition-colors" aria-label="Share on Facebook">
                                  <Facebook size={16} />
                              </button>
                              <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#E60023] hover:border-[#E60023] transition-colors" aria-label="Share on Pinterest">
                                 {/* Pinterest SVG */}
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.017 0C5.396 0 0.029 5.367 0.029 11.987C0.029 16.945 3.159 21.218 7.378 22.955C7.261 22.023 7.279 20.806 7.498 19.863C7.696 19.015 8.784 14.417 8.784 14.417C8.784 14.417 8.448 13.743 8.448 12.75C8.448 11.009 9.457 9.709 10.716 9.709C11.787 9.709 12.304 10.513 12.304 11.474C12.304 12.548 11.619 14.153 11.264 15.638C10.967 16.88 11.889 17.892 13.111 17.892C15.303 17.892 16.989 15.586 16.989 12.261C16.989 9.309 14.921 7.243 11.944 7.243C8.526 7.243 6.517 9.807 6.517 12.448C6.517 12.964 6.616 13.518 6.859 13.987C6.969 14.2 6.953 14.329 6.849 14.717C6.776 14.989 6.726 15.19 6.467 15.309C5.516 14.869 4.908 13.488 4.908 12.427C4.908 8.875 7.487 4.14 12.378 4.14C16.307 4.14 19.344 6.941 19.344 12.11C19.344 17.525 15.927 21.875 13.255 21.875C12.355 21.875 11.511 21.396 11.222 20.844L10.669 22.951C10.463 23.737 9.907 24.795 9.479 25.437C10.286 25.676 11.139 25.803 12.017 25.803C18.638 25.803 24.005 20.436 24.005 13.816C24.005 7.195 18.638 1.828 12.017 1.828V0Z"/>
                                 </svg>
                              </button>
                          </div>
                      </div>

                      {/* Leave a Reply (Added Section) */}
                      <div className="mt-20">
                          <Reveal type="slide-up">
                              <div className="bg-white/5 border border-white/5 rounded-xl p-8 md:p-12 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-transparent to-transparent"></div>
                                  <div className="flex items-center gap-3 mb-6">
                                      <div className="p-3 rounded-full bg-gold-400/10 text-gold-400">
                                          <MessageSquare size={20} />
                                      </div>
                                      <h3 className="text-2xl font-serif text-white">Leave a Reply</h3>
                                  </div>
                                  <p className="text-xs text-white/40 mb-10 font-light tracking-wide">Your email address will not be published.</p>
                                  
                                  <form className="space-y-8" onSubmit={handleFormSubmit}>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div className="relative group">
                                              <div className="absolute left-0 top-3 text-gold-400">
                                                  <User size={16} />
                                              </div>
                                              <input 
                                                  type="text" 
                                                  placeholder="Your Name" 
                                                  required 
                                                  className="w-full bg-transparent border-b border-white/10 py-3 pl-8 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors placeholder:text-white/20"
                                                  value={commentForm.name}
                                                  onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                                              />
                                          </div>
                                          <div className="relative group">
                                              <div className="absolute left-0 top-3 text-gold-400">
                                                  <Mail size={16} />
                                              </div>
                                              <input 
                                                  type="email" 
                                                  placeholder="Your Email" 
                                                  required 
                                                  className="w-full bg-transparent border-b border-white/10 py-3 pl-8 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors placeholder:text-white/20"
                                                  value={commentForm.email}
                                                  onChange={(e) => setCommentForm({...commentForm, email: e.target.value})}
                                              />
                                          </div>
                                      </div>
                                      <div className="relative">
                                          <textarea 
                                              rows={5} 
                                              placeholder="Write your comment here..." 
                                              required 
                                              className="w-full bg-white/5 border border-white/10 rounded-lg p-6 text-sm text-white focus:outline-none focus:ring-0 focus:border-gold-400 focus:bg-white/10 placeholder:text-white/20 resize-none"
                                              value={commentForm.message}
                                              onChange={(e) => setCommentForm({...commentForm, message: e.target.value})}
                                          ></textarea>
                                      </div>
                                      <button 
                                          type="submit" 
                                          disabled={isSubmittingComment}
                                          className="px-10 py-4 bg-white text-charcoal text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold-400 transition-colors duration-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                          {isSubmittingComment ? "Posting..." : "Post Comment"}
                                      </button>
                                  </form>
                              </div>
                          </Reveal>
                      </div>
                  </div>

                  {/* Sidebar (Right) */}
                  <div className="w-full lg:w-4/12 relative">
                      <div className="sticky top-32 flex flex-col gap-8">
                          
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
                              <div className="bg-[#151515] border border-white/5 p-8">
                                  <div className="flex items-center gap-3 mb-6">
                                      <Clock size={16} className="text-gold-400" />
                                      <h3 className="text-sm font-bold uppercase tracking-widest text-white">Recent Posts</h3>
                                  </div>
                                  <ul className="space-y-6">
                                      {recentPosts.map((post, i) => (
                                          <li key={post.id} className="group cursor-pointer" onClick={() => onNavigate('news-details', post.id)}>
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

                          {/* Categories List */}
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
    )}
    
    {/* --- FULL SCREEN GALLERY MODAL (Rendered in Portal) --- */}
    {isGalleryOpen && createPortal(GalleryModal, document.body)}
    </>
  );
};