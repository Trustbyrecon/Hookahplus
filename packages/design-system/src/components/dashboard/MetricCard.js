import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
import Card from '../Card';
const MetricCard = ({ title, value, icon, color = 'text-zinc-400', bgColor = 'bg-zinc-800', change, changeType = 'neutral', className }) => {
    const getChangeColor = (type) => {
        switch (type) {
            case 'positive': return 'text-green-400';
            case 'negative': return 'text-red-400';
            case 'neutral': return 'text-zinc-400';
            default: return 'text-zinc-400';
        }
    };
    const getChangeIcon = (type) => {
        switch (type) {
            case 'positive': return '↗';
            case 'negative': return '↘';
            case 'neutral': return '→';
            default: return '→';
        }
    };
    return (_jsxs(Card, { className: cn('p-6', className), children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: `p-3 rounded-lg ${bgColor}`, children: _jsx("div", { className: color, children: icon }) }), change && (_jsxs("div", { className: `text-sm font-medium ${getChangeColor(changeType)}`, children: [_jsx("span", { className: "mr-1", children: getChangeIcon(changeType) }), change] }))] }), _jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-white mb-1", children: value }), _jsx("div", { className: "text-sm text-zinc-400", children: title })] })] }));
};
export default MetricCard;
