import React, { useEffect, useState } from 'react';
import { Reveal } from './Reveal';
import { supabase } from '../services/supabaseClient';
import { LogoCarousel } from './ui/logo-carousel';
import { MovingBorderCard } from './ui/moving-border-card';

interface PartnersAndNewsProps {
    onNavigate?: (page: string, id?: string) => void;
}

interface NewsItem {
    id: string;
    title: string;
    date: string;
    category: string;
}

export const PartnersAndNews: React.FC<PartnersAndNewsProps> = ({ onNavigate }) => {
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);

  const partnersLogos = [
        { id: 1, name: "KSRM", src: "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/KSRM.png" },
        { id: 2, name: "Tradexcel", src: "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/TRADEXCEL.png" },
        { id: 3, name: "PHP Family", src: "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/PHPFamily.png" },
        { id: 4, name: "Rosewood Home", src: "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/ROSEWOOD%20HOME.png" },
        { id: 5, name: "Ironwood", src: "https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Picture_of_header/IRONWOOD.png" },
    ];

  useEffect(() => {
    const fetchNews = async () => {
        const { data } = await supabase
            .from('news')
            .select('id, title, date, category')
            .order('date', { ascending: false })
            .limit(3);
        
        if (data) {
            setRecentNews(data);
        } else {
             // Fallback for visual stability if no news
             setRecentNews([
                 { id: '1', title: "GALAXY LINE", date: "MAR 05", category: "PROJECT SIGNING" },
                 { id: '2', title: "PANSHI TOWER", date: "SEP 20", category: "PROJECT SIGNING" },
                 { id: '3', title: "PADMA SKY HEIGHTS", date: "AUG 11", category: "PROJECT SIGNING" }
             ]);
        }
    };
    fetchNews();
  }, []);

  const handleNewsClick = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      if (onNavigate) onNavigate('news-details', id);
  };

  const formatDate = (dateStr: string) => {
      // Fallback format if string is just text like "OCT 24"
      if (!dateStr.includes('-')) return dateStr;
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
  };

  return (
    <section className="py-32 bg-charcoal text-white border-t border-white/5 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none">
            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* News & Updates Header */}
        <div className="text-center mb-20">
             <Reveal type="slide-up">
                 <div className="flex items-center gap-4 justify-center mb-4">
                      <span className="w-8 h-[1px] bg-gold-400"></span>
                      <span className="text-gold-400 font-sans text-xs font-bold uppercase tracking-[0.2em]">
                         Check Out Recent
                      </span>
                      <span className="w-8 h-[1px] bg-gold-400"></span>
                 </div>
             </Reveal>
             <Reveal type="slide-up" delay={0.1}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
                    News & Updates
                </h2>
             </Reveal>
             <Reveal type="fade" delay={0.2}>
                <p className="text-white/60 font-sans font-light text-lg">
                    From real estate industry and beyond.
                </p>
             </Reveal>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 border-b border-white/5 pb-10">
             {recentNews.map((item, idx) => (
                 <Reveal key={item.id} type="fade" delay={0.3 + (idx * 0.1)}>
                    <MovingBorderCard href="#" onClick={(e) => handleNewsClick(e, item.id)} className="h-full">
                        <div className="flex justify-between items-start mb-3 md:mb-6">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-400 border border-gold-400/20 px-2 py-1">{item.category}</span>
                            <span className="text-white/40 text-xs font-sans">{formatDate(item.date)}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-serif text-white mb-4 leading-tight group-hover:text-gold-300 transition-colors uppercase">
                            {item.title}
                        </h3>
                    </MovingBorderCard>
                 </Reveal>
             ))}
        </div>

        {/* Partners Header */}
        <div className="text-center mb-10">
             <Reveal type="slide-up">
                 <div className="flex items-center gap-4 justify-center mb-4">
                     <span className="text-gold-400 font-sans text-xs font-bold uppercase tracking-[0.2em]">
                        Our
                     </span>
                 </div>
             </Reveal>
             <Reveal type="slide-up" delay={0.1}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
                    Partners
                </h2>
             </Reveal>
             <Reveal type="fade" delay={0.2}>
                <p className="text-white/60 font-sans font-light text-lg">
                    We honored to have these amazing partners.
                </p>
             </Reveal>
        </div>

        {/* Logos Carousel */}
        <div className="w-full max-w-5xl mx-auto px-4">
            <LogoCarousel logos={partnersLogos} columns={3} />
        </div>

      </div>
    </section>
  );
};
