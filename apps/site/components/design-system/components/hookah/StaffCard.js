import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/format';
import Badge from '../Badge';
import Card from '../Card';
import Button from '../Button';
import { User, CheckCircle, AlertCircle, Pause, Activity, Star } from 'lucide-react';
const StaffCard = ({ staff, onAction, className }) => {
    const getRoleColor = (role) => {
        switch (role) {
            case 'manager': return 'bg-purple-600';
            case 'foh': return 'bg-blue-600';
            case 'boh': return 'bg-green-600';
            case 'host': return 'bg-yellow-600';
            case 'admin': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };
    const getRoleIcon = (role) => {
        switch (role) {
            case 'manager': return '👑';
            case 'foh': return '👥';
            case 'boh': return '👨‍🍳';
            case 'host': return '🎯';
            case 'admin': return '⚙️';
            default: return '👤';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-600';
            case 'break': return 'bg-yellow-600';
            case 'off': return 'bg-gray-600';
            case 'busy': return 'bg-orange-600';
            default: return 'bg-gray-600';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'break': return _jsx(Pause, { className: "w-4 h-4" });
            case 'off': return _jsx(AlertCircle, { className: "w-4 h-4" });
            case 'busy': return _jsx(Activity, { className: "w-4 h-4" });
            default: return _jsx(User, { className: "w-4 h-4" });
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'ACTIVE';
            case 'break': return 'BREAK';
            case 'off': return 'OFF';
            case 'busy': return 'BUSY';
            default: return 'UNKNOWN';
        }
    };
    const getPerformanceColor = (rating) => {
        if (rating >= 4.5)
            return 'text-green-400';
        if (rating >= 3.5)
            return 'text-yellow-400';
        return 'text-red-400';
    };
    return (_jsxs(Card, { className: cn('hover:shadow-lg transition-all duration-200', className), children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center", children: staff.avatar ? (_jsx("img", { src: staff.avatar, alt: staff.name, className: "w-12 h-12 rounded-full object-cover" })) : (_jsx("span", { className: "text-2xl", children: getRoleIcon(staff.role) })) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: staff.name }), _jsxs("p", { className: "text-sm text-zinc-400", children: [staff.role.toUpperCase(), " \u2022 ", formatRelativeTime(staff.lastActive)] })] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Badge, { variant: "default", className: cn('text-xs', getStatusColor(staff.status)), children: [getStatusIcon(staff.status), _jsx("span", { className: "ml-1", children: getStatusText(staff.status) })] }) })] }), _jsxs("div", { className: "space-y-3 mb-4", children: [staff.assignedTables && staff.assignedTables.length > 0 && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Assigned Tables:" }), _jsx("div", { className: "flex items-center space-x-1", children: staff.assignedTables.map((tableId, index) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: tableId }, index))) })] })), staff.performance && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Performance:" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Star, { className: cn('w-4 h-4', getPerformanceColor(staff.performance.rating)) }), _jsx("span", { className: cn('text-sm font-medium', getPerformanceColor(staff.performance.rating)), children: staff.performance.rating.toFixed(1) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Orders Handled:" }), _jsx("span", { className: "text-sm text-white", children: staff.performance.ordersHandled })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Avg Session Time:" }), _jsxs("span", { className: "text-sm text-white", children: [staff.performance.avgSessionTime, "h"] })] })] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Last Active:" }), _jsx("span", { className: "text-sm text-white", children: formatRelativeTime(staff.lastActive) })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [staff.status === 'active' && (_jsx(Button, { size: "sm", variant: "warning", onClick: () => onAction?.('send_break', staff.id), children: "Send Break" })), staff.status === 'break' && (_jsx(Button, { size: "sm", variant: "success", onClick: () => onAction?.('end_break', staff.id), children: "End Break" })), staff.status === 'off' && (_jsx(Button, { size: "sm", variant: "primary", onClick: () => onAction?.('start_shift', staff.id), children: "Start Shift" })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => onAction?.('view_profile', staff.id), children: "View Profile" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => onAction?.('assign_tables', staff.id), children: "Assign Tables" })] })] }));
};
export default StaffCard;
