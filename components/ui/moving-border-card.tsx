import React from 'react';

interface MovingBorderCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
}

export const MovingBorderCard: React.FC<MovingBorderCardProps> = ({ children, className = "", onClick, href }) => {
  const Component = href ? 'a' : 'div';
  
  return (
    <Component 
      href={href}
      onClick={onClick}
      className={`relative block overflow-hidden rounded-none p-[1px] group h-full ${className}`}
    >
      {/* Moving Gradient Border */}
      <div className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0000_0%,#D4AF37_10%,#0000_50%)] opacity-100 transition-opacity duration-500" />
      
      {/* Inner Content Container */}
      <div className="relative h-full w-full bg-[#1B1B1B] p-5 md:p-8 hover:bg-[#252525] transition-colors duration-500">
        {children}
      </div>
    </Component>
  );
};
