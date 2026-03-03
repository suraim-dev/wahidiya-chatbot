import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Property } from '../types';
import { supabase } from '../services/supabaseClient';
import { Reveal } from './Reveal';
import { PropertyMap } from './PropertyMap';
import { Bed, Bath, Maximize2, MapPin, Search, SlidersHorizontal, ChevronDown, LayoutGrid, List, ArrowRight, Check, Heart, GitCompare } from 'lucide-react';

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1600596542815-27b88e57e62f?q=80&w=2672&auto=format&fit=crop";

const TYPES = ["All Types", "Residential", "Commercial"];
const STATUSES = ["All Status", "Sale", "Rent"];

const generateOptions = (max: number) => ["Any", ...Array.from({ length: max }, (_, i) => (i + 1).toString())];

const BEDS_OPTIONS = generateOptions(10);
const BATHS_OPTIONS = generateOptions(10);
const GARAGES_OPTIONS = generateOptions(10);
const AGENTS_OPTIONS = ["All Agents"];

const FEATURES_LIST = [
    { label: "24/7 Security Camera", count: 8 },
    { label: "BBQ Party Zone On The Roof", count: 7 },
    { label: "Community Hall", count: 3 },
    { label: "Kids Zone", count: 7 },
    { label: "One Year Free Service", count: 8 },
    { label: "Reception", count: 2 },
    { label: "Roof To Garden", count: 6 }
];

type SortOption = 'default' | 'title-asc' | 'title-desc';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
    { label: 'Default Order', value: 'default' },
    { label: 'Property Title A to Z', value: 'title-asc' },
    { label: 'Property Title Z to A', value: 'title-desc' },
];

