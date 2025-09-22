import React from 'react';
import { cn } from '../../utils/cn';
const FlowProgress = ({ currentStep, totalSteps, progress, showPercentage = true, size = 'md', variant = 'default', className }) => {
    const calculatedProgress = progress !== undefined
        ? progress
        : (currentStep / totalSteps) * 100;
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };
    const variantClasses = {
        default: 'bg-teal-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500'
    };
    return (<div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-300">
          Step {currentStep} of {totalSteps}
        </span>
        {showPercentage && (<span className="text-sm text-zinc-400">
            {Math.round(calculatedProgress)}%
          </span>)}
      </div>
      
      <div className={cn('w-full bg-zinc-800 rounded-full overflow-hidden', sizeClasses[size])}>
        <div className={cn('h-full rounded-full transition-all duration-500 ease-out', variantClasses[variant])} style={{ width: `${calculatedProgress}%` }}/>
      </div>
    </div>);
};
export default FlowProgress;
