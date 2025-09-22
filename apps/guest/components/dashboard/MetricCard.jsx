import React from 'react';
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
    return (<Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={color}>
            {icon}
          </div>
        </div>
        {change && (<div className={`text-sm font-medium ${getChangeColor(changeType)}`}>
            <span className="mr-1">{getChangeIcon(changeType)}</span>
            {change}
          </div>)}
      </div>
      
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-zinc-400">{title}</div>
      </div>
    </Card>);
};
export default MetricCard;
