import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export default function Logo({ className = '', size = 32, ...props }: LogoProps) {
  // Output a customized 'W' shape and dynamically scale up size to feel balanced
  return (
    <svg 
      width={typeof size === 'number' ? size * 1.25 : size} 
      height={typeof size === 'number' ? size * 1.25 : size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path 
        d="M20 42 L38 82 L50 20 L62 82 L80 42" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinejoin="miter" 
        strokeMiterlimit="10"
      />
    </svg>
  );
}





