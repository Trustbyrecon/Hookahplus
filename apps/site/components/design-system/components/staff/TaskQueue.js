import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
import Card from '../Card';
import { Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
const TaskQueue = ({ tasks, onTaskUpdate, onTaskAssign, className }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return _jsx(CheckCircle, { className: "w-5 h-5 text-green-400" });
            case 'in_progress': return _jsx(Clock, { className: "w-5 h-5 text-blue-400 animate-pulse" });
            case 'cancelled': return _jsx(XCircle, { className: "w-5 h-5 text-red-400" });
            default: return _jsx(AlertCircle, { className: "w-5 h-5 text-yellow-400" });
        }
    };
    const getTypeIcon = (type) => {
        switch (type) {
            case 'refill': return '🔄';
            case 'cleanup': return '🧹';
            case 'setup': return '⚙️';
            case 'payment': return '💳';
            case 'service': return '🛠️';
            default: return '📋';
        }
    };
    const formatTime = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };
    const getTimeRemaining = (dueAt) => {
        if (!dueAt)
            return null;
        const now = new Date();
        const diff = dueAt.getTime() - now.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        if (minutes < 0)
            return 'Overdue';
        if (minutes < 60)
            return `${minutes}m left`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m left`;
    };
    const sortedTasks = [...tasks].sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const statusOrder = { pending: 4, in_progress: 3, completed: 2, cancelled: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return statusOrder[b.status] - statusOrder[a.status];
    });
    return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-xl font-semibold text-white", children: "Task Queue" }), _jsxs("div", { className: "flex items-center space-x-4 text-sm text-zinc-400", children: [_jsxs("span", { children: ["Total: ", tasks.length] }), _jsxs("span", { children: ["Pending: ", tasks.filter(t => t.status === 'pending').length] }), _jsxs("span", { children: ["In Progress: ", tasks.filter(t => t.status === 'in_progress').length] })] })] }), _jsx("div", { className: "space-y-3", children: sortedTasks.map(task => (_jsxs(Card, { className: cn('transition-all duration-200 hover:shadow-lg', task.status === 'completed' ? 'opacity-75' : '', task.priority === 'urgent' ? 'border-red-500/50' : ''), children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-2xl", children: getTypeIcon(task.type) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white", children: task.title }), _jsx("p", { className: "text-sm text-zinc-400", children: task.description })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [getStatusIcon(task.status), _jsx("span", { className: cn('px-2 py-1 rounded-full text-xs font-medium border', getPriorityColor(task.priority)), children: task.priority })] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-zinc-400 mb-3", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [task.customerName && (_jsxs("div", { className: "flex items-center space-x-1", children: [_jsx(User, { className: "w-4 h-4" }), _jsx("span", { children: task.customerName })] })), task.tableNumber && (_jsxs("span", { children: ["Table ", task.tableNumber] })), _jsxs("span", { children: ["Created: ", formatTime(task.createdAt)] })] }), task.dueAt && (_jsx("span", { className: cn('font-medium', getTimeRemaining(task.dueAt) === 'Overdue' ? 'text-red-400' : 'text-zinc-400'), children: getTimeRemaining(task.dueAt) }))] }), task.status === 'pending' && (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => onTaskUpdate(task.id, { status: 'in_progress' }), className: "px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors", children: "Start" }), _jsx("button", { onClick: () => onTaskUpdate(task.id, { status: 'completed' }), className: "px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors", children: "Complete" }), _jsx("button", { onClick: () => onTaskUpdate(task.id, { status: 'cancelled' }), className: "px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors", children: "Cancel" })] })), task.status === 'in_progress' && (_jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => onTaskUpdate(task.id, { status: 'completed' }), className: "px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors", children: "Complete" }), _jsx("button", { onClick: () => onTaskUpdate(task.id, { status: 'pending' }), className: "px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors", children: "Pause" })] }))] }, task.id))) }), tasks.length === 0 && (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-zinc-400", children: "No tasks in queue" }) }))] }));
};
export default TaskQueue;