// --- Custom Select Component to fix mobile overflow and styling ---
interface SelectDropdownProps {
    label: string;
    value: string;
    options: string[] | Record<string, string[]>;
    onChange: (val: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    zIndex?: number;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({ label, value, options, onChange, isOpen, onToggle, onClose, zIndex = 50 }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const isGrouped = !Array.isArray(options);

    return (
        <div className="relative group" ref={ref}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">{label}</label>
            <div className="relative">
                <button 
                    onClick={onToggle}
                    className={`w-full h-12 bg-gray-50 border text-left flex items-center justify-between transition-colors ${isOpen ? 'border-gold-400 bg-white' : 'border-gray-200 hover:bg-gray-100'} text-charcoal font-sans font-medium text-sm rounded-md px-4 focus:outline-none`}
                >
                    <span className="truncate mr-2">{value}</span>
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                    <div 
                        className="absolute top-full left-0 w-full min-w-[200px] mt-2 bg-white border border-gray-100 rounded-md shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar animate-fade-in"
                        style={{ zIndex }}
                    >
                        {isGrouped ? (
                            <>
                                <button 
                                    onClick={() => { onChange("All Locations"); onClose(); }}
                                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 hover:bg-amber-50 hover:text-gold-600 transition-colors ${value === "All Locations" ? 'text-gold-600 font-bold bg-amber-50' : 'text-gray-600'}`}
                                >
                                    All Locations
                                </button>
                                {Object.entries(options as Record<string, string[]>).map(([group, items]) => (
                                    <div key={group}>
                                        <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                                            {group}
                                        </div>
                                        {items.map(item => (
                                            <button
                                                key={item}
                                                onClick={() => { onChange(item); onClose(); }}
                                                className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 hover:bg-amber-50 hover:text-gold-600 transition-colors whitespace-normal break-words leading-relaxed ${value === item ? 'text-gold-600 font-bold bg-amber-50' : 'text-gray-600'}`}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </>
                        ) : (
                            (options as string[]).map(item => (
                                <button
                                    key={item}
                                    onClick={() => { onChange(item); onClose(); }}
                                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 hover:bg-amber-50 hover:text-gold-600 transition-colors ${value === item ? 'text-gold-600 font-bold bg-amber-50' : 'text-gray-600'}`}
                                >
                                    {item}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

interface PropertiesPageProps {
  onNavigate?: (page: string, id?: string) => void;
  initialSearch?: string;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({ onNavigate, initialSearch }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // -- View Mode State --
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // -- Sorting State --
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // -- Basic Filter States --
  const [location, setLocation] = useState('All Locations');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Status');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null); // 'location', 'type', 'status'

  // -- Advanced Filter States --
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [minBeds, setMinBeds] = useState('Any');
  const [minBaths, setMinBaths] = useState('Any');
  const [minGarages, setMinGarages] = useState('Any');
  const [agent, setAgent] = useState('All Agents');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [keyword, setKeyword] = useState(initialSearch || '');
  const [propertyId, setPropertyId] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  // -- Favorites & Compare State --
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
      if (initialSearch !== undefined) {
          setKeyword(initialSearch);
      }
  }, [initialSearch]);

  // Load favorites and compare list
  useEffect(() => {
      const loadLocalState = () => {
          const favs = localStorage.getItem('favorites');
          if (favs) {
              try {
                  const parsed = JSON.parse(favs);
                  setFavorites(parsed.map((p: Property) => p.id));
              } catch (e) {}
          }

          const comp = localStorage.getItem('compareList');
          if (comp) {
              try {
                  const parsed = JSON.parse(comp);
                  setCompareList(parsed.map((p: Property) => p.id));
              } catch (e) {}
          }
      };
      loadLocalState();
      
      const handleStorage = () => loadLocalState();
      window.addEventListener('compare-updated', handleStorage);
      return () => {
          window.removeEventListener('compare-updated', handleStorage);
      }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, prop: Property) => {
      e.stopPropagation();
      const stored = localStorage.getItem('favorites');
      let currentFavs: Property[] = stored ? JSON.parse(stored) : [];
      
      const exists = currentFavs.find(p => p.id === prop.id);
      if (exists) {
          currentFavs = currentFavs.filter(p => p.id !== prop.id);
      } else {
          currentFavs.push(prop);
      }
      
      localStorage.setItem('favorites', JSON.stringify(currentFavs));
      setFavorites(currentFavs.map(p => p.id));
  };

  const toggleCompare = (e: React.MouseEvent, prop: Property) => {
      e.stopPropagation();
      const stored = localStorage.getItem('compareList');
      let currentCompare: Property[] = stored ? JSON.parse(stored) : [];
      
      const exists = currentCompare.find(p => p.id === prop.id);
      if (exists) {
          currentCompare = currentCompare.filter(p => p.id !== prop.id);
      } else {
          if (currentCompare.length >= 3) {
              alert("You can only compare up to 3 properties.");
              return;
          }
          currentCompare.push(prop);
      }
      
      localStorage.setItem('compareList', JSON.stringify(currentCompare));
      setCompareList(currentCompare.map(p => p.id));
      window.dispatchEvent(new Event('compare-updated'));
  };

  // Group locations
  const locationGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    properties.forEach(p => {
        let city = 'Other';
        const locLower = p.location.toLowerCase();
        if (locLower.includes('rajshahi')) city = 'Rajshahi';
        else if (locLower.includes('dhaka')) city = 'Dhaka';
        else if (locLower.includes('chattogram') || locLower.includes('chittagong')) city = 'Chattogram';
        else if (locLower.includes('sylhet')) city = 'Sylhet';
        
        if (!groups[city]) groups[city] = [];
        if (!groups[city].includes(p.location)) groups[city].push(p.location);
    });
    return Object.keys(groups).sort().reduce((acc, key) => {
        acc[key] = groups[key].sort();
        return acc;
    }, {} as Record<string, string[]>);
  }, [properties]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (error) {
          console.error('Supabase Error:', error);
        } else if (data && data.length > 0) {
          const formattedProperties: Property[] = data.map((item: any) => {
             const rawImage = item.image || item.image_url || item.imageUrl || item.img || item.photo;
             let lat = 0, lng = 0;
             if (item.coordinates) {
                 const coords = typeof item.coordinates === 'string' ? JSON.parse(item.coordinates) : item.coordinates;
                 // Prioritize lat/lng keys
                 if (coords.lat !== undefined) lat = parseFloat(coords.lat);
                 if (coords.lng !== undefined) lng = parseFloat(coords.lng);
             }
             // Fallbacks if columns existed previously but are now gone/empty
             if (lat === 0 && item.latitude) lat = parseFloat(item.latitude);
             if (lng === 0 && item.longitude) lng = parseFloat(item.longitude);

             return {
              id: item.id?.toString() || Math.random().toString(),
              title: item.title || 'Untitled Property',
              location: item.location || 'Location Pending',
              price: item.price || 'Price on Request',
              image: rawImage || PLACEHOLDER_IMAGE, 
              beds: item.beds || 0,
              baths: item.baths || 0,
              sqft: item.sqft || 0,
              tag: item.tag || 'Sale',
              type: item.type || '', 
              latitude: lat !== 0 ? lat : undefined,
              longitude: lng !== 0 ? lng : undefined,
              garage: Number(item.garage || item.garages || item.parking || 0), 
              features: item.features || [],
              facilities: item.facilities || []
            };
          });
          setProperties(formattedProperties);
          setFilteredProperties(formattedProperties);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Close sorting dropdown when clicking outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
              setIsSortDropdownOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    let result = [...properties]; // Clone array to avoid mutating source

    // Filters
    if (location !== 'All Locations') result = result.filter(p => p.location === location);
    if (type !== 'All Types') result = result.filter(p => (p.type || p.title).toLowerCase().includes(type.toLowerCase()));
    if (status !== 'All Status') result = result.filter(p => p.tag === status);
    if (minBeds !== 'Any') { const val = parseInt(minBeds); if (!isNaN(val)) result = result.filter(p => p.beds >= val); }
    if (minBaths !== 'Any') { const val = parseInt(minBaths); if (!isNaN(val)) result = result.filter(p => p.baths >= val); }
    if (minGarages !== 'Any') { const val = parseInt(minGarages); if (!isNaN(val)) result = result.filter(p => (p.garage || 0) >= val); } // Use garage
    if (minArea) { const val = parseFloat(minArea); if (!isNaN(val)) result = result.filter(p => p.sqft >= val); }
    if (maxArea) { const val = parseFloat(maxArea); if (!isNaN(val)) result = result.filter(p => p.sqft <= val); }
    if (keyword) { const lowerKey = keyword.toLowerCase(); result = result.filter(p => p.title.toLowerCase().includes(lowerKey) || p.location.toLowerCase().includes(lowerKey)); }
    if (propertyId) result = result.filter(p => p.id.includes(propertyId));

    // Sorting
    if (sortOption === 'title-asc') {
        result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'title-desc') {
        result.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredProperties(result);
  };

  useEffect(() => { handleSearch(); }, [location, type, status, minBeds, minBaths, minGarages, minArea, maxArea, keyword, propertyId, selectedFeatures, properties, sortOption]);

  const toggleFeature = (feat: string) => {
      const newSet = new Set(selectedFeatures);
      if (newSet.has(feat)) newSet.delete(feat); else newSet.add(feat);
      setSelectedFeatures(newSet);
  };

  const handlePropertyClick = (id: string) => {
      if (onNavigate) {
          onNavigate('property-details', id);
      }
  };

  return (
    <div className="bg-charcoal min-h-screen pb-20">
      
      {/* Background Decor */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* --- REALTIME MAP SECTION AT TOP --- */}
      <div className="relative w-full h-[300px] md:h-[450px] z-0 shadow-2xl">
            <PropertyMap properties={filteredProperties} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-20 -mt-16 md:-mt-20">
        
        {/* --- MAIN FILTER CONTAINER --- */}
        <Reveal type="fade" delay={0.2}>
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-2xl mb-12 relative z-20 transition-all duration-500 ease-in-out">
                
                {/* Top Row: Basic Filters + Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                    
                    {/* Location Dropdown */}
                    <div className="lg:col-span-3">
                        <SelectDropdown 
                            label="Location"
                            value={location}
                            options={locationGroups}
                            onChange={setLocation}
                            isOpen={activeDropdown === 'location'}
                            onToggle={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
                            onClose={() => setActiveDropdown(null)}
                            zIndex={60}
                        />
                    </div>

                    {/* Property Type Dropdown */}
                    <div className="lg:col-span-3">
                        <SelectDropdown 
                            label="Property Type"
                            value={type}
                            options={TYPES}
                            onChange={setType}
                            isOpen={activeDropdown === 'type'}
                            onToggle={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                            onClose={() => setActiveDropdown(null)}
                            zIndex={55}
                        />
                    </div>

                    {/* Property Status Dropdown */}
                    <div className="lg:col-span-3">
                        <SelectDropdown 
                            label="Property Status"
                            value={status}
                            options={STATUSES}
                            onChange={setStatus}
                            isOpen={activeDropdown === 'status'}
                            onToggle={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                            onClose={() => setActiveDropdown(null)}
                            zIndex={50}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-3 flex flex-col justify-end">
                        <label className="text-[10px] font-bold text-transparent uppercase tracking-widest mb-1 block px-1 select-none hidden md:block">Action</label>
                        <div className="flex gap-2 h-12">
                            <button 
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className={`flex-1 h-full flex items-center justify-center gap-2 border text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-300 ${isAdvancedOpen ? 'bg-gold-400 text-charcoal border-gold-400 shadow-md scale-[1.02]' : 'bg-gray-50 border-gray-200 text-charcoal hover:bg-gray-100'}`}
                            >
                                <SlidersHorizontal size={14} className={`transform transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                                <span className="hidden sm:inline">Advanced</span>
                            </button>

                            <button 
                                onClick={handleSearch}
                                className="flex-1 h-full flex items-center justify-center gap-2 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-md hover:bg-gold-400 hover:text-charcoal transition-all duration-300 shadow-lg active:scale-95"
                            >
                                <Search size={14} />
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- ADVANCED SECTION (Collapsible) --- */}
                {/* Fixed max-height to 2000px to accommodate all content on mobile */}
                <div 
                    className={`grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-6 overflow-hidden transition-all duration-500 ease-in-out ${isAdvancedOpen ? 'max-h-[2000px] opacity-100 mt-8 pt-8 border-t border-gray-100' : 'max-h-0 opacity-0 mt-0 pt-0'}`}
                >
                    {/* Input Filters - Ensuring all are h-12 */}
                    {[
                        { label: 'Min Beds', value: minBeds, setter: setMinBeds, options: BEDS_OPTIONS },
                        { label: 'Min Baths', value: minBaths, setter: setMinBaths, options: BATHS_OPTIONS },
                        { label: 'Min Garages', value: minGarages, setter: setMinGarages, options: GARAGES_OPTIONS }
                    ].map((filter, i) => (
                        <div key={i} className="relative">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">{filter.label}</label>
                             <div className="relative">
                                <select value={filter.value} onChange={(e) => filter.setter(e.target.value)} className="w-full h-12 bg-white border border-gray-200 text-charcoal text-sm rounded-md px-4 appearance-none focus:outline-none focus:border-gold-400 cursor-pointer">
                                    {filter.options.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>
                        </div>
                    ))}

                    <div className="relative group/agent">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Agent</label>
                         <div className="relative">
                            <select value={agent} onChange={(e) => setAgent(e.target.value)} className="w-full h-12 bg-white border border-gray-200 text-charcoal text-sm rounded-md px-4 appearance-none focus:outline-none focus:border-gold-400 cursor-pointer">
                                {AGENTS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                         </div>
                    </div>

                    <div className="relative">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Min Area (Sq Ft)</label>
                         <input type="number" placeholder="Any" value={minArea} onChange={(e) => setMinArea(e.target.value)} className="w-full h-12 bg-white border border-gray-200 text-charcoal text-sm rounded-md px-4 focus:outline-none focus:border-gold-400 placeholder:text-gray-400"/>
                    </div>
                    <div className="relative">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Max Area (Sq Ft)</label>
                         <input type="number" placeholder="Any" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} className="w-full h-12 bg-white border border-gray-200 text-charcoal text-sm rounded-md px-4 focus:outline-none focus:border-gold-400 placeholder:text-gray-400"/>
                    </div>
                    <div className="relative">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Keyword</label>
                         <input type="text" placeholder="Any" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full h-12 bg-white border border-gray-200 text-charcoal text-sm rounded-md px-4 focus:outline-none focus:border-gold-400 placeholder:text-gray-400"/>
                    </div>
                    <div className="relative">
                         <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block px-1">Property ID</label>
                         <input type="text" placeholder="Any" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full h-12 bg-white border border-gray-200 text-charcoal text-sm rounded-md px-4 focus:outline-none focus:border-gold-400 placeholder:text-gray-400"/>
                    </div>

                    {/* Features */}
                    <div className="md:col-span-4 mt-4 pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {FEATURES_LIST.map((feat) => (
                                <label key={feat.label} className="flex items-center gap-3 cursor-pointer group/check">
                                    <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all duration-200 ${selectedFeatures.has(feat.label) ? 'bg-gold-400 border-gold-400' : 'border-gray-300 group-hover/check:border-gold-400'}`}>
                                        {selectedFeatures.has(feat.label) && <Check size={12} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={selectedFeatures.has(feat.label)} onChange={() => toggleFeature(feat.label)} />
                                    <span className="text-sm text-gray-500 group-hover/check:text-charcoal transition-colors select-none">
                                        {feat.label} <span className="text-gray-300 text-xs">({feat.count})</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Reveal>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Results Bar */}
        <div className="relative z-30 flex flex-col md:flex-row justify-between items-center mb-8 border-b border-white/10 pb-4">
            <Reveal type="fade">
                <p className="text-white/60 text-sm font-sans mb-4 md:mb-0">
                    Showing <span className="text-gold-400 font-bold">{filteredProperties.length}</span> properties of <span className="text-white font-bold">{properties.length}</span>
                </p>
            </Reveal>

            <Reveal type="fade" delay={0.1}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40 uppercase tracking-widest">Sort By:</span>
                        
                        {/* Custom Sorting Dropdown */}
                        <div className="relative group" ref={sortDropdownRef}>
                            <button 
                                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                                className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest hover:text-gold-400 transition-colors"
                            >
                                {SORT_OPTIONS.find(o => o.value === sortOption)?.label} <ChevronDown size={12} className={`transform transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded shadow-xl overflow-hidden transition-all duration-300 z-50 origin-top-right ${isSortDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortOption(option.value);
                                            setIsSortDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                                            sortOption === option.value 
                                            ? 'bg-amber-50 text-charcoal' 
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-charcoal'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* View Toggle Section */}
                    <div className="flex gap-2 border-l border-white/10 pl-4 ml-2">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-1 transition-colors ${viewMode === 'grid' ? 'text-gold-400' : 'text-white/30 hover:text-white'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-1 transition-colors ${viewMode === 'list' ? 'text-gold-400' : 'text-white/30 hover:text-white'}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </Reveal>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
                 <div className="w-12 h-12 border border-gold-400 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-xs uppercase tracking-[0.2em] text-white/50">Loading Properties...</p>
             </div>
        )}

        {/* Properties View (Grid or List) */}
        <div 
          key={viewMode}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-20"
            : "flex flex-col gap-8"
        }>
          {!isLoading && filteredProperties.map((prop, idx) => (
            <Reveal key={prop.id} type="fade" delay={idx * 0.1}>
              <div 
                className={`group cursor-pointer relative ${viewMode === 'grid' ? 'flex flex-col h-full' : 'flex flex-col md:flex-row gap-6 bg-charcoal-light/30 border border-white/5 p-4 rounded-xl hover:border-gold-400/30 transition-all duration-300'}`}
                onClick={() => handlePropertyClick(prop.id)}
              >
                
                {/* Image Container */}
                <div className={`relative overflow-hidden bg-charcoal-light ${viewMode === 'grid' ? 'aspect-[3/4] mb-6 w-full' : 'w-full md:w-1/3 aspect-[4/3] md:aspect-auto'}`}>
                   <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                   
                   <div className="absolute top-4 left-4 z-20">
                      <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest ${
                          prop.tag === 'Sold' ? 'bg-white text-charcoal' : 'bg-gold-400 text-charcoal'
                      }`}>
                         {prop.tag}
                      </span>
                   </div>
                   
                   <img 
                    src={prop.image} 
                    alt={prop.title}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = PLACEHOLDER_IMAGE;
                    }}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-luxury group-hover:scale-110"
                   />
                   
                   {viewMode === 'grid' && (
                       <>
                           {/* Overlay Actions (Compare & Save) */}
                           <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button 
                                    className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${compareList.includes(prop.id) ? 'bg-gold-400 text-charcoal border-gold-400' : 'bg-black/50 border-white/20 text-white hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal'}`}
                                    title="Compare"
                                    onClick={(e) => toggleCompare(e, prop)}
                                >
                                    <GitCompare size={16} />
                                </button>
                                <button 
                                    className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${favorites.includes(prop.id) ? 'bg-gold-400 text-charcoal border-gold-400' : 'bg-black/50 border-white/20 text-white hover:bg-gold-400 hover:border-gold-400 hover:text-charcoal'}`}
                                    title="Save"
                                    onClick={(e) => toggleFavorite(e, prop)}
                                >
                                    <Heart size={16} fill={favorites.includes(prop.id) ? "currentColor" : "none"} />
                                </button>
                           </div>
                           
                           {/* Gradient Overlay */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                       </>
                   )}
                </div>

                {/* Content */}
                <div className={`flex flex-col flex-grow relative ${viewMode === 'grid' ? '' : 'justify-center py-2'}`}>
                    <div className="flex justify-between items-baseline mb-2">
                         <h3 className={`${viewMode === 'grid' ? 'text-2xl' : 'text-2xl md:text-3xl'} font-serif text-white group-hover:text-gold-400 transition-colors duration-300 line-clamp-1`}>
                           {prop.title}
                         </h3>
                    </div>
                   
                   <div className="flex items-center gap-2 text-white/50 text-xs font-sans tracking-wide mb-6 uppercase">
                       <MapPin size={12} className="text-gold-600" />
                       <span className="truncate">{prop.location}</span>
                   </div>

                   {/* Specs Grid */}
                   <div className={`grid grid-cols-3 gap-2 md:gap-4 py-4 border-t border-white/10 border-b mb-6 group-hover:border-gold-400/30 transition-colors ${viewMode === 'grid' ? '' : 'max-w-md'}`}>
                        <div className="flex flex-col gap-1">
                           <span className="text-[10px] text-white/40 uppercase tracking-widest">Bedrooms</span>
                           <div className="flex items-center gap-2 text-white">
                               <Bed size={14} className="text-gold-400"/> 
                               <span className="font-serif">{prop.beds}</span>
                           </div>
                        </div>
                        <div className="flex flex-col gap-1 border-l border-white/10 pl-2 md:pl-4 group-hover:border-gold-400/30 transition-colors">
                           <span className="text-[10px] text-white/40 uppercase tracking-widest">Bathrooms</span>
                           <div className="flex items-center gap-2 text-white">
                               <Bath size={14} className="text-gold-400"/> 
                               <span className="font-serif">{prop.baths}</span>
                           </div>
                        </div>
                        <div className="flex flex-col gap-1 border-l border-white/10 pl-2 md:pl-4 group-hover:border-gold-400/30 transition-colors">
                           <span className="text-[10px] text-white/40 uppercase tracking-widest">Area</span>
                           <div className="flex items-center gap-2 text-white">
                               <Maximize2 size={14} className="text-gold-400"/> 
                               <span className="font-serif">{prop.sqft}</span>
                           </div>
                        </div>
                   </div>

                   <div className={`flex ${viewMode === 'grid' ? 'justify-end' : 'justify-start'} items-center mt-auto`}>
                        {viewMode === 'grid' ? (
                            <span className="text-xs font-bold uppercase tracking-widest text-gold-400 group-hover:underline underline-offset-4 decoration-gold-400">View Details</span>
                        ) : (
                            <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal bg-gold-400 px-6 py-3 hover:bg-white transition-colors">
                                View Details <ArrowRight size={14} />
                            </button>
                        )}
                   </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        
        {!isLoading && filteredProperties.length === 0 && (
           <div className="text-center py-40 border border-dashed border-white/10 rounded-lg">
               <p className="text-2xl font-serif text-white/50 mb-2">No properties match your filter</p>
               <button 
                onClick={() => {
                    setLocation('All Locations'); 
                    setStatus('All Status');
                    setType('All Types');
                    setMinBeds('Any');
                    setMinBaths('Any');
                    setMinGarages('Any');
                    setMinArea('');
                    setMaxArea('');
                    setKeyword('');
                    setPropertyId('');
                }}
                className="text-sm font-sans text-gold-400 uppercase tracking-widest hover:underline"
               >
                   Clear Filters
               </button>
           </div>
        )}

      </div>
    </div>
  );
};