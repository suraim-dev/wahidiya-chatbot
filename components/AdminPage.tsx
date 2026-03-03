import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
    LayoutDashboard, Home, Newspaper, LogOut, Plus, Edit2, 
    Trash2, Save, X, ChevronRight, Eye, ShieldAlert, CheckCircle, 
    Image as ImageIcon, MapPin, Tag, Briefcase, Upload, CloudUpload,
    MessageSquare, Mail, Film, Grid, Layers, List, Globe, Bold, Type,
    User, Lock
} from 'lucide-react';
import { Property } from '../types';

interface AdminNewsItem {
    id: string;
    title: string;
    category: string;
    date: string;
    image_url: string;
    gallery_urls?: string[];
    excerpt: string;
    content: string;
}

interface AdminComment {
    id: number | string;
    author_name: string;
    email: string;
    content: string;
    created_at: string;
    properties?: { title: string } | null;
    news?: { title: string } | null;
}

interface AdminPageProps {
    onNavigate?: (page: string, id?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
    // Auth State
    const [session, setSession] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [activeTab, setActiveTab] = useState<'properties' | 'news' | 'comments'>('properties');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Data lists
    const [properties, setProperties] = useState<Property[]>([]);
    const [news, setNews] = useState<AdminNewsItem[]>([]);
    const [comments, setComments] = useState<AdminComment[]>([]);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editType, setEditType] = useState<'property' | 'news'>('property');
    const [currentEditId, setCurrentEditId] = useState<string | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);

    // Image Upload State (Main Image)
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Video Upload State
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Dynamic Refs for secondary uploads
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const floorPlanInputRef = useRef<HTMLInputElement>(null);
    const contentTextareaRef = useRef<HTMLTextAreaElement>(null); // Ref for News Content
    const [activeFloorPlanIndex, setActiveFloorPlanIndex] = useState<number | null>(null);
    
    // Pending uploads for new News items
    const [newsGalleryFiles, setNewsGalleryFiles] = useState<File[]>([]);

    // Forms
    // Extended Property Form State
    const [propertyForm, setPropertyForm] = useState<Partial<Property> & { facilitiesInput: string, featuresInput: string }>({
        title: '', location: '', image: '', beds: 0, baths: 0, sqft: 0, garage: 0,
        tag: 'Sale', type: 'Residential', featured: false, ready_flat: false,
        videoUrl: '',
        latitude: 0, longitude: 0,
        images: [], // Gallery
        floorPlans: [], 
        at_a_glance: [],
        facilitiesInput: '', // Helper for comma-separated string
        featuresInput: '' // Helper for comma-separated string
    });

    const [newsForm, setNewsForm] = useState<Partial<AdminNewsItem>>({
        title: '', 
        category: 'Design', 
        date: new Date().toISOString().split('T')[0], 
        image_url: '', 
        gallery_urls: [], 
        excerpt: '', 
        content: ''
    });

    // Check for existing session on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchData();
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchData();
        });

        return () => subscription.unsubscribe();
    }, []);

    // Fetch data when session or tab changes
    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session, activeTab]);

    const fetchData = async (keepMessage = false) => {
        setIsLoading(true);
        if (!keepMessage) setStatusMsg(null);
        try {
            if (activeTab === 'properties') {
                const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                if (data) {
                    setProperties(data.map((item: any) => {
                        // Extract coordinates from JSONB column
                        let lat = 0;
                        let lng = 0;
                        if (item.coordinates) {
                            const c = typeof item.coordinates === 'string' ? JSON.parse(item.coordinates) : item.coordinates;
                            lat = Number(c.lat || c.latitude || 0);
                            lng = Number(c.lng || c.longitude || 0);
                        }

                        // Convert arrays back to quoted strings for editing
                        const facilitiesStr = Array.isArray(item.facilities) 
                            ? item.facilities.map((f: string) => `"${f}"`).join(', ')
                            : (typeof item.facilities === 'string' ? item.facilities : '');

                        const featuresStr = Array.isArray(item.features)
                            ? item.features.map((f: string) => `"${f}"`).join(', ')
                            : (typeof item.features === 'string' ? item.features : '');

                        return {
                            ...item,
                            image: item.imageUrl || item.image || item.image_url,
                            // Ensure arrays are initialized
                            images: item.galleryImages || item.images || [],
                            floorPlans: item.floorPlans || [],
                            at_a_glance: item.at_a_glance || [],
                            facilities: item.facilities || [],
                            features: item.features || [],
                            garage: item.garage || item.garages || 0,
                            latitude: lat,
                            longitude: lng,
                            // Store raw inputs for the form state
                            facilitiesInput: facilitiesStr,
                            featuresInput: featuresStr
                        };
                    }));
                }
            } else if (activeTab === 'news') {
                const { data, error } = await supabase.from('news').select('*').order('date', { ascending: false });
                if (error) throw error;
                if (data) {
                    setNews(data.map((item: any) => {
                        let gallery = [];
                        if (item.gallery_urls) {
                            if (Array.isArray(item.gallery_urls)) gallery = item.gallery_urls;
                            else if (typeof item.gallery_urls === 'string') {
                                try { gallery = JSON.parse(item.gallery_urls); } catch(e) { gallery = [item.gallery_urls]; }
                            }
                        }
                        return { ...item, gallery_urls: gallery };
                    }));
                }
            } else if (activeTab === 'comments') {
                const { data, error } = await supabase
                    .from('comments')
                    .select(`
                        *,
                        properties (title),
                        news (title)
                    `)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                if (data) setComments(data);
            }
        } catch (err: any) {
            console.error("Fetch error:", err);
            setStatusMsg({ type: 'error', text: 'Sync Error: ' + (err.message || 'Check connection/RLS policies') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            
            setStatusMsg({ type: 'success', text: 'Access Granted.' });
            // Session state will update automatically via onAuthStateChange
        } catch (error: any) {
            console.error("Login error:", error);
            setStatusMsg({ type: 'error', text: error.message || 'Invalid Credentials.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error logging out:', error);
        setSession(null);
        setEmail('');
        setPassword('');
    };

    // --- HELPER FUNCTIONS ---

    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const sanitizeFolderName = (title: string): string => {
        if (!title) return 'unsorted';
        // Lowercase, replace non-alphanumeric with hyphens
        return title.trim().toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    // Generic upload function for both images and videos
    const uploadFile = async (file: File, folderContext: string = 'general', bucketName: string = 'properties'): Promise<string> => {
        const folder = sanitizeFolderName(folderContext);
        
        const fileExt = file.name.split('.').pop() || 'file';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                // Only attempt fallback if we were originally trying the 'properties' bucket
                if (bucketName === 'properties' && (
                    uploadError.message.includes('Bucket not found') || 
                    uploadError.message.includes('Failed to fetch') ||
                    uploadError.message.includes('The resource was not found')
                )) {
                    console.warn(`Bucket '${bucketName}' issue (${uploadError.message}). Attempting fallback.`);
                    const { error: fallbackError } = await supabase.storage
                        .from('Picture_of_header')
                        .upload(filePath, file);
                    
                    if (fallbackError) throw new Error(`Fallback upload failed: ${fallbackError.message}`);
                    
                    const { data } = supabase.storage.from('Picture_of_header').getPublicUrl(filePath);
                    return data.publicUrl;
                }
                throw uploadError;
            }

            const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            return data.publicUrl;
        } catch (err: any) {
            throw new Error(`Upload failed: ${err.message}`);
        }
    };

    const parseQuotedArray = (input: string): string[] => {
        if (!input) return [];
        // Match anything between quotes, handling potential whitespace around delimiters
        const matches = input.match(/"([^"]+)"/g);
        if (matches && matches.length > 0) {
            return matches.map(m => m.replace(/^"|"$/g, '').trim());
        }
        // Fallback to comma separation if no quotes found (legacy support)
        return input.split(',').map(s => s.trim()).filter(s => s.length > 0);
    };

    // --- CRUD ACTIONS ---

    const handleDelete = async (
        id: string | number,
        table: 'properties' | 'news' | 'comments'
    ) => {
        // 🔥 Remove confirm() (blocked in sandbox)
        // If you want confirmation later, build a custom modal

        setIsLoading(true);

        try {
            console.log(`Deleting ${table} ID:`, id);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("You must be logged in to perform this action.");

            // --- DIRECT DELETION LOGIC ---

            if (table === 'properties') {
                // 1. Delete Storage Files (Folder = Property ID)
                const folderPath = String(id);
                const { data: list, error: listError } = await supabase.storage
                    .from('properties')
                    .list(folderPath);

                if (!listError && list && list.length > 0) {
                    const filesToRemove = list.map((x) => `${folderPath}/${x.name}`);
                    const { error: removeError } = await supabase.storage
                        .from('properties')
                        .remove(filesToRemove);
                    
                    if (removeError) console.warn("Storage deletion warning:", removeError);
                }

                // 2. Delete Database Record
                const { error } = await supabase.from('properties').delete().eq('id', id);
                if (error) throw error;

            } else if (table === 'news') {
                // 1. Delete Storage Files (Folder = News ID)
                const folderPath = String(id);
                const { data: list, error: listError } = await supabase.storage
                    .from('NEWS')
                    .list(folderPath);

                if (!listError && list && list.length > 0) {
                    const filesToRemove = list.map((x) => `${folderPath}/${x.name}`);
                    const { error: removeError } = await supabase.storage
                        .from('NEWS')
                        .remove(filesToRemove);
                    
                    if (removeError) console.warn("Storage deletion warning:", removeError);
                }
                
                // 2. Delete related comments first
                await supabase.from('comments').delete().eq('news_id', id);
                
                // 3. Delete the news record
                const { error } = await supabase.from('news').delete().eq('id', id);
                if (error) throw error;

            } else if (table === 'comments') {
                const { error } = await supabase.from('comments').delete().eq('id', id);
                if (error) throw error;
            }

            await fetchData(true);
            setStatusMsg({ type: 'success', text: 'Item successfully deleted.' });

        } catch (err: any) {
            console.error("Delete error:", err);
            setStatusMsg({
                type: 'error',
                text: 'Delete Failed: ' + (err.message || 'Check permissions')
            });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatusMsg(null), 4000);
        }
    };

    const handleEditStart = (item: any, type: 'property' | 'news') => {
        setIsEditing(true);
        setEditType(type);
        setCurrentEditId(item.id);
        setDraftId(null);
        setImageFile(null); // Reset main file input
        setVideoFile(null); // Reset video input

        if (type === 'property') {
            // Fix: Normalize at_a_glance to array if it is an object
            let normalizedGlance: { label: string; value: string }[] = [];
            if (Array.isArray(item.at_a_glance)) {
                normalizedGlance = item.at_a_glance;
            } else if (item.at_a_glance && typeof item.at_a_glance === 'object') {
                normalizedGlance = Object.entries(item.at_a_glance).map(([key, value]) => ({
                    label: key,
                    value: String(value)
                }));
            }

            // Safe access for facilities/features - Convert to Quoted String
            const facilitiesStr = Array.isArray(item.facilities) 
                ? item.facilities.map((f: string) => `"${f}"`).join(', ')
                : (typeof item.facilities === 'string' ? item.facilities : '');

            const featuresStr = Array.isArray(item.features)
                ? item.features.map((f: string) => `"${f}"`).join(', ')
                : (typeof item.features === 'string' ? item.features : '');

            setPropertyForm({
                title: item.title || '',
                location: item.location || '',
                image: item.image || '', 
                beds: item.beds || 0,
                baths: item.baths || 0,
                sqft: item.sqft || 0,
                garage: item.garage || item.garages || 0,
                tag: item.tag || 'Sale',
                type: item.type || 'Residential',
                featured: item.featured || false,
                ready_flat: item.ready_flat || false,
                videoUrl: item.videoUrl || '',
                latitude: item.latitude || 0,
                longitude: item.longitude || 0,
                images: item.images || [],
                floorPlans: item.floorPlans || [],
                at_a_glance: normalizedGlance,
                facilitiesInput: facilitiesStr,
                featuresInput: featuresStr
            });
            setPreviewUrl(item.image);
        } else {
            // For News, completely strip tags but preserve structure for plain text editing
            const plainContent = item.content 
                ? item.content
                    .replace(/<br\s*\/?>/gi, '\n') // Replace <br> with newline
                    .replace(/<\/p>/gi, '\n\n')   // Replace </p> with double newline
                    .replace(/<[^>]+>/g, '')      // Remove ALL other tags
                    .replace(/&nbsp;/g, ' ') 
                    .trim()
                : '';
            
            setNewsForm({
                ...item,
                gallery_urls: item.gallery_urls || [],
                content: plainContent
            });
            setPreviewUrl(item.image_url);
        }
    };

    const handleAddStart = (type: 'property' | 'news') => {
        setIsEditing(true);
        setEditType(type);
        setCurrentEditId(null);
        setImageFile(null); // Reset file input
        setVideoFile(null); // Reset video input
        setPreviewUrl(null);

        if (type === 'property') {
            setDraftId(generateUUID());
            setPropertyForm({ 
                title: '', location: '', image: '', beds: 0, baths: 0, sqft: 0, garage: 0,
                tag: 'Sale', type: 'Residential', featured: false, ready_flat: false,
                videoUrl: '', latitude: 0, longitude: 0,
                images: [], floorPlans: [], at_a_glance: [], facilitiesInput: '', featuresInput: ''
            });
        } else {
            setDraftId(null);
            setNewsGalleryFiles([]); // Reset pending files
            setNewsForm({ 
                title: '', 
                category: 'Design', 
                date: new Date().toISOString().split('T')[0], 
                image_url: '', 
                gallery_urls: [], 
                excerpt: '', 
                content: ''
            });
        }
    };

    // --- FORM HANDLERS FOR NESTED DATA ---

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Special handling for NEW News items (wait for ID)
            if (editType === 'news' && !currentEditId) {
                const files = Array.from(e.target.files);
                setNewsGalleryFiles(prev => [...prev, ...files]);
                
                // Create preview URLs
                const previewUrls = files.map(f => URL.createObjectURL(f));
                setNewsForm(prev => ({ ...prev, gallery_urls: [...(prev.gallery_urls || []), ...previewUrls] }));
                return;
            }

            // Use ID for properties, Title for news (if editing existing news without ID? Should be ID)
            const folderContext = editType === 'property' 
                ? (currentEditId || draftId || 'unsorted') 
                : (currentEditId ? String(currentEditId) : newsForm.title);
            
            const targetBucket = editType === 'news' ? 'NEWS' : 'properties';
            
            if (editType === 'news' && !folderContext) {
                alert("Please enter a Title first so we can organize your images into the correct folder.");
                if (galleryInputRef.current) galleryInputRef.current.value = '';
                return;
            }

            setIsLoading(true);
            try {
                const newUrls = [];
                for (let i = 0; i < e.target.files.length; i++) {
                    const url = await uploadFile(e.target.files[i], folderContext!, targetBucket);
                    newUrls.push(url);
                }

                if (editType === 'property') {
                    setPropertyForm(prev => ({ ...prev, images: [...(prev.images || []), ...newUrls] }));
                } else {
                    setNewsForm(prev => ({ ...prev, gallery_urls: [...(prev.gallery_urls || []), ...newUrls] }));
                }
            } catch (err: any) {
                setStatusMsg({ type: 'error', text: 'Gallery Upload Failed: ' + err.message });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const removeGalleryImage = (index: number) => {
        if (editType === 'property') {
            setPropertyForm(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== index) }));
        } else {
            setNewsForm(prev => ({ ...prev, gallery_urls: (prev.gallery_urls || []).filter((_, i) => i !== index) }));
        }
    };

    // Floor Plans Handling
    const addFloorPlan = () => {
        setPropertyForm(prev => ({ ...prev, floorPlans: [...(prev.floorPlans || []), { title: 'New Plan', image: '' }] }));
    };

    const updateFloorPlanTitle = (index: number, title: string) => {
        const newPlans = [...(propertyForm.floorPlans || [])];
        newPlans[index].title = title;
        setPropertyForm(prev => ({ ...prev, floorPlans: newPlans }));
    };

    const triggerFloorPlanUpload = (index: number) => {
        setActiveFloorPlanIndex(index);
        floorPlanInputRef.current?.click();
    };

    const handleFloorPlanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && activeFloorPlanIndex !== null) {
            const folderContext = currentEditId || draftId || 'unsorted';

            setIsLoading(true);
            try {
                // Floor plans always go to properties bucket
                const url = await uploadFile(e.target.files[0], folderContext, 'properties');
                const newPlans = [...(propertyForm.floorPlans || [])];
                newPlans[activeFloorPlanIndex].image = url;
                setPropertyForm(prev => ({ ...prev, floorPlans: newPlans }));
            } catch (err: any) {
                setStatusMsg({ type: 'error', text: 'Floor Plan Upload Failed: ' + err.message });
            } finally {
                setIsLoading(false);
                setActiveFloorPlanIndex(null);
            }
        }
    };

    const removeFloorPlan = (index: number) => {
        setPropertyForm(prev => ({ ...prev, floorPlans: (prev.floorPlans || []).filter((_, i) => i !== index) }));
    };

    // At A Glance Handling
    const addGlance = () => {
        setPropertyForm(prev => ({ ...prev, at_a_glance: [...(prev.at_a_glance || []), { label: '', value: '' }] }));
    };

    const updateGlance = (index: number, field: 'label' | 'value', text: string) => {
        const newGlance = [...(propertyForm.at_a_glance || [])];
        newGlance[index][field] = text;
        setPropertyForm(prev => ({ ...prev, at_a_glance: newGlance }));
    };

    const removeGlance = (index: number) => {
        setPropertyForm(prev => ({ ...prev, at_a_glance: (prev.at_a_glance || []).filter((_, i) => i !== index) }));
    };

    // Video Selection
    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setVideoFile(file);
        }
    };

    // --- MAIN SAVE HANDLER ---

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMsg(null);

        try {
            if (editType === 'property') {
                if (!propertyForm.title) {
                    throw new Error("Property Title is required");
                }
                const folderContext = currentEditId || draftId || propertyForm.title;
                const targetBucket = 'properties';

                let imageUrl = propertyForm.image;

                // Handle Main Image Upload
                if (imageFile) {
                    imageUrl = await uploadFile(imageFile, folderContext, targetBucket); 
                }

                // Handle Video Upload
                let videoUrl = propertyForm.videoUrl;
                if (videoFile) {
                    try {
                        videoUrl = await uploadFile(videoFile, folderContext, targetBucket);
                    } catch (uploadErr: any) {
                        console.error("Video upload failed:", uploadErr);
                        // Continue but warn
                        alert("Warning: Video failed to upload. " + uploadErr.message);
                    }
                }

                // Parse facilities from quoted string
                const facilitiesArray = parseQuotedArray(propertyForm.facilitiesInput);

                // Parse features from quoted string
                const featuresArray = parseQuotedArray(propertyForm.featuresInput);

                const propertyPayload = {
                    title: propertyForm.title,
                    location: propertyForm.location,
                    beds: Number(propertyForm.beds),
                    baths: Number(propertyForm.baths),
                    sqft: Number(propertyForm.sqft),
                    garage: Number(propertyForm.garage), 
                    tag: propertyForm.tag,
                    type: propertyForm.type,
                    featured: propertyForm.featured,
                    ready_flat: propertyForm.ready_flat, 
                    imageUrl: imageUrl,
                    videoUrl: videoUrl,
                    coordinates: {
                        lat: Number(propertyForm.latitude),
                        lng: Number(propertyForm.longitude)
                    },
                    galleryImages: propertyForm.images, 
                    floorPlans: propertyForm.floorPlans, 
                    at_a_glance: propertyForm.at_a_glance, 
                    facilities: facilitiesArray,
                    features: featuresArray 
                };

                if (currentEditId) {
                    const { error } = await supabase.from('properties').update(propertyPayload).eq('id', currentEditId);
                    if (error) throw error;
                } else {
                    const payload = { ...propertyPayload, id: draftId };
                    const { error } = await supabase.from('properties').insert([payload]);
                    if (error) throw error;
                }
            } else {
                // News Save Logic
                if (!newsForm.title) {
                    throw new Error("News Title is required");
                }
                
                const formattedContent = newsForm.content 
                    ? newsForm.content.replace(/\n/g, '<br />') 
                    : '';

                const newsPayload = {
                    title: newsForm.title,
                    category: newsForm.category,
                    date: newsForm.date,
                    excerpt: newsForm.excerpt,
                    content: formattedContent
                };

                if (currentEditId) {
                    // Update Existing News
                    let imageUrl = newsForm.image_url;
                    if (imageFile) {
                        imageUrl = await uploadFile(imageFile, String(currentEditId), 'NEWS'); 
                    }

                    const { error } = await supabase.from('news').update({
                        ...newsPayload,
                        image_url: imageUrl,
                        gallery_urls: newsForm.gallery_urls // Existing logic handles gallery updates
                    }).eq('id', currentEditId);
                    
                    if (error) throw error;
                } else {
                    // Create New News
                    // 1. Insert first to get ID
                    const { data: inserted, error: insertError } = await supabase
                        .from('news')
                        .insert([{ ...newsPayload, image_url: '', gallery_urls: [] }])
                        .select()
                        .single();
                    
                    if (insertError) throw insertError;
                    const newId = inserted.id;

                    // 2. Upload Banner if exists
                    let finalImageUrl = '';
                    if (imageFile) {
                        finalImageUrl = await uploadFile(imageFile, String(newId), 'NEWS');
                    }

                    // 3. Upload Pending Gallery Files
                    let finalGalleryUrls: string[] = [];
                    if (newsGalleryFiles.length > 0) {
                        for (const file of newsGalleryFiles) {
                            const url = await uploadFile(file, String(newId), 'NEWS');
                            finalGalleryUrls.push(url);
                        }
                    }

                    // 4. Update record with real URLs
                    const { error: updateError } = await supabase
                        .from('news')
                        .update({ 
                            image_url: finalImageUrl, 
                            gallery_urls: finalGalleryUrls 
                        })
                        .eq('id', newId);
                    
                    if (updateError) throw updateError;
                }
            }

            await fetchData(true); // Refetch but keep status message
            setIsEditing(false);
            setStatusMsg({ type: 'success', text: currentEditId ? 'Update Successful!' : 'Added Successfully!' });
            
        } catch (err: any) {
            console.error("Save Error:", err);
            setStatusMsg({ type: 'error', text: 'Operation Failed: ' + (err.message || err.details || 'Check DB permissions') });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatusMsg(null), 5000);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Authentication Guard
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-charcoal px-4 relative">
                <button onClick={() => onNavigate ? onNavigate('home') : window.location.href = '/'} className="absolute top-6 left-6 md:top-10 md:left-10 z-50 group flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-charcoal-light text-white/50 group-hover:text-white group-hover:border-gold-400 transition-all duration-300 shadow-lg">
                        <X size={20} />
                    </div>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-300 hidden md:block">Return to Site</span>
                </button>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                <div className="w-full max-w-md p-8 md:p-12 bg-charcoal-light border border-white/10 rounded-2xl shadow-2xl relative z-10">
                    <div className="flex flex-col items-center mb-10">
                        <img src="https://gnbtfbpjwiopsrbacwmo.supabase.co/storage/v1/object/public/Main%20logo/Main%20Logo.png" alt="Logo" className="h-20 w-auto mb-8" />
                        <h2 className="text-2xl font-serif text-white mb-2">Internal Access</h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest">Administrative Control Panel</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold-400 transition-colors">
                                    <User size={18} />
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="ADMIN EMAIL" 
                                    className="w-full bg-black/50 border border-white/10 px-6 py-4 pl-12 rounded-lg text-white text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-0 focus:border-gold-400 placeholder:text-white/20" 
                                    required 
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold-400 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    placeholder="PASSWORD" 
                                    className="w-full bg-black/50 border border-white/10 px-6 py-4 pl-12 rounded-lg text-white text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-0 focus:border-gold-400 placeholder:text-white/20" 
                                    required 
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-gold-400 text-charcoal text-xs font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 rounded-lg shadow-lg flex items-center justify-center gap-2">
                            {isLoading ? 'Authenticating...' : 'Authorize'}
                        </button>
                    </form>
                    {statusMsg && <div className={`mt-6 p-4 rounded-lg text-xs font-bold uppercase tracking-widest text-center animate-fade-in ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-gold-500/10 text-gold-500'}`}>{statusMsg.text}</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-charcoal flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-charcoal-light border-r border-white/5 p-6 space-y-8 relative z-30 md:fixed md:top-0 md:left-0 md:h-screen md:overflow-y-auto">
                <div className="mb-12">
                    <h2 className="text-xl font-serif text-white mb-1">Admin Panel</h2>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">Authenticated Session</p>
                </div>
                <nav className="space-y-2">
                    <button onClick={() => setActiveTab('properties')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'properties' ? 'bg-gold-400 text-charcoal' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Home size={16} /> Properties</button>
                    <button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'news' ? 'bg-gold-400 text-charcoal' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Newspaper size={16} /> News Feed</button>
                    <button onClick={() => setActiveTab('comments')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'comments' ? 'bg-gold-400 text-charcoal' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><MessageSquare size={16} /> Comments</button>
                </nav>
                <div className="pt-12 mt-auto">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/10 transition-all"><LogOut size={16} /> Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto md:ml-64">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2 capitalize">{activeTab}</h1>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Database Management Dashboard</p>
                    </div>
                    {activeTab !== 'comments' && (
                        <button onClick={() => handleAddStart(activeTab === 'properties' ? 'property' : 'news')} className="bg-gold-400 text-charcoal px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 shadow-xl flex items-center gap-2">
                            <Plus size={16} /> Add {activeTab === 'properties' ? 'Property' : 'Article'}
                        </button>
                    )}
                </div>

                {statusMsg && (
                    <div className={`mb-8 p-4 rounded-lg flex items-center gap-4 animate-slide-up-fade ${statusMsg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-gold-500/10 text-gold-500 border border-gold-500/20'}`}>
                        {statusMsg.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
                        <span className="text-xs font-bold uppercase tracking-widest">{statusMsg.text}</span>
                    </div>
                )}

                <div className="bg-charcoal-light border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    {isLoading && <div className="p-20 flex justify-center"><div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div></div>}

                    {!isLoading && activeTab === 'properties' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Property</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Specs</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {properties.length > 0 ? properties.map(p => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded bg-charcoal overflow-hidden shrink-0">
                                                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
                                                        <p className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                                                            <MapPin size={10} className="text-gold-400" /> {p.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded ${p.tag === 'Sold' ? 'bg-red-500/10 text-red-500' : 'bg-gold-500/10 text-gold-500'}`}>
                                                    {p.tag}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex gap-4 text-[10px] text-white/30 uppercase tracking-widest">
                                                    <span>{p.beds} B</span>
                                                    <span>{p.baths} BA</span>
                                                    <span>{p.sqft} SQFT</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEditStart(p, 'property')} className="p-2 text-white/40 hover:text-gold-400 transition-colors"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(p.id, 'properties')} className="p-2 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-white/30 text-xs uppercase tracking-widest">No properties found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ... (Other tabs table rendering code omitted but assumed present) ... */}
                    {!isLoading && activeTab === 'news' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Article</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {news.length > 0 ? news.map(n => (
                                        <tr key={n.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded bg-charcoal overflow-hidden shrink-0">
                                                        <img src={n.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <h4 className="text-sm font-bold text-white max-w-xs truncate">{n.title}</h4>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6"><span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded bg-white/5 text-white/60">{n.category}</span></td>
                                            <td className="px-6 py-6 text-xs text-white/40 uppercase tracking-widest">{n.date}</td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEditStart(n, 'news')} className="p-2 text-white/40 hover:text-gold-400 transition-colors"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(n.id, 'news')} className="p-2 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-white/30 text-xs uppercase tracking-widest">No news items found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {!isLoading && activeTab === 'comments' && (
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Author</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Message</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Context</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {comments.length > 0 ? comments.map(c => (
                                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-6 align-top">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white">{c.author_name}</span>
                                                    <div className="flex items-center gap-1 text-[10px] text-white/40 mt-1"><Mail size={10} /> {c.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 align-top"><p className="text-xs text-white/70 leading-relaxed max-w-sm">{c.content}</p></td>
                                            <td className="px-6 py-6 align-top">
                                                 <span className="text-[10px] uppercase tracking-widest text-gold-400 block mb-1">{c.properties ? 'Property' : c.news ? 'Article' : 'General'}</span>
                                                 <span className="text-xs text-white block max-w-[150px] truncate">{c.properties?.title || c.news?.title || '-'}</span>
                                            </td>
                                            <td className="px-6 py-6 align-top text-xs text-white/40 uppercase tracking-widest whitespace-nowrap">{formatDate(c.created_at)}</td>
                                            <td className="px-6 py-6 align-top text-right">
                                                <button onClick={() => handleDelete(c.id, 'comments')} className="p-2 text-white/40 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 rounded"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-white/30 text-xs uppercase tracking-widest">No comments found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                         </div>
                    )}
                </div>
            </main>

            {/* --- EDIT MODAL --- */}
            {isEditing && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditing(false)}></div>
                    <div className="relative w-full max-w-5xl bg-charcoal-light rounded-2xl shadow-2xl overflow-hidden animate-slide-up-fade flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-serif text-white">
                                {currentEditId ? 'Edit' : 'Add New'} {editType === 'property' ? 'Property' : 'News Article'}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-12">
                            {editType === 'property' ? (
                                <>
                                    {/* SECTION 1: BASIC INFO */}
                                    <div className="space-y-6">
                                        <h4 className="text-gold-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                            <Home size={16} /> Basic Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Title</label>
                                                    <input type="text" value={propertyForm.title} onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Location Address</label>
                                                    <input type="text" value={propertyForm.location} onChange={(e) => setPropertyForm({...propertyForm, location: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" required />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                     <div className="space-y-2">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Status</label>
                                                        <select value={propertyForm.tag} onChange={(e) => setPropertyForm({...propertyForm, tag: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400">
                                                            <option value="Sale">For Sale</option>
                                                            <option value="Rent">For Rent</option>
                                                            <option value="Sold">Sold</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Type</label>
                                                        <select value={propertyForm.type} onChange={(e) => setPropertyForm({...propertyForm, type: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400">
                                                            <option value="Residential">Residential</option>
                                                            <option value="Commercial">Commercial</option>
                                                            <option value="Land">Land</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Featured Image</label>
                                                    <div 
                                                        className="w-full bg-black/50 border border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gold-400 hover:bg-white/5 transition-all group min-h-[140px]"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                                        {previewUrl ? (
                                                            <img src={previewUrl} alt="Preview" className="h-32 w-auto object-cover rounded" />
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-gold-400">
                                                                <CloudUpload size={24} /> <span className="text-[10px] uppercase font-bold">Upload Main Image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                                                        <input type="checkbox" id="featured" checked={propertyForm.featured} onChange={(e) => setPropertyForm({...propertyForm, featured: e.target.checked})} className="w-5 h-5 rounded border-white/20 accent-gold-400" />
                                                        <label htmlFor="featured" className="text-sm font-bold uppercase tracking-widest text-white cursor-pointer select-none">Mark as Featured</label>
                                                    </div>
                                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                                                        <input type="checkbox" id="ready_flat" checked={propertyForm.ready_flat} onChange={(e) => setPropertyForm({...propertyForm, ready_flat: e.target.checked})} className="w-5 h-5 rounded border-white/20 accent-gold-400" />
                                                        <label htmlFor="ready_flat" className="text-sm font-bold uppercase tracking-widest text-white cursor-pointer select-none">Mark as Ready Flat</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 2: SPECS & LOCATION */}
                                    <div className="space-y-6">
                                        <h4 className="text-gold-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                            <MapPin size={16} /> Specifications & Map
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Area (SQFT)</label>
                                                <input type="number" value={propertyForm.sqft} onChange={(e) => setPropertyForm({...propertyForm, sqft: parseInt(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Bedrooms</label>
                                                <input type="number" value={propertyForm.beds} onChange={(e) => setPropertyForm({...propertyForm, beds: parseInt(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Bathrooms</label>
                                                <input type="number" value={propertyForm.baths} onChange={(e) => setPropertyForm({...propertyForm, baths: parseInt(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Garages</label>
                                                <input type="number" value={propertyForm.garage} onChange={(e) => setPropertyForm({...propertyForm, garage: parseInt(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Latitude</label>
                                                <input type="number" step="any" value={propertyForm.latitude} onChange={(e) => setPropertyForm({...propertyForm, latitude: parseFloat(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Longitude</label>
                                                <input type="number" step="any" value={propertyForm.longitude} onChange={(e) => setPropertyForm({...propertyForm, longitude: parseFloat(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 3: MEDIA (Gallery & Video) */}
                                    <div className="space-y-6">
                                        <h4 className="text-gold-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                            <ImageIcon size={16} /> Gallery & Media
                                        </h4>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Property Video (MP4/WebM)</label>
                                            <div 
                                                className="w-full bg-black/50 border border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gold-400 hover:bg-white/5 transition-all group"
                                                onClick={() => videoInputRef.current?.click()}
                                            >
                                                <input 
                                                    type="file" 
                                                    ref={videoInputRef} 
                                                    className="hidden" 
                                                    accept="video/mp4,video/webm,video/ogg"
                                                    onChange={handleVideoSelect} 
                                                />
                                                {(videoFile || propertyForm.videoUrl) ? (
                                                    <div className="w-full aspect-video bg-black relative rounded overflow-hidden">
                                                         <video 
                                                            src={videoFile ? URL.createObjectURL(videoFile) : propertyForm.videoUrl} 
                                                            className="w-full h-full object-cover" 
                                                            controls 
                                                         />
                                                         <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-[10px] rounded uppercase font-bold">
                                                            {videoFile ? 'New Selection' : 'Current Video'}
                                                         </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-gold-400">
                                                        <Film size={24} /> <span className="text-[10px] uppercase font-bold">Upload Video</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Gallery Images</label>
                                                <button type="button" onClick={() => galleryInputRef.current?.click()} className="text-xs text-gold-400 font-bold uppercase hover:underline">+ Add Image</button>
                                                <input type="file" multiple ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                                            </div>
                                            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                                {Array.isArray(propertyForm.images) && propertyForm.images.map((url, idx) => (
                                                    <div key={idx} className="relative group aspect-square bg-charcoal rounded overflow-hidden border border-white/10">
                                                        <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                                    </div>
                                                ))}
                                                <div onClick={() => galleryInputRef.current?.click()} className="aspect-square bg-white/5 border border-dashed border-white/20 rounded flex items-center justify-center cursor-pointer hover:border-gold-400 hover:text-gold-400 transition-colors">
                                                    <Plus size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 4: FLOOR PLANS */}
                                    <div className="space-y-6">
                                        <h4 className="text-gold-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                            <Layers size={16} /> Floor Plans
                                        </h4>
                                        <div className="space-y-4">
                                            {Array.isArray(propertyForm.floorPlans) && propertyForm.floorPlans.map((plan, idx) => (
                                                <div key={idx} className="flex gap-4 items-center bg-white/5 p-4 rounded-lg border border-white/5">
                                                    <div className="w-16 h-16 bg-charcoal rounded overflow-hidden shrink-0 border border-white/10 cursor-pointer hover:border-gold-400" onClick={() => triggerFloorPlanUpload(idx)}>
                                                        {plan.image ? <img src={plan.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Upload size={16} /></div>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <input type="text" value={plan.title} onChange={(e) => updateFloorPlanTitle(idx, e.target.value)} placeholder="Floor Plan Title (e.g. Ground Floor)" className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:border-gold-400 focus:outline-none mb-2" />
                                                        <p className="text-[10px] text-white/40">Click image to upload</p>
                                                    </div>
                                                    <button type="button" onClick={() => removeFloorPlan(idx)} className="text-white/20 hover:text-red-500"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={addFloorPlan} className="w-full py-3 border border-dashed border-white/20 text-white/40 text-xs font-bold uppercase hover:text-gold-400 hover:border-gold-400 transition-colors">
                                                + Add Floor Plan
                                            </button>
                                            <input type="file" ref={floorPlanInputRef} className="hidden" accept="image/*" onChange={handleFloorPlanFile} />
                                        </div>
                                    </div>

                                    {/* SECTION 5: DETAILS (Facilities & At a Glance) */}
                                    <div className="space-y-6">
                                        <h4 className="text-gold-400 text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                                            <List size={16} /> Details & Features
                                        </h4>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Facilities ("Quoted" separated)</label>
                                            <textarea 
                                                value={propertyForm.facilitiesInput} 
                                                onChange={(e) => setPropertyForm({...propertyForm, facilitiesInput: e.target.value})}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400 resize-none h-24"
                                                placeholder='"Gym", "Swimming Pool", "CCTV", "24/7 Security"'
                                            ></textarea>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Features / Amenities ("Quoted" separated)</label>
                                            <textarea 
                                                value={propertyForm.featuresInput} 
                                                onChange={(e) => setPropertyForm({...propertyForm, featuresInput: e.target.value})}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400 resize-none h-24"
                                                placeholder='"South Facing", "Corner Plot", "Lake View"'
                                            ></textarea>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">At A Glance (Key Features)</label>
                                            {Array.isArray(propertyForm.at_a_glance) && propertyForm.at_a_glance.map((item, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <input type="text" value={item.label} onChange={(e) => updateGlance(idx, 'label', e.target.value)} placeholder="Label (e.g. Facing)" className="flex-1 bg-black/50 border border-white/10 rounded p-3 text-sm text-white focus:border-gold-400 focus:outline-none" />
                                                    <input type="text" value={item.value} onChange={(e) => updateGlance(idx, 'value', e.target.value)} placeholder="Value (e.g. South)" className="flex-1 bg-black/50 border border-white/10 rounded p-3 text-sm text-white focus:border-gold-400 focus:outline-none" />
                                                    <button type="button" onClick={() => removeGlance(idx)} className="text-white/20 hover:text-red-500 p-2"><X size={16} /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={addGlance} className="text-xs text-gold-400 font-bold uppercase hover:underline">+ Add Row</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Article Title</label>
                                                <input type="text" value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Category</label>
                                                    <input type="text" value={newsForm.category} onChange={(e) => setNewsForm({...newsForm, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Date</label>
                                                    <input type="date" value={newsForm.date} onChange={(e) => setNewsForm({...newsForm, date: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400" required />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Banner Image</label>
                                                 {/* File Upload Area for News */}
                                                 <div 
                                                    className="w-full bg-black/50 border border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-gold-400 hover:bg-white/5 transition-all group"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <input 
                                                        type="file" 
                                                        ref={fileInputRef} 
                                                        className="hidden" 
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                    />
                                                    {previewUrl ? (
                                                        <div className="relative w-full aspect-video rounded-md overflow-hidden bg-charcoal-dark">
                                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="bg-charcoal text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                                                    <Edit2 size={12} /> Change
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-gold-400 transition-colors">
                                                            <CloudUpload size={32} />
                                                            <span className="text-xs font-bold uppercase tracking-widest">Click to Upload Image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Excerpt (Short Summary)</label>
                                                <textarea value={newsForm.excerpt} onChange={(e) => setNewsForm({...newsForm, excerpt: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-white focus:outline-none focus:border-gold-400 resize-none" rows={3} required></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gallery Section for News */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Gallery Images</label>
                                            <button type="button" onClick={() => galleryInputRef.current?.click()} className="text-xs text-gold-400 font-bold uppercase hover:underline">+ Add Image</button>
                                            <input type="file" multiple ref={galleryInputRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                                        </div>
                                        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                            {Array.isArray(newsForm.gallery_urls) && newsForm.gallery_urls.map((url, idx) => (
                                                <div key={idx} className="relative group aspect-square bg-charcoal rounded overflow-hidden border border-white/10">
                                                    <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                                </div>
                                            ))}
                                            <div onClick={() => galleryInputRef.current?.click()} className="aspect-square bg-white/5 border border-dashed border-white/20 rounded flex items-center justify-center cursor-pointer hover:border-gold-400 hover:text-gold-400 transition-colors">
                                                <Plus size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Article Content (Plain Text)</label>
                                        </div>
                                        <textarea 
                                            ref={contentTextareaRef}
                                            value={newsForm.content} 
                                            onChange={(e) => setNewsForm({...newsForm, content: e.target.value})} 
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-6 text-sm text-white font-mono focus:outline-none focus:border-gold-400 resize-none" 
                                            rows={10} 
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-4 pb-4 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" disabled={isLoading} className="bg-gold-400 text-charcoal px-10 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center gap-2 shadow-lg">
                                    <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};