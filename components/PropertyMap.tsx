import React, { useEffect, useRef, useState } from 'react';
import { Property } from '../types';
import { X, MapPin } from 'lucide-react';

declare global {
  interface Window {
    L: any;
  }
}

interface PropertyMapProps {
  properties: Property[];
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const activePropertyRef = useRef<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  // Sync active property state with ref for map events if needed
  useEffect(() => {
    activePropertyRef.current = activeProperty?.id || null;
  }, [activeProperty]);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      const map = window.L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([23.8103, 90.4125], 13); // Default to Dhaka

      // Standard OpenStreetMap Tiles with a modified filter for a lighter look
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20,
        className: 'map-tiles-custom' 
      }).addTo(map);

      window.L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Fix map size issues (grey tiles)
    setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Custom Icon Creator
    const createCustomIcon = (isActive: boolean) => {
      const color = '#D4AF37'; // Golden for all states
      const scale = isActive ? 1.3 : 1;
      const zIndex = isActive ? 1000 : 1;
      const strokeColor = isActive ? 'white' : '#2A2A2A';
      
      return window.L.divIcon({
        className: 'custom-pin',
        html: `
          <div style="transform: translate(-50%, -100%) scale(${scale}); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; align-items: center; z-index: ${zIndex};">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="${strokeColor}" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));">
              <path d="M12 0C7.58 0 4 3.58 4 8C4 13.5 12 24 12 24C12 24 20 13.5 20 8C20 3.58 16.42 0 12 0ZM12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11Z"/>
            </svg>
            ${isActive ? '<div style="width: 8px; height: 8px; background: #D4AF37; border-radius: 50%; margin-top: 4px; box-shadow: 0 0 10px #D4AF37;"></div>' : ''}
          </div>
        `,
        iconSize: [0, 0],
      });
    };

    const latLngs: any[] = [];

    // Add Markers
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const latLng = [property.latitude, property.longitude];
        latLngs.push(latLng);

        const marker = window.L.marker(latLng, {
          icon: createCustomIcon(activeProperty?.id === property.id)
        }).addTo(map);

        marker.on('click', () => {
            setActiveProperty(property);
            map.setView(latLng, 16, { animate: true, duration: 1.5 });
        });

        markersRef.current.push(marker);
      }
    });

    if (latLngs.length > 0 && !activeProperty) {
        const bounds = window.L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
    }

  }, [properties, activeProperty]);

  return (
    <div className="relative w-full h-full group">
      <style>{`
        .map-tiles-custom {
          filter: grayscale(100%) invert(100%) brightness(180%) contrast(85%);
        }
      `}</style>
      
      {/* Map Container */}
      <div ref={mapRef} className="h-full w-full bg-[#1F1F1F] outline-none z-0"></div>

      {/* Map Popup */}
      {activeProperty && (
        <div className="absolute bottom-6 left-6 z-[400] max-w-[300px] w-full animate-fade-in-up">
           <div className="bg-charcoal/95 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl relative flex gap-3 cursor-pointer hover:border-gold-400/50 transition-colors group/card">
              <button 
                 onClick={(e) => { e.stopPropagation(); setActiveProperty(null); }}
                 className="absolute -top-2 -right-2 bg-gold-400 border border-charcoal text-charcoal rounded-full p-1 shadow-lg hover:bg-white hover:text-charcoal transition-all z-50"
              >
                  <X size={12} />
              </button>
              
              <div className="w-20 h-20 shrink-0 bg-gray-800 rounded-lg overflow-hidden relative">
                  <img src={activeProperty.image} alt={activeProperty.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover/card:bg-transparent transition-colors"></div>
              </div>
              
              <div className="flex flex-col justify-center min-w-0 pr-2">
                  <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest mb-1">{activeProperty.tag}</span>
                  <h3 className="text-white font-serif text-sm leading-tight truncate mb-1 group-hover/card:text-gold-400 transition-colors">{activeProperty.title}</h3>
                  <div className="flex items-center gap-1 text-white/50 text-[10px] uppercase tracking-wider truncate">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{activeProperty.location}</span>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};