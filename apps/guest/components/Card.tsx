import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick, style }) => {
  return (
    <div 
      className={`bg-zinc-900 border border-zinc-800 rounded-lg ${hover ? 'hover:border-zinc-700 transition-colors' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;