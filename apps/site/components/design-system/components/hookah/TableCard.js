import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
import Badge from '../Badge';
import Card from '../Card';
import Button from '../Button';
import { Table, Users, Clock, CheckCircle, AlertCircle, Pause } from 'lucide-react';
const TableCard = ({ table, onAction, className }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-600';
            case 'occupied': return 'bg-red-600';
            case 'reserved': return 'bg-yellow-600';
            case 'cleaning': return 'bg-blue-600';
            case 'maintenance': return 'bg-gray-600';
            default: return 'bg-gray-600';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'available': return _jsx(CheckCircle, { className: "w-4 h-4" });
            case 'occupied': return _jsx(Users, { className: "w-4 h-4" });
            case 'reserved': return _jsx(Clock, { className: "w-4 h-4" });
            case 'cleaning': return _jsx(Pause, { className: "w-4 h-4" });
            case 'maintenance': return _jsx(AlertCircle, { className: "w-4 h-4" });
            default: return _jsx(Table, { className: "w-4 h-4" });
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'available': return 'AVAILABLE';
            case 'occupied': return 'OCCUPIED';
            case 'reserved': return 'RESERVED';
            case 'cleaning': return 'CLEANING';
            case 'maintenance': return 'MAINTENANCE';
            default: return 'UNKNOWN';
        }
    };
    const getTableTypeIcon = (type) => {
        switch (type) {
            case 'high_boy': return '🪑';
            case 'table': return '🪑';
            case '2x_booth': return '🛋️';
            case '4x_booth': return '🛋️';
            case '8x_sectional': return '🛋️';
            case '4x_sofa': return '🛋️';
            default: return '🪑';
        }
    };
    return (_jsxs(Card, { className: cn('hover:shadow-lg transition-all duration-200', className), children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "text-2xl", children: getTableTypeIcon(table.tableType) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-white", children: table.name }), _jsxs("p", { className: "text-sm text-zinc-400", children: [table.capacity, " people \u2022 ", table.zone || 'Main Area'] })] })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs(Badge, { variant: "default", className: cn('text-xs', getStatusColor(table.status)), children: [getStatusIcon(table.status), _jsx("span", { className: "ml-1", children: getStatusText(table.status) })] }) })] }), _jsxs("div", { className: "space-y-3 mb-4", children: [table.customerName && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Customer:" }), _jsx("span", { className: "text-sm text-white", children: table.customerName })] })), table.sessionId && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Session:" }), _jsx("span", { className: "text-sm text-white font-mono", children: table.sessionId })] })), table.estimatedWaitTime && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Wait Time:" }), _jsxs("span", { className: "text-sm text-white", children: [table.estimatedWaitTime, " min"] })] })), table.position && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-400", children: "Position:" }), _jsxs("span", { className: "text-sm text-white", children: ["(", table.position.x, ", ", table.position.y, ")"] })] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [table.status === 'available' && (_jsx(Button, { size: "sm", variant: "primary", onClick: () => onAction?.('fire_session', table.id), children: "Fire Session" })), table.status === 'occupied' && (_jsx(Button, { size: "sm", variant: "warning", onClick: () => onAction?.('hold_session', table.id), children: "Hold Session" })), table.status === 'reserved' && (_jsx(Button, { size: "sm", variant: "info", onClick: () => onAction?.('check_in', table.id), children: "Check In" })), table.status === 'cleaning' && (_jsx(Button, { size: "sm", variant: "success", onClick: () => onAction?.('mark_ready', table.id), children: "Mark Ready" })), _jsx(Button, { size: "sm", variant: "outline", onClick: () => onAction?.('view_details', table.id), children: "View Details" })] })] }));
};
export default TableCard;
