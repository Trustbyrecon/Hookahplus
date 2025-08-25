import React from "react";
import Link from "next/link";

interface ReflexCardProps {
  title: string;
  description: string;
  status: 'seed' | 'activate' | 'reflect' | 'trust-lock' | 'bloomed';
  sprint?: string;
  href?: string;
}

const ReflexCard: React.FC<ReflexCardProps> = ({
  title,
  description,
  status,
  sprint,
  href
}) => {
  const getStatusColor = (status: ReflexCardProps['status']) => {
    switch (status) {
      case 'seed': return 'bg-zinc-100 border-zinc-300 text-zinc-800';
      case 'activate': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'reflect': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'trust-lock': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'bloomed': return 'bg-emerald-100 border-emerald-300 text-emerald-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: ReflexCardProps['status']) => {
    switch (status) {
      case 'seed': return '🌱';
      case 'activate': return '⚡';
      case 'reflect': return '🔍';
      case 'trust-lock': return '🔒';
      case 'bloomed': return '🌸';
      default: return '📋';
    }
  };

  const CardContent = () => (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor(status)} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-2xl">{getStatusIcon(status)}</span>
      </div>
      <p className="text-sm mb-3">{description}</p>
      {sprint && (
        <div className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded">
          Sprint: {sprint}
        </div>
      )}
      <div className="mt-3 text-xs font-medium uppercase tracking-wide">
        Status: {status.replace('-', ' ')}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default ReflexCard;
