import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
import Card from '../Card';
import { ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
const JourneyCard = ({ title, description, status, duration, nextAction, onAction, actionLabel = 'Continue', className }) => {
    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-400" });
            case 'active':
                return _jsx(Clock, { className: "w-5 h-5 text-teal-400 animate-pulse" });
            case 'error':
                return _jsx(AlertCircle, { className: "w-5 h-5 text-red-400" });
            default:
                return _jsx("div", { className: "w-5 h-5 rounded-full bg-zinc-600" });
        }
    };
    const getStatusStyles = () => {
        switch (status) {
            case 'completed':
                return 'border-green-500/50 bg-green-500/5';
            case 'active':
                return 'border-teal-500/50 bg-teal-500/5';
            case 'error':
                return 'border-red-500/50 bg-red-500/5';
            default:
                return 'border-zinc-700 bg-zinc-800/50';
        }
    };
    return (_jsxs(Card, { className: cn('transition-all duration-200 hover:shadow-lg', getStatusStyles(), className), children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [getStatusIcon(), _jsx("h3", { className: "text-lg font-semibold text-white", children: title })] }), duration && (_jsx("span", { className: "text-sm text-zinc-400", children: duration }))] }), _jsx("p", { className: "text-zinc-300 mb-4", children: description }), nextAction && (_jsx("div", { className: "mb-4 p-3 bg-zinc-800/50 rounded-lg", children: _jsxs("p", { className: "text-sm text-zinc-400", children: [_jsx("span", { className: "font-medium", children: "Next:" }), " ", nextAction] }) })), onAction && (_jsxs("button", { onClick: onAction, className: cn('w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors', status === 'completed'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : status === 'active'
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : status === 'error'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'), children: [_jsx("span", { children: actionLabel }), _jsx(ArrowRight, { className: "w-4 h-4" })] }))] }));
};
export default JourneyCard;
