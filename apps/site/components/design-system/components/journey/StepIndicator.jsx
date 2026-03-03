import React from 'react';
import { cn } from '../../utils/cn';
import { Check, Circle } from 'lucide-react';
const StepIndicator = ({ steps, orientation = 'horizontal', className }) => {
    const getStepIcon = (status) => {
        switch (status) {
            case 'completed':
                return <Check className="w-5 h-5 text-white"/>;
            case 'current':
                return <Circle className="w-5 h-5 text-teal-400 fill-current"/>;
            default:
                return <Circle className="w-5 h-5 text-zinc-600"/>;
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
    return (<div className={cn('flex', orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col space-y-4', className)}>
      {steps.map((step, index) => (<div key={step.id} className={cn('flex items-center', orientation === 'horizontal' && index < steps.length - 1 && 'mr-8')}>
          {/* Step Circle */}
          <div className={cn('flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200', getStepStyles(step.status))}>
            {getStepIcon(step.status)}
          </div>

          {/* Step Content */}
          <div className={cn('ml-3', orientation === 'vertical' && 'flex-1')}>
            <h3 className={cn('text-sm font-medium', step.status === 'completed' ? 'text-white' :
                step.status === 'current' ? 'text-teal-400' : 'text-zinc-400')}>
              {step.title}
            </h3>
            {step.description && (<p className="text-xs text-zinc-500 mt-1">
                {step.description}
              </p>)}
          </div>

          {/* Connector Line */}
          {orientation === 'horizontal' && index < steps.length - 1 && (<div className="flex-1 h-0.5 bg-zinc-700 mx-4"/>)}
        </div>))}
    </div>);
};
export default StepIndicator;
