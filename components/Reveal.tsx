import React, { useRef, useEffect, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  type?: 'slide-up' | 'fade' | 'zoom';
  delay?: number; // seconds
  className?: string;
  threshold?: number;
  repeat?: boolean;
}

export const Reveal: React.FC<RevealProps> = ({ 
  children, 
  type = 'slide-up', 
  delay = 0, 
  className = '',
  threshold = 0.1,
  repeat = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!repeat) {
            observer.unobserve(entry.target);
          }
        } else if (repeat) {
          setIsVisible(false);
        }
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold, repeat]);

  const getAnimationClass = () => {
    switch (type) {
      case 'slide-up': return 'reveal-slide-up';
      case 'fade': return 'reveal-fade';
      case 'zoom': return 'image-zoom';
      default: return 'reveal-slide-up';
    }
  };

  const isContainer = type === 'slide-up' || type === 'zoom';
  // Ensure inner wrapper fills dimensions for zoom type (critical for background videos/images)
  const innerClass = type === 'zoom' ? 'w-full h-full' : '';

  return (
    <div 
      ref={ref} 
      className={`${isContainer ? 'reveal-container' : ''} ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      <div 
        className={`${getAnimationClass()} ${innerClass}`}
        style={{ transitionDelay: `${delay}s` }}
      >
        {children}
      </div>
    </div>
  );
};