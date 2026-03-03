import React, { useEffect } from 'react';
import { Reveal } from './Reveal';
import { MapPin, Phone, Mail, Clock, ArrowRight, MessageSquare, Globe } from 'lucide-react';

export const ContactPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert("Message sent! We will get back to you soon.");
      (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
      {
          icon: <MapPin size={24} />,
          title: "Headquarters",
          line1: "House-137, Sector-3",
          line2: "Uposhohor, Rajshahi, BD",
          action: "View on Map"
      },
      {
          icon: <Phone size={24} />,
          title: "Private Line",
          line1: "+ (880) 171-1151207",
          line2: "09610-000300 (Hotline)",
          action: "Call Now"
      },
      {
          icon: <Mail size={24} />,
          title: "Electronic Mail",
          line1: "sales@rangapori.properties",
          line2: "",
          action: "Send Email"
      }
  ];

  return (
    <div className="bg-charcoal min-h-screen pt-24 md:pt-32 pb-20 relative overflow-hidden flex items-center">
       
       {/* --- COMPLEX BACKGROUND --- */}
       <div className="absolute inset-0 z-0 pointer-events-none">
           {/* Abstract Grid */}
           <div className="absolute inset-0 opacity-[0.03]" 
                style={{ 
                    backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                    backgroundSize: '60px 60px'
                }}>
           </div>
           
           {/* Gold Ambient Glow */}
           <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-gold-400/5 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/5 rounded-full blur-[60px] md:blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
       </div>

       <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
                
                {/* --- LEFT COLUMN: Editorial & Info --- */}
                {/* Changed: Removed sticky from mobile, only applying lg:sticky to prevent overlap */}
                <div className="w-full lg:w-5/12 relative lg:sticky lg:top-32 mb-8 lg:mb-0">
                    <Reveal type="slide-up">
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                            <span className="w-12 h-[1px] bg-gold-400"></span>
                            <span className="text-gold-400 font-sans text-xs font-bold uppercase tracking-[0.2em]">
                                Contact
                            </span>
                        </div>
                    </Reveal>

                    <Reveal type="slide-up" delay={0.1}>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white mb-6 md:mb-8 leading-[1.1]">
                            Connect <br/> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">With Us</span>
                        </h1>
                    </Reveal>

                    <Reveal type="fade" delay={0.2}>
                        <p className="text-white/60 font-sans font-light leading-relaxed mb-10 md:mb-12 max-w-md text-base md:text-lg border-l border-white/10 pl-6">
                            Whether you're looking to buy your dream home or sell a premium property, our experts are here to guide you every step of the way.
                        </p>
                    </Reveal>
                    
                    {/* Info Cards */}
                    <div className="space-y-4 md:space-y-6">
                        {contactInfo.map((info, idx) => (
                            <Reveal key={idx} type="fade" delay={0.3 + (idx * 0.1)}>
                                <div className="group flex items-center gap-4 md:gap-6 p-4 md:p-6 border border-white/5 hover:border-gold-400/30 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500 cursor-pointer rounded-sm">
                                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border border-white/10 rounded-full text-gold-400 group-hover:bg-gold-400 group-hover:text-charcoal transition-all duration-300">
                                        {info.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-serif text-base md:text-lg mb-1">{info.title}</h3>
                                        <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-wider">{info.line1}</p>
                                        {info.line2 && <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-wider">{info.line2}</p>}
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                        <ArrowRight className="text-gold-400" size={18} />
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT COLUMN: The "Contract" Form --- */}
                <div className="w-full lg:w-7/12 mt-8 lg:mt-0">
                    <Reveal type="fade" delay={0.4}>
                        <div className="bg-[#121212] p-6 md:p-14 relative overflow-hidden shadow-2xl border border-white/5">
                             
                             {/* Form Decorative Lines */}
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-transparent to-transparent"></div>
                             <div className="absolute bottom-0 right-0 w-20 h-20 border-r border-b border-white/10"></div>

                             <div className="flex justify-between items-end mb-8 md:mb-12">
                                 <div className="max-w-lg">
                                    <h3 className="text-2xl md:text-3xl font-serif text-white mb-4">Send Message</h3>
                                    <p className="text-white/50 text-sm font-light leading-relaxed">
                                        Fill out the form below and one of our premium property consultants will get back to you within 24 hours.
                                    </p>
                                 </div>
                                 <MessageSquare className="text-white/10 shrink-0 hidden md:block" size={48} />
                             </div>
                             
                             <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                     {/* Floating Label Input: First Name */}
                                     <div className="relative z-0 w-full group">
                                         <input type="text" name="firstName" id="firstName" className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-gold-400 peer transition-colors" placeholder=" " required />
                                         <label htmlFor="firstName" className="peer-focus:font-medium absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest">First Name</label>
                                     </div>

                                     {/* Floating Label Input: Last Name */}
                                     <div className="relative z-0 w-full group">
                                         <input type="text" name="lastName" id="lastName" className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-gold-400 peer transition-colors" placeholder=" " required />
                                         <label htmlFor="lastName" className="peer-focus:font-medium absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest">Last Name</label>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                     {/* Floating Label Input: Email */}
                                     <div className="relative z-0 w-full group">
                                         <input type="email" name="email" id="email" className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-gold-400 peer transition-colors" placeholder=" " required />
                                         <label htmlFor="email" className="peer-focus:font-medium absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest">Email Address</label>
                                     </div>

                                     {/* Floating Label Input: Phone */}
                                     <div className="relative z-0 w-full group">
                                         <input type="tel" name="phone" id="phone" className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-gold-400 peer transition-colors" placeholder=" " required />
                                         <label htmlFor="phone" className="peer-focus:font-medium absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest">Phone Number</label>
                                     </div>
                                 </div>

                                 {/* Floating Label Textarea */}
                                 <div className="relative z-0 w-full group">
                                     <textarea name="message" id="message" rows={4} className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-gold-400 peer transition-colors resize-none" placeholder=" " required></textarea>
                                     <label htmlFor="message" className="peer-focus:font-medium absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-gold-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest">Your Message</label>
                                 </div>

                                 {/* Submit Button */}
                                 <div className="pt-6 md:pt-8 flex items-center justify-end">
                                     <button className="group relative w-full md:w-auto px-8 py-4 bg-white text-charcoal overflow-hidden transition-all">
                                         <span className="relative z-10 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                             Send <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                         </span>
                                         <div className="absolute inset-0 bg-gold-400 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-luxury"></div>
                                     </button>
                                 </div>
                             </form>
                        </div>
                    </Reveal>
                </div>
            </div>
       </div>
    </div>
  );
};