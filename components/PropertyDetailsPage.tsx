import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Property } from '../types';
import { supabase } from '../services/supabaseClient';
import { Reveal } from './Reveal';
import { PropertyMap } from './PropertyMap';
import { 
    Bed, Bath, Maximize2, MapPin, Share2, Printer, GitCompare, Heart, 
    Car, Shield, CheckCircle2, Play, ChevronDown, ChevronUp, User, Mail, 
    MessageSquare, ArrowRight, Camera, Flame, Zap, ArrowUpFromLine, 
    Trees, Utensils, Users, Dumbbell, Wifi, Armchair, Fan, Tv, Baby, Wrench,
    X, ChevronLeft, ChevronRight, Facebook
} from 'lucide-react';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1600596542815-27b88e57e62f?q=80&w=2672&auto=format&fit=crop";

// Custom SVG Icons for Social Media (Matching NewsDetailsPage)
const PinterestIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.017 0C5.396 0 0.029 5.367 0.029 11.987C0.029 16.945 3.159 21.218 7.378 22.955C7.261 22.023 7.279 20.806 7.498 19.863C7.696 19.015 8.784 14.417 8.784 14.417C8.784 14.417 8.448 13.743 8.448 12.75C8.448 11.009 9.457 9.709 10.716 9.709C11.787 9.709 12.304 10.513 12.304 11.474C12.304 12.548 11.619 14.153 11.264 15.638C10.967 16.88 11.889 17.892 13.111 17.892C15.303 17.892 16.989 15.586 16.989 12.261C16.989 9.309 14.921 7.243 11.944 7.243C8.526 7.243 6.517 9.807 6.517 12.448C6.517 12.964 6.616 13.518 6.859 13.987C6.969 14.2 6.953 14.329 6.849 14.717C6.776 14.989 6.726 15.19 6.467 15.309C5.516 14.869 4.908 13.488 4.908 12.427C4.908 8.875 7.487 4.14 12.378 4.14C16.307 4.14 19.344 6.941 19.344 12.11C19.344 17.525 15.927 21.875 13.255 21.875C12.355 21.875 11.511 21.396 11.222 20.844L10.669 22.951C10.463 23.737 9.907 24.795 9.479 25.437C10.286 25.676 11.139 25.803 12.017 25.803C18.638 25.803 24.005 20.436 24.005 13.816C24.005 7.195 18.638 1.828 12.017 1.828V0Z"/>
    </svg>
);
const TelegramIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.944 0C5.348 0 0 5.348 0 11.944C0 18.54 5.348 23.888 11.944 23.888C18.54 23.888 23.888 18.54 23.888 11.944C23.888 5.348 18.54 0 11.944 0ZM17.656 8.356L15.716 17.512C15.568 18.156 15.184 18.312 14.644 18.008L11.68 15.824L10.252 17.2C10.096 17.356 9.964 17.488 9.664 17.488L9.876 14.476L15.356 9.524C15.596 9.312 15.304 9.192 14.988 9.4L8.212 13.672L5.288 12.76C4.652 12.56 4.64 12.124 5.42 11.816L16.852 7.412C17.38 7.22 17.844 7.54 17.656 8.356Z"/>
    </svg>
);
const WhatsAppIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.0117 0C5.38531 0 0.0117188 5.37359 0.0117188 12C0.0117188 14.1033 0.557812 16.1555 1.62188 17.9953L0.264844 22.957L5.34141 21.6234C7.09219 22.582 9.07031 23.0859 11.9805 23.0859H12.0086C18.6352 23.0859 24.0086 17.7123 24.0086 11.0859C24.0086 7.90078 22.7555 4.90547 20.482 2.65078C18.2086 0.396094 15.1969 0 12.0117 0ZM12.0086 21.0773C9.33281 21.0773 7.56797 20.3531 6.57422 19.7648L5.98359 19.4133L3.13828 20.1586L3.89766 17.3836L3.51328 16.7719C2.86875 15.7477 2.01797 13.9102 2.01797 12.0023C2.01797 6.49453 6.50156 2.01094 12.0156 2.01094C14.6859 2.01094 17.1961 3.05156 19.0828 4.94062C20.9695 6.82969 22.0078 9.34219 22.0078 12.0141C22.0078 17.5219 17.5219 21.0773 12.0086 21.0773ZM17.4914 14.4938C17.1914 14.3438 15.7148 13.6148 15.4383 13.5141C15.1617 13.4133 14.9617 13.3641 14.7609 13.6641C14.5602 13.9641 13.9875 14.6391 13.8117 14.8383C13.6359 15.0398 13.4602 15.0641 13.1602 14.9133C12.8594 14.7625 11.8922 14.4469 10.7461 13.425C9.84141 12.6188 9.23203 11.625 9.05625 11.325C8.88047 11.025 9.0375 10.8633 9.1875 10.7133C9.32344 10.5773 9.48984 10.3594 9.63984 10.1836C9.79219 10.0078 9.84141 9.88359 9.94219 9.68203C10.0422 9.48281 9.99219 9.30703 9.91641 9.15703C9.84141 9.00703 9.23906 7.52578 8.98828 6.92344C8.74453 6.3375 8.49609 6.41719 8.31094 6.40781C8.13516 6.39844 7.93594 6.39844 7.73516 6.39844C7.53437 6.39844 7.20937 6.47344 6.93281 6.77344C6.65625 7.07344 5.87813 7.80234 5.87813 9.28359C5.87813 10.7648 6.95625 12.1945 7.10625 12.3961C7.25625 12.5953 9.21328 15.6117 12.2109 16.9055C12.9234 17.2125 13.4812 17.3977 13.9195 17.5359C14.625 17.7594 15.2742 17.7289 15.7875 17.6516C16.357 17.5672 17.5414 16.9336 17.7922 16.2305C18.0422 15.5273 18.0422 14.925 17.9672 14.7984C17.8922 14.6742 17.6914 14.5992 17.3906 14.4492H17.4914Z"/>
    </svg>
);

