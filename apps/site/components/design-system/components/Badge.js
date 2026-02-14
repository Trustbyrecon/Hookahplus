import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '../utils/cn';
const Badge = React.forwardRef(({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full font-medium';
    const variants = {
        default: 'bg-zinc-700 text-zinc-300',
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white',
        outline: 'border border-zinc-600 text-zinc-400',
    };
    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };
    return (_jsx("span", { className: cn(baseClasses, variants[variant], sizes[size], className), ref: ref, ...props, children: children }));
});
Badge.displayName = 'Badge';
export default Badge;
