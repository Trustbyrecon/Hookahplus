import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../utils/cn';
import { Check, Circle } from 'lucide-react';
const StepIndicator = ({ steps, orientation = 'horizontal', className }) => {
    const getStepIcon = (status) => {
        switch (status) {
            case 'completed':
                return _jsx(Check, { className: "w-5 h-5 text-white" });
            case 'current':
                return _jsx(Circle, { className: "w-5 h-5 text-teal-400 fill-current" });
            default:
                return _jsx(Circle, { className: "w-5 h-5 text-zinc-600" });
        }
    };
    const getStepStyles = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-teal-500 text-white border-teal-500';
            case 'current':
                return 'bg-teal-500/20 text-teal-400 border-teal-500';
            default:
                return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        }
    };
    return (_jsx("div", { className: cn('flex', orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col space-y-4', className), children: steps.map((step, index) => (_jsxs("div", { className: cn('flex items-center', orientation === 'horizontal' && index < steps.length - 1 && 'mr-8'), children: [_jsx("div", { className: cn('flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200', getStepStyles(step.status)), children: getStepIcon(step.status) }), _jsxs("div", { className: cn('ml-3', orientation === 'vertical' && 'flex-1'), children: [_jsx("h3", { className: cn('text-sm font-medium', step.status === 'completed' ? 'text-white' :
                                step.status === 'current' ? 'text-teal-400' : 'text-zinc-400'), children: step.title }), step.description && (_jsx("p", { className: "text-xs text-zinc-500 mt-1", children: step.description }))] }), orientation === 'horizontal' && index < steps.length - 1 && (_jsx("div", { className: "flex-1 h-0.5 bg-zinc-700 mx-4" }))] }, step.id))) }));
};
export default StepIndicator;
