import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/logo.svg" 
        alt="Mujer plena, mamá feliz" 
        className="h-full"
      />
    </div>
  );
};

export default Logo;