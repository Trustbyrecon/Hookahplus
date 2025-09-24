import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/format';
import Badge from '../Badge';
import Card from '../Card';
import Button from '../Button';
import { Clock, Flame, ChefHat, UserCheck, AlertTriangle, RefreshCw, Flag, Pause, Zap } from 'lucide-react';
const SessionCard = ({ session, onAction, className }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-600';
            case 'preparing': return 'bg-yellow-600';
            case 'active': return 'bg-green-600';
            case 'paused': return 'bg-orange-600';
            case 'completed': return 'bg-gray-600';
            case 'cancelled': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'new': return _jsx(UserCheck, { className: "w-4 h-4" });
            case 'preparing': return _jsx(ChefHat, { className: "w-4 h-4" });
            case 'active': return _jsx(Flame, { className: "w-4 h-4" });
            case 'paused': return _jsx(Pause, { className: "w-4 h-4" });
            case 'completed': return _jsx(Clock, { className: "w-4 h-4" });
            case 'cancelled': return _jsx(AlertTriangle, { className: "w-4 h-4" });
            default: return _jsx(Clock, { className: "w-4 h-4" });
        }
    };
    const getCoalStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-400';
            case 'needs_refill': return 'text-yellow-400';
            case 'burnt_out': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };
    const getCoalStatusIcon = (status) => {
        switch (status) {
            case 'active': return '🔥';
            case 'needs_refill': return '⚠️';
            case 'burnt_out': return '💀';
            default: return '⚪';
        }
    };
    return (_jsxs(Card, { className: cn('hover:shadow-lg transition-all duration-200', className), children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(ChefHat, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { className: "text-lg font-semibold text-white", children: session.tableId })] }), _jsxs(Badge, { variant: "outline", className: "text-xs", children: [session.customerName || 'Anonymous', " - ", session.flavor || 'Custom Mix'] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Badge, { variant: "default", className: cn('text-xs', getStatusColor(session.status)), children: [getStatusIcon(session.status), _jsx("span", { className: "ml-1 uppercase", children: session.status })] }), _jsxs("span", { className: "text-lg font-bold text-white", children: ["$", session.amount.toFixed(2)] })] })] }), _jsxs("div", { className: "space-y-3 mb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Assigned BOH Staff:" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm text-white", children: session.assignedBOHStaff || 'staff_001' }), _jsx(Button, { size: "sm", variant: "outline", className: "text-xs", children: "Assign BOH" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Session Notes:" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-300", children: session.sessionNotes || 'Source: undefined, External Ref: undefined' }), _jsx(Button, { size: "sm", variant: "ghost", className: "text-xs text-blue-400", children: "Add Note" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Created:" }), _jsx("span", { className: "text-sm text-zinc-300", children: session.createdAt ? formatRelativeTime(session.createdAt) : 'Invalid Date' })] }), session.coalStatus && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Coal Status:" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-lg", children: getCoalStatusIcon(session.coalStatus) }), _jsx("span", { className: cn('text-sm font-medium', getCoalStatusColor(session.coalStatus)), children: session.coalStatus.replace('_', ' ').toUpperCase() })] })] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { size: "sm", variant: "success", leftIcon: _jsx(RefreshCw, { className: "w-4 h-4" }), onClick: () => onAction?.('restart_prep', session.id), children: "Restart Prep" }), _jsx(Button, { size: "sm", variant: "info", leftIcon: _jsx(UserCheck, { className: "w-4 h-4" }), onClick: () => onAction?.('resolve_issue', session.id), children: "Resolve Issue" }), _jsx(Button, { size: "sm", variant: "danger", leftIcon: _jsx(Flag, { className: "w-4 h-4" }), onClick: () => onAction?.('flag_manager', session.id), children: "Flag Manager" }), _jsx(Button, { size: "sm", variant: "warning", leftIcon: _jsx(Pause, { className: "w-4 h-4" }), onClick: () => onAction?.('hold_session', session.id), children: "Hold Session" }), _jsx(Button, { size: "sm", variant: "accent", leftIcon: _jsx(Zap, { className: "w-4 h-4" }), onClick: () => onAction?.('request_refill', session.id), children: "Request Refill" })] })] }));
};
export default SessionCard;
