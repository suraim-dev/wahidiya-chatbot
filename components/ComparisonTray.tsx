import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Property } from '../types';
import { X, GitCompare, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
import { ComparePage } from './ComparePage';

export const ComparisonTray: React.FC<{ onNavigate: (page: string, id?: string) => void }> = ({ onNavigate }) => {
    const [items, setItems] = useState<Property[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadItems = () => {
        const stored = localStorage.getItem('compareList');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                setItems([]);
            }
        } else {
            setItems([]);
        }
    };

    useEffect(() => {
        loadItems();
        const handleStorage = () => loadItems();
        
        // Listen for custom event within the app and storage event for cross-tab updates
        window.addEventListener('compare-updated', handleStorage);
        window.addEventListener('storage', handleStorage);
        
        // Listen for external trigger to open modal
        const handleOpenModalEvent = () => {
            setIsModalOpen(true);
            document.body.style.overflow = 'hidden';
        };
        window.addEventListener('open-compare-modal', handleOpenModalEvent);
        
        return () => {
            window.removeEventListener('compare-updated', handleStorage);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('open-compare-modal', handleOpenModalEvent);
        };
    }, []);

    const removeItem = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newItems = items.filter(p => p.id !== id);
        localStorage.setItem('compareList', JSON.stringify(newItems));
        setItems(newItems);
        window.dispatchEvent(new Event('compare-updated'));
    };

    const handleOpenModal = () => {
        if (items.length < 2) {
            alert("Select at least 2 properties to compare.");
            return;
        }
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = '';
    };

    // --- MODAL COMPONENT ---
    const CompareModal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in" 
                onClick={handleCloseModal}
            ></div>
            
            {/* Modal Content */}
            <div className="relative w-full h-full md:h-[90vh] md:w-[95vw] max-w-7xl bg-[#121212] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-fade border border-white/10">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#1A1A1A] z-10">
                    <div className="flex items-center gap-3">
                        <GitCompare className="text-gold-400" size={20} />
                        <h2 className="text-white font-serif text-xl">Property Comparison</h2>
                    </div>
                    <button 
                        onClick={handleCloseModal}
                        className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-charcoal custom-scrollbar relative">
                     {/* Decorative BG inside modal */}
                     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                     
                     <div className="p-4 md:p-8 min-h-full">
                        <ComparePage 
                            embedded={true} 
                            onNavigate={(page, id) => {
                                handleCloseModal();
                                onNavigate(page, id);
                            }} 
                        />
                     </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Tray Bar - Only visible if items exist and modal is closed */}
            {items.length > 0 && !isModalOpen && (
                <div 
                    className={`fixed bottom-0 left-0 right-0 mx-auto z-[60] w-[94vw] md:w-[500px] transition-transform duration-500 ease-luxury shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.8)] rounded-t-xl ${
                        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'
                    }`}
                >
                    <div className="bg-[#121212] border border-white/10 border-b-0 rounded-t-xl overflow-hidden backdrop-blur-md relative">
                        {/* Decorative top line */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-50"></div>

                        {/* Header */}
                        <div 
                            className="flex justify-between items-center px-4 md:px-6 py-4 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors h-[56px]"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-gold-400 text-charcoal flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                                    <GitCompare size={14} />
                                </div>
                                <span className="text-white font-serif text-sm tracking-wide">
                                    Compare <span className="hidden md:inline">Properties</span> <span className="text-white/40 ml-1 text-xs font-sans tracking-widest">({items.length} / 3)</span>
                                </span>
                            </div>
                            <div className="text-white/50">
                                {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-4 md:p-6 bg-charcoal">
                            <div className="flex gap-3 md:gap-4 mb-6 overflow-x-auto pb-2 custom-scrollbar justify-center">
                                {[...Array(3)].map((_, i) => {
                                    const item = items[i];
                                    return (
                                        <div key={i} className="relative w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-white/5 group">
                                            {item ? (
                                                <>
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                                    <button 
                                                        onClick={(e) => removeItem(e, item.id)}
                                                        className="absolute top-1 right-1 bg-black/60 text-white/70 hover:text-white hover:bg-red-600 p-1.5 rounded-full transition-all opacity-100 transform scale-100 backdrop-blur-sm"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    <div className="absolute bottom-2 left-2 right-2">
                                                        <p className="text-[9px] text-white font-serif truncate leading-tight">{item.title}</p>
                                                        <p className="text-[8px] text-gold-400 font-bold mt-0.5">{item.price}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-2">
                                                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                                        <span className="text-xs">+</span>
                                                    </div>
                                                    <span className="text-[8px] uppercase tracking-widest">Empty</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <button 
                                onClick={handleOpenModal}
                                disabled={items.length < 2}
                                className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 rounded-sm ${
                                    items.length >= 2 
                                    ? 'bg-gold-400 text-charcoal hover:bg-white hover:text-charcoal shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                                }`}
                            >
                                Compare Now <ArrowRight size={14} className={items.length >= 2 ? "animate-pulse" : ""} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* PORTAL RENDER */}
            {isModalOpen && createPortal(CompareModal, document.body)}
        </>
    );
};