'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '../utils/cn';
const MetricCard = React.forwardRef(({ className, title, value, icon, color = 'text-zinc-300', bgColor = 'bg-zinc-800/50', change, changeType = 'neutral', description, ...props }, ref) => {
    const changeColors = {
        positive: 'text-green-400',
        negative: 'text-red-400',
        neutral: 'text-zinc-400',
    };
    return (_jsxs("div", { className: cn('p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-teal-500/50 hover:bg-zinc-800/50 transition-all duration-200', className), ref: ref, ...props, children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: `p-3 rounded-lg ${bgColor}`, children: _jsx("div", { className: color, children: icon }) }), change && (_jsx("span", { className: cn('text-sm font-medium', changeColors[changeType]), children: change }))] }), _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "text-2xl font-bold text-white", children: value }), _jsx("div", { className: "text-sm text-zinc-400", children: title }), description && (_jsx("div", { className: "text-xs text-zinc-500", children: description }))] })] }));
});
MetricCard.displayName = 'MetricCard';
export default MetricCard;