interface PropertyDetailsPageProps {
  propertyId: string;
  onNavigate: (page: string, id?: string) => void;
}

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ propertyId, onNavigate }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [floorPlanOpen, setFloorPlanOpen] = useState(true);
  const [selectedFloorPlanIndex, setSelectedFloorPlanIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  
  // Share State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  
  // Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Floor Plan Modal State
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false);

  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Comment Form State
  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setIsLoading(true);
      try {
        const { data: rawData, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (error) throw error;
        const data = rawData as any;

        if (data) {
           let coords = { lat: 0, lng: 0 };
           if (data.coordinates) {
               try {
                   const c = typeof data.coordinates === 'string' ? JSON.parse(data.coordinates as string) : data.coordinates;
                   if (c) {
                       coords.lat = parseFloat((c.lat || c.latitude || 0) as string);
                       coords.lng = parseFloat((c.lng || c.longitude || 0) as string);
                   }
               } catch (e) { console.warn("Error parsing coordinates:", e); }
           }

           let parsedFloorPlans = [];
           const rawFloorPlans = data.floorPlans;
           if (rawFloorPlans) {
               let tempPlans = rawFloorPlans;
               if (typeof rawFloorPlans === 'string') {
                   try { tempPlans = JSON.parse(rawFloorPlans as string); } catch (e) { tempPlans = []; }
               }
               
               if (Array.isArray(tempPlans)) {
                   parsedFloorPlans = tempPlans.map((fp: any, idx: number) => {
                       if (typeof fp === 'string') return { title: `Floor Plan ${idx + 1}`, image: fp };
                       return {
                           title: fp.title || fp.name || `Floor Plan ${idx + 1}`,
                           image: fp.image,
                           beds: fp.beds,
                           baths: fp.baths,
                           sqft: fp.sqft
                       };
                   });
               }
           }

           let glance: { label: string; value: string }[] = [];
           if (data.at_a_glance && Array.isArray(data.at_a_glance) && data.at_a_glance.length > 0) {
               glance = data.at_a_glance;
           } else if (data.at_a_glance && typeof data.at_a_glance === 'object') {
                glance = Object.entries(data.at_a_glance).map(([key, value]) => ({
                    label: key.replace(/_/g, ' '),
                    value: String(value)
                }));
           } else {
               if (data.project_name || data.title) glance.push({ label: 'Project Name', value: data.project_name || data.title });
               if (data.address || data.location) glance.push({ label: 'Address', value: data.address || data.location });
               if (data.land_area) glance.push({ label: 'Land Area', value: data.land_area });
               if (data.no_of_floors || data.floors || data.number_of_floors) glance.push({ label: 'No of Floors', value: data.no_of_floors || data.floors || data.number_of_floors });
               if (data.apartment_size || data.sqft) glance.push({ label: 'Apartment Size', value: (data.apartment_size || data.sqft) + (String(data.apartment_size || data.sqft).toLowerCase().includes('sq') ? '' : ' Sq Ft') });
               if (data.type || data.project_type) glance.push({ label: 'Type', value: data.type || data.project_type });
               if (data.launch_date) glance.push({ label: 'Launch Date', value: data.launch_date });
               if (data.handover_date || data.completion_date) glance.push({ label: 'Completion Date', value: data.handover_date || data.completion_date });
               if (data.status || data.tag) glance.push({ label: 'Status', value: data.status || data.tag });
               if (data.facing) glance.push({ label: 'Facing', value: data.facing });
           }

           const formatted: Property = {
              id: data.id?.toString(),
              title: data.title,
              location: data.location,
              price: data.price || "Price on Request",
              image: data.imageUrl || data.image || PLACEHOLDER_IMAGE,
              images: data.galleryImages || [data.imageUrl || data.image || PLACEHOLDER_IMAGE], 
              beds: data.beds,
              baths: data.baths,
              sqft: data.sqft,
              tag: data.tag || 'Sale',
              garage: data.garage || data.garages, // Update mapping to prefer garage
              type: data.type || 'Residential',
              latitude: coords.lat,
              longitude: coords.lng,
              features: data.features || [],
              facilities: data.facilities || [],
              at_a_glance: glance,
              floorPlans: parsedFloorPlans,
              videoUrl: data.videoUrl,
              featured: data.featured,
              ready_flat: data.ready_flat
           };
           setProperty(formatted);

           // Check saved state
           const stored = localStorage.getItem('favorites');
           if (stored) {
               const favs = JSON.parse(stored);
               setIsSaved(!!favs.find((p: Property) => p.id === formatted.id));
           }

           // Check compare state
           const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
           setIsInCompare(!!compareList.find((p: Property) => p.id === formatted.id));
        }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    fetchPropertyDetails();
    window.scrollTo(0, 0);
  }, [propertyId]);

  // Handle Share Popover Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
            setIsShareOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSave = () => {
      if (!property) return;
      const stored = localStorage.getItem('favorites');
      let currentFavs: Property[] = stored ? JSON.parse(stored) : [];
      
      if (isSaved) {
          currentFavs = currentFavs.filter(p => p.id !== property.id);
          setIsSaved(false);
      } else {
          currentFavs.push(property);
          setIsSaved(true);
      }
      localStorage.setItem('favorites', JSON.stringify(currentFavs));
  };

  const handleCompare = () => {
      if (!property) return;
      
      const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
      let newList;
      if (isInCompare) {
          newList = compareList.filter((p: Property) => p.id !== property.id);
          setIsInCompare(false);
      } else {
          if (compareList.length >= 3) {
              alert("You can only compare up to 3 properties.");
              return;
          }
          newList = [...compareList, property];
          setIsInCompare(true);
      }
      localStorage.setItem('compareList', JSON.stringify(newList));
      window.dispatchEvent(new Event('compare-updated'));
  };

  const handlePrint = () => {
      if (!property) return;
      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (printWindow) {
          printWindow.document.write(`
              <html>
                  <head>
                      <title>Print - ${property.title}</title>
                      <style>
                          body { font-family: 'Times New Roman', serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
                          .header { border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                          .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.1em; }
                          h1 { font-size: 32px; margin: 0 0 10px 0; }
                          .location { color: #666; font-style: italic; margin-bottom: 20px; }
                          .main-image { width: 100%; height: 400px; object-fit: cover; margin-bottom: 30px; border: 1px solid #eee; }
                          .specs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee; margin-bottom: 30px; }
                          .spec-item { text-align: center; }
                          .spec-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 5px; }
                          .spec-value { font-size: 18px; font-weight: bold; }
                          .description { line-height: 1.6; margin-bottom: 30px; font-size: 14px; }
                          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 50px; text-transform: uppercase; letter-spacing: 0.1em; }
                          @media print {
                              body { -webkit-print-color-adjust: exact; }
                          }
                      </style>
                  </head>
                  <body>
                      <div class="header">
                          <div class="logo">NAVANA</div>
                          <div>${new Date().toLocaleDateString()}</div>
                      </div>
                      
                      <img src="${property.image}" class="main-image" />
                      
                      <h1>${property.title}</h1>
                      <div class="location">${property.location}</div>
                      
                      <div class="specs">
                          <div class="spec-item">
                              <div class="spec-label">Bedrooms</div>
                              <div class="spec-value">${property.beds}</div>
                          </div>
                          <div class="spec-item">
                              <div class="spec-label">Bathrooms</div>
                              <div class="spec-value">${property.baths}</div>
                          </div>
                          <div class="spec-item">
                              <div class="spec-label">Area</div>
                              <div class="spec-value">${property.sqft} Sq Ft</div>
                          </div>
                          <div class="spec-item">
                              <div class="spec-label">Price</div>
                              <div class="spec-value">${property.price}</div>
                          </div>
                      </div>

                      <div class="description">
                          <h3>Features</h3>
                          <p>${property.features?.join(', ') || 'No specific features listed.'}</p>
                          
                          <h3>Facilities</h3>
                          <p>${property.facilities?.join(', ') || 'No specific facilities listed.'}</p>
                      </div>

                      <div class="footer">
                          © Navana Real Estate | ${window.location.origin}
                      </div>
                      <script>
                          window.onload = function() { window.print(); }
                      </script>
                  </body>
              </html>
          `);
          printWindow.document.close();
      }
  };

  const handleSocialShare = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${property?.title}`;
    let url = '';
    
    switch (platform) {
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            break;
        case 'pinterest':
            url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(property?.image || '')}&description=${encodeURIComponent(shareText)}`;
            break;
        case 'telegram':
            url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
            break;
        case 'whatsapp':
            url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'width=600,height=400');
        setIsShareOpen(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!property) return;
      
      setIsSubmittingComment(true);
      try {
          const { error } = await supabase.from('comments').insert({
              property_id: property.id,
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

  // ... Gallery & FloorPlan functions same as before ...
  const openGallery = (index: number = 0) => { setCurrentImageIndex(index); setIsGalleryOpen(true); document.body.style.overflow = 'hidden'; };
  const closeGallery = () => { setIsGalleryOpen(false); document.body.style.overflow = ''; };
  const nextImage = (e: React.MouseEvent) => { e.stopPropagation(); if (!property?.images) return; setCurrentImageIndex((prev) => (prev + 1) % property.images!.length); };
  const prevImage = (e: React.MouseEvent) => { e.stopPropagation(); if (!property?.images) return; setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length); };
  const openFloorPlanModal = () => { setIsFloorPlanModalOpen(true); document.body.style.overflow = 'hidden'; };
  const closeFloorPlanModal = () => { setIsFloorPlanModalOpen(false); document.body.style.overflow = ''; };
  const nextFloorPlan = (e: React.MouseEvent) => { e.stopPropagation(); if (!property?.floorPlans) return; setSelectedFloorPlanIndex((prev) => (prev + 1) % property.floorPlans!.length); };
  const prevFloorPlan = (e: React.MouseEvent) => { e.stopPropagation(); if (!property?.floorPlans) return; setSelectedFloorPlanIndex((prev) => (prev - 1 + property.floorPlans!.length) % property.floorPlans!.length); };
  const handlePlayVideo = () => { if (videoRef.current) { if (videoRef.current.paused) { videoRef.current.play(); setIsVideoPlaying(true); } else { videoRef.current.pause(); setIsVideoPlaying(false); } } };

  // Calculate safe values for render
  const displayFacilities = property?.facilities?.length ? property.facilities : [
      "Heavy Secured gateway with spacious Entrance and Drive Way.", "Appropriate Security Provision for Control Incoming & out going Person, Vehicles, Goods etc.", "Main Lobby, Guard Room, Reception Room, Driver Room, Individual Mail Box for each Flat etc.", "Good Quality Lift for 8-Passengers, Generator and Water Pump.", "Reserved Car parking at ground floor with comfortable drive way.", "Sufficient lighting arrangement in verandas, common space and staircase.", "Underground Water Reservoir with one Lifting Pump.", "Electricity supply approx. 220/440V from PDB source with separate Main Cable.", "Water Supply pipeline connection with each apartment.", "Provision for Telephone and central Dish Cable connection with each apartment.", "Provision for Intercom System with each apartment.", "RCC frame as per BNBC code to sustain cyclone and about 7.5 Richter scale earth tremor."
  ];

  const getFeatureIcon = (feature: string) => {
    const text = feature.toLowerCase();
    if (text.includes('security') || text.includes('guard')) return <Shield size={14} />;
    if (text.includes('cctv') || text.includes('camera')) return <Camera size={14} />;
    if (text.includes('fire') || text.includes('extinguisher')) return <Flame size={14} />;
    if (text.includes('service') || text.includes('maintenance')) return <Wrench size={14} />;
    if (text.includes('kids') || text.includes('play')) return <Baby size={14} />;
    if (text.includes('gym') || text.includes('fitness')) return <Dumbbell size={14} />;
    if (text.includes('bbq')) return <Utensils size={14} />;
    if (text.includes('community') || text.includes('hall')) return <Users size={14} />;
    if (text.includes('wifi')) return <Wifi size={14} />;
    if (text.includes('reception') || text.includes('lobby')) return <Armchair size={14} />;
    if (text.includes('garden') || text.includes('lawn')) return <Trees size={14} />;
    if (text.includes('parking') || text.includes('garage')) return <Car size={14} />;
    if (text.includes('kitchen')) return <Utensils size={14} />;
    if (text.includes('lift') || text.includes('elevator')) return <ArrowUpFromLine size={14} />;
    if (text.includes('generator') || text.includes('power')) return <Zap size={14} />;
    if (text.includes('ac') || text.includes('cool')) return <Fan size={14} />;
    if (text.includes('tv')) return <Tv size={14} />;
    return <CheckCircle2 size={14} />;
  };

  const uniqueFeatures = Array.from(new Set(property?.features || [])) as string[];
  const currentFloorPlan = property?.floorPlans && property.floorPlans.length > 0 ? property.floorPlans[selectedFloorPlanIndex] : { title: "Typical Floor Plan", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?q=80&w=2574&auto=format&fit=crop" };

  // Modals JSX
  const GalleryModal = (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-fade-in">
          <button onClick={closeGallery} className="absolute top-8 right-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-2"><X size={32} /></button>
          <button onClick={prevImage} className="absolute left-4 md:left-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-4 rounded-full hover:bg-white/10"><ChevronLeft size={40} /></button>
          <div className="w-full h-full p-4 md:p-10 flex items-center justify-center">
              <img src={property?.images?.[currentImageIndex] || PLACEHOLDER_IMAGE} alt={`Gallery ${currentImageIndex + 1}`} className="max-h-full max-w-full object-contain shadow-2xl" />
          </div>
          <button onClick={nextImage} className="absolute right-4 md:right-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-4 rounded-full hover:bg-white/10"><ChevronRight size={40} /></button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10"><span className="text-white/80 font-sans tracking-widest text-sm">{currentImageIndex + 1} / {property?.images?.length || 1}</span></div>
      </div>
  );

  const FloorPlanModal = (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-fade-in">
          <button onClick={closeFloorPlanModal} className="absolute top-8 right-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-2"><X size={32} /></button>
          {property?.floorPlans && property.floorPlans.length > 1 && (<><button onClick={prevFloorPlan} className="absolute left-4 md:left-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-4 rounded-full hover:bg-white/10"><ChevronLeft size={40} /></button><button onClick={nextFloorPlan} className="absolute right-4 md:right-8 text-white/70 hover:text-gold-400 transition-colors z-50 p-4 rounded-full hover:bg-white/10"><ChevronRight size={40} /></button></>)}
          <div className="w-full h-full p-4 md:p-10 flex items-center justify-center">
              <img src={property?.floorPlans?.[selectedFloorPlanIndex]?.image || PLACEHOLDER_IMAGE} alt="Floor Plan" className="max-h-full max-w-full object-contain shadow-2xl bg-white" />
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-center">
              <span className="block text-white/90 font-serif text-lg mb-1">{property?.floorPlans?.[selectedFloorPlanIndex]?.title || `Floor Plan ${selectedFloorPlanIndex + 1}`}</span>
              <span className="text-white/50 font-sans tracking-widest text-xs uppercase">{selectedFloorPlanIndex + 1} / {property?.floorPlans?.length || 1}</span>
          </div>
      </div>
  );

  return (
    <>
        {(!property || isLoading) ? (
            <div className="min-h-screen bg-charcoal flex items-center justify-center z-50">
                 <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : (
            <div className="bg-charcoal min-h-screen pb-20 text-white font-sans relative">
                <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden bg-charcoal-dark">
                    <Reveal type="zoom" className="w-full h-full">
                        <img src={property.image} alt={property.title} className="w-full h-full object-cover opacity-80" />
                    </Reveal>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-charcoal/90"></div>
                    <div className="absolute bottom-40 right-4 md:right-10 md:bottom-48 z-10">
                        <button onClick={() => openGallery(0)} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold-400 hover:text-charcoal hover:border-gold-400 transition-all duration-300 shadow-xl">
                            <Maximize2 size={16} /> View Gallery ({property.images?.length || 1})
                        </button>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-20 -mt-20 md:-mt-40 mb-20">
                    <Reveal type="slide-up">
                        <div className="bg-[#151515] border border-white/10 p-6 md:p-10 rounded-xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-50"></div>
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8 relative z-10">
                                <div className="flex flex-col gap-4 w-full lg:w-auto">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-charcoal text-white border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">{property.tag}</span>
                                        {property.featured && <span className="bg-gold-400 text-charcoal px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Featured</span>}
                                        {property.ready_flat && <span className="bg-[#10B981] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Ready Flat</span>}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-display text-white mb-2 leading-tight">{property.title}</h1>
                                        <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm font-sans tracking-wide">
                                            <MapPin size={16} className="text-gold-400" />{property.location}
                                        </div>
                                    </div>
                                </div>

                                {/* Responsive Action Buttons */}
                                <div className="flex flex-nowrap items-center gap-3 w-full lg:w-auto mt-6 lg:mt-0 overflow-x-auto no-scrollbar">
                                    {/* Share Button */}
                                    <div className="relative shrink-0" ref={shareRef}>
                                        <button 
                                            className="w-12 h-12 shrink-0 rounded-full border border-gold-400/30 text-gold-400 flex items-center justify-center hover:bg-gold-400 hover:text-charcoal hover:border-gold-400 transition-all duration-300 group bg-charcoal/50 backdrop-blur-sm" 
                                            onClick={() => setIsShareOpen(!isShareOpen)}
                                            title="Share"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                        
                                        {/* Social Popover */}
                                        <div className={`absolute bottom-full left-0 mb-4 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl p-4 flex items-center gap-3 min-w-max transform origin-bottom-left transition-all duration-300 z-50 ${isShareOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                                            <button onClick={() => handleSocialShare('facebook')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-600 transition-colors bg-white/5" title="Share on Facebook"><Facebook size={16} /></button>
                                            <button onClick={() => handleSocialShare('pinterest')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#E60023] hover:border-[#E60023] transition-colors bg-white/5" title="Share on Pinterest"><PinterestIcon /></button>
                                            <button onClick={() => handleSocialShare('telegram')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#0088cc] hover:border-[#0088cc] transition-colors bg-white/5" title="Share on Telegram"><TelegramIcon /></button>
                                            <button onClick={() => handleSocialShare('whatsapp')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#25D366] hover:border-[#25D366] transition-colors bg-white/5" title="Share on WhatsApp"><WhatsAppIcon /></button>
                                        </div>
                                    </div>

                                    {/* Print Button */}
                                    <button className="w-12 h-12 shrink-0 rounded-full border border-gold-400/30 text-gold-400 flex items-center justify-center hover:bg-gold-400 hover:text-charcoal hover:border-gold-400 transition-all duration-300 group bg-charcoal/50 backdrop-blur-sm" onClick={handlePrint} title="Print"><Printer size={18} /></button>
                                    
                                    {/* Save Button */}
                                    <button 
                                        onClick={handleToggleSave} 
                                        className={`h-12 px-4 sm:px-6 flex-1 rounded-full border flex items-center justify-center gap-2 transition-all duration-300 uppercase text-[10px] font-bold tracking-widest group backdrop-blur-sm min-w-0 ${
                                            isSaved 
                                            ? 'bg-red-600 border-red-600 text-white hover:bg-white hover:text-red-600 hover:border-white' 
                                            : 'border-gold-400/30 text-gold-400 hover:bg-gold-400 hover:text-charcoal hover:border-gold-400 bg-charcoal/50'
                                        }`} 
                                        title={isSaved ? "Remove from Saved" : "Save Property"}
                                    >
                                        <Heart size={16} className={`transition-colors shrink-0 ${isSaved ? 'fill-current' : ''}`} />
                                        <span>Save</span>
                                    </button>
                                    
                                    {/* Compare Button */}
                                    <button 
                                        onClick={handleCompare}
                                        className={`h-12 px-4 sm:px-6 flex-[1.2] rounded-full border flex items-center justify-center gap-2 transition-all duration-300 uppercase text-[10px] font-bold tracking-widest group backdrop-blur-sm min-w-0 ${
                                            isInCompare 
                                            ? 'bg-gold-400 text-charcoal border-gold-400 hover:bg-white hover:text-charcoal hover:border-white' // Gold filled when added
                                            : 'border-gold-400/30 text-gold-400 hover:bg-gold-400 hover:text-charcoal hover:border-gold-400 bg-charcoal/50'
                                        }`}
                                        title={isInCompare ? "Remove from Compare" : "Add to Compare"}
                                    >
                                        <GitCompare size={16} className="shrink-0" />
                                        <span>Compare</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
                        <div className="w-full">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                                <Reveal type="fade" delay={0.1}><div className="bg-white/5 border border-white/5 p-6 md:p-8 rounded-lg text-center group hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-500"><Bed size={24} className="mx-auto mb-4 text-gold-400 group-hover:text-charcoal transition-colors" /><span className="block text-2xl md:text-3xl font-serif font-bold mb-1">{property.beds}</span><span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-60">Bedrooms</span></div></Reveal>
                                <Reveal type="fade" delay={0.2}><div className="bg-white/5 border border-white/5 p-6 md:p-8 rounded-lg text-center group hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-500"><Bath size={24} className="mx-auto mb-4 text-gold-400 group-hover:text-charcoal transition-colors" /><span className="block text-2xl md:text-3xl font-serif font-bold mb-1">{property.baths}</span><span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-60">Bathrooms</span></div></Reveal>
                                <Reveal type="fade" delay={0.3}><div className="bg-white/5 border border-white/5 p-6 md:p-8 rounded-lg text-center group hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-500"><Maximize2 size={24} className="mx-auto mb-4 text-gold-400 group-hover:text-charcoal transition-colors" /><span className="block text-2xl md:text-3xl font-serif font-bold mb-1">{property.sqft}</span><span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-60">Sq Ft</span></div></Reveal>
                                <Reveal type="fade" delay={0.4}><div className="bg-white/5 border border-white/5 p-6 md:p-8 rounded-lg text-center group hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal transition-all duration-500"><Car size={24} className="mx-auto mb-4 text-gold-400 group-hover:text-charcoal transition-colors" /><span className="block text-2xl md:text-3xl font-serif font-bold mb-1">{property.garage}</span><span className="text-[9px] md:text-[10px] uppercase tracking-widest opacity-60">Garage</span></div></Reveal>
                            </div>

                            <div className="mb-16 bg-white/5 border border-white/5 rounded-xl p-8 md:p-10 relative overflow-hidden">
                                <Reveal type="slide-up">
                                    <h3 className="text-2xl font-serif text-white mb-8 relative inline-block">At a Glance<span className="absolute -bottom-3 left-0 w-full h-[1px] bg-gradient-to-r from-gold-400 to-transparent"></span></h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-16">
                                        {property.at_a_glance && property.at_a_glance.length > 0 ? (property.at_a_glance.map((item, idx) => (<div key={idx} className="flex justify-between items-center border-b border-white/10 pb-3 group"><span className="font-bold text-xs uppercase tracking-widest text-white/90">{item.label}</span><span className="text-white/50 text-sm font-light group-hover:text-gold-400 transition-colors text-right pl-4">{item.value}</span></div>))) : (<div className="col-span-2 text-center text-white/40 italic text-sm">No details available.</div>)}
                                    </div>
                                </Reveal>
                            </div>

                            {uniqueFeatures.length > 0 && (<div className="mb-16"><Reveal type="slide-up"><h3 className="text-2xl font-serif text-white mb-8 relative inline-block">Features<span className="absolute -bottom-3 left-0 w-full h-[1px] bg-gradient-to-r from-gold-400 to-transparent"></span></h3><div className="bg-white/5 p-8 md:p-10 rounded-xl border border-white/5"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{uniqueFeatures.map((feat, idx) => (<div key={idx} className="flex items-center gap-4 group"><div className="w-8 h-8 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 group-hover:bg-gold-400 group-hover:text-charcoal transition-all duration-300 flex-shrink-0">{getFeatureIcon(feat)}</div><span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{feat}</span></div>))}</div></div></Reveal></div>)}
                            <div className="mb-16"><Reveal type="slide-up"><h3 className="text-2xl font-serif text-white mb-8 relative inline-block">Facilities<span className="absolute -bottom-3 left-0 w-full h-[1px] bg-gradient-to-r from-gold-400 to-transparent"></span></h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{displayFacilities.map((fac, idx) => (<div key={idx} className="bg-white/5 p-5 rounded border border-white/5 flex gap-4 items-start hover:border-gold-400/30 hover:bg-white/10 transition-all duration-300"><div className="mt-1.5 bg-gold-400 rounded-sm w-1.5 h-1.5 shrink-0 shadow-[0_0_10px_#D4AF37]"></div><p className="text-xs font-light text-white/70 leading-relaxed">{fac}</p></div>))}</div></Reveal></div>

                            {property.floorPlans && property.floorPlans.length > 0 && (
                                <div className="mb-16">
                                    <Reveal type="slide-up">
                                        <h3 className="text-2xl font-serif text-white mb-8 relative inline-block">Floor Plans<span className="absolute -bottom-3 left-0 w-full h-[1px] bg-gradient-to-r from-gold-400 to-transparent"></span></h3>
                                        <div className="border border-white/10 rounded-lg overflow-hidden">
                                            <button onClick={() => setFloorPlanOpen(!floorPlanOpen)} className="w-full bg-white/5 p-5 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"><span className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-gold-400 rounded-full"></span>{currentFloorPlan.title || `Floor Plan ${selectedFloorPlanIndex + 1}`}</span><div className="flex items-center gap-6 text-white/40">{floorPlanOpen ? <ChevronUp size={16} className="text-gold-400" /> : <ChevronDown size={16} />}</div></button>
                                            {floorPlanOpen && (<div className="bg-white border-t border-white/10">{property.floorPlans.length > 1 && (<div className="flex bg-gray-100 overflow-x-auto"><div className="flex w-max">{property.floorPlans.map((plan, idx) => (<button key={idx} onClick={() => setSelectedFloorPlanIndex(idx)} className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${selectedFloorPlanIndex === idx ? 'bg-gold-400 text-charcoal' : 'text-gray-500 hover:bg-gray-200'}`}>{plan.title || `Plan ${idx + 1}`}</button>))}</div></div>)}{(currentFloorPlan.beds || currentFloorPlan.baths || currentFloorPlan.sqft) && (<div className="flex gap-4 md:gap-8 justify-center py-6 border-b border-gray-100 bg-gray-50/50">{currentFloorPlan.sqft && (<div className="flex flex-col items-center"><span className="text-gold-400 font-bold text-lg font-serif">{currentFloorPlan.sqft}</span><span className="text-[10px] text-gray-400 uppercase tracking-widest">Sq Ft</span></div>)}{currentFloorPlan.beds && (<div className="flex flex-col items-center border-l border-gray-200 pl-4 md:pl-8"><span className="text-charcoal font-bold text-lg font-serif">{currentFloorPlan.beds}</span><span className="text-[10px] text-gray-400 uppercase tracking-widest">Beds</span></div>)}{currentFloorPlan.baths && (<div className="flex flex-col items-center border-l border-gray-200 pl-4 md:pl-8"><span className="text-charcoal font-bold text-lg font-serif">{currentFloorPlan.baths}</span><span className="text-[10px] text-gray-400 uppercase tracking-widest">Baths</span></div>)}</div>)}<div className="p-8 flex justify-center relative group/fp"><img src={currentFloorPlan.image} alt={currentFloorPlan.title} className="max-w-full h-auto opacity-90 mix-blend-multiply cursor-zoom-in hover:opacity-100 transition-all duration-300" style={{ filter: 'grayscale(100%) contrast(120%)' }} onClick={openFloorPlanModal} /><div className="absolute bottom-4 right-4 opacity-0 group-hover/fp:opacity-100 transition-opacity duration-300"><button onClick={openFloorPlanModal} className="text-[10px] text-charcoal/50 uppercase font-bold hover:text-charcoal transition-colors flex items-center gap-1 bg-white/50 px-2 py-1 rounded backdrop-blur-sm">Open Full Size <Maximize2 size={12} /></button></div></div></div>)}
                                        </div>
                                    </Reveal>
                                </div>
                            )}

                            {property.videoUrl && (<div className="mb-16"><Reveal type="slide-up"><h3 className="text-2xl font-serif text-white mb-8 relative inline-block">Property Video<span className="absolute -bottom-3 left-0 w-full h-[1px] bg-gradient-to-r from-gold-400 to-transparent"></span></h3><div className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer bg-black border border-white/10 shadow-2xl" onClick={handlePlayVideo}><video ref={videoRef} src={property.videoUrl} className="w-full h-full object-cover" poster={property.image} onPlay={() => setIsVideoPlaying(true)} onPause={() => setIsVideoPlaying(false)} onEnded={() => setIsVideoPlaying(false)} controls={isVideoPlaying}></video>{!isVideoPlaying && (<div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"><div className="w-16 h-16 md:w-20 md:h-20 border border-gold-400 rounded-full flex items-center justify-center text-gold-400 group-hover:bg-gold-400 group-hover:text-charcoal group-hover:scale-110 transition-all duration-500 backdrop-blur-sm"><Play size={24} fill="currentColor" className="ml-1" /></div></div>)}</div></Reveal></div>)}

                            <div className="mb-16"><Reveal type="slide-up"><h3 className="text-2xl font-serif text-white mb-8 relative inline-block">Location<span className="absolute -bottom-3 left-0 w-full h-[1px] bg-gradient-to-r from-gold-400 to-transparent"></span></h3><div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-2xl border border-white/10 relative z-0 filter grayscale hover:grayscale-0 transition-all duration-700"><PropertyMap properties={[property]} /></div></Reveal></div>

                            <div className="mb-16">
                                <Reveal type="slide-up">
                                    <div className="bg-white/5 border border-white/5 rounded-xl p-6 md:p-12 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-transparent to-transparent"></div>
                                        <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-full bg-gold-400/10 text-gold-400"><MessageSquare size={20} /></div><h3 className="text-2xl font-serif text-white">Leave a Reply</h3></div>
                                        <p className="text-xs text-white/40 mb-10 font-light tracking-wide">Your email address will not be published.</p>
                                        <form className="space-y-6 md:space-y-8" onSubmit={handleFormSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                                <div className="relative group">
                                                    <div className="absolute left-0 top-3 text-gold-400"><User size={16} /></div>
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
                                                    <div className="absolute left-0 top-3 text-gold-400"><Mail size={16} /></div>
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
                                                className="w-full md:w-auto px-10 py-4 bg-white text-charcoal text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold-400 transition-colors duration-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmittingComment ? "Posting..." : "Post Comment"}
                                            </button>
                                        </form>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {isGalleryOpen && createPortal(GalleryModal, document.body)}
        {isFloorPlanModalOpen && createPortal(FloorPlanModal, document.body)}
    </>
  );
};