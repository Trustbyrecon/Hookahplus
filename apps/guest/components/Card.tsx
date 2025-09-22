import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'highlighted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
    const baseClasses = 'rounded-xl border transition-all duration-200';
    
    const variants = {
      default: 'bg-zinc-900 border-zinc-800',
      outlined: 'bg-transparent border-zinc-700',
      elevated: 'bg-zinc-900 border-zinc-800 shadow-lg',
      highlighted: 'bg-primary-500/10 border-primary-500/50',
    };
    
    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    const hoverClasses = hover ? 'hover:shadow-md hover:border-zinc-300 cursor-pointer' : '';
    
    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          paddings[padding],
          hoverClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
