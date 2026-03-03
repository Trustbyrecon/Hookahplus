'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '../utils/cn';
import { Lock, Shield } from 'lucide-react';
const TrustLock = React.forwardRef(({ className, trustScore = 0.87, status = 'active', version = 'TLH-v1', showIcon = true, size = 'md', ...props }, ref) => {
    const statusConfig = {
        active: {
            border: 'border-teal-500',
            bg: 'bg-teal-500/10',
            text: 'text-teal-200',
            icon: 'text-green-400'
        },
        inactive: {
            border: 'border-zinc-600',
            bg: 'bg-zinc-800/50',
            text: 'text-zinc-400',
            icon: 'text-zinc-500'
        },
        warning: {
            border: 'border-yellow-500',
            bg: 'bg-yellow-500/10',
            text: 'text-yellow-200',
            icon: 'text-yellow-400'
        }
    };
    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base'
    };
    const config = statusConfig[status];
    return (_jsxs("div", { className: cn('flex items-center gap-2 rounded-lg border transition-all duration-200', config.border, config.bg, sizeClasses[size], className), ref: ref, ...props, children: [showIcon && (_jsx("div", { className: config.icon, children: status === 'active' ? _jsx(Shield, { className: "w-4 h-4" }) : _jsx(Lock, { className: "w-4 h-4" }) })), _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { className: config.text, children: ["Trust-Lock: ", version, "::active"] }), trustScore > 0 && (_jsxs("span", { className: "text-xs text-zinc-400", children: ["Trust Score: ", trustScore.toFixed(2)] }))] })] }));
});
TrustLock.displayName = 'TrustLock';
export default TrustLock;
