
export interface Property {
  id: string;
  title: string;
  location: string;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
  price?: string;
  tag: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  garage?: number; // Renamed from garages
  features?: string[];
  description?: string;
  images?: string[];
  videoUrl?: string;
  floorPlanUrl?: string;
  
  // Extended fields
  featured?: boolean;
  ready_flat?: boolean;
  at_a_glance?: { label: string; value: string }[];
  facilities?: string[];
  floorPlans?: { 
    title: string; 
    image: string; 
    beds?: number; 
    baths?: number; 
    sqft?: string | number;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface NavItem {
  label: string;
  href: string;
}