import React from 'react';

interface PeachLogoProps {
  size?: number;
  className?: string;
}

const PeachLogo: React.FC<PeachLogoProps> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Peach Heart Shape */}
      <path 
        d="M50 88C50 88 18 68 18 42C18 26 34 16 50 32C66 16 82 26 82 42C82 68 50 88 50 88Z" 
        fill="#FF8266" 
      />
      
      {/* Stem and Leaf */}
      <path 
        d="M50 32L50 12" 
        stroke="#4ADE80" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      <path 
        d="M50 22C65 22 75 8 75 8C75 8 60 2 50 15" 
        fill="#4ADE80" 
      />

      {/* Stack Bars */}
      <rect x="30" y="42" width="40" height="8" rx="2" fill="#FDF6E3" />
      <rect x="30" y="54" width="40" height="8" rx="2" fill="#FB923C" />
      <rect x="30" y="66" width="40" height="8" rx="2" fill="#EA580C" />
    </svg>
  );
};

export default PeachLogo;
