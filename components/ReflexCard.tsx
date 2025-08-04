import React from 'react';

interface ReflexCardProps {
  title: string;
  description: string;
  cta: string;
}

export const ReflexCard: React.FC<ReflexCardProps> = ({ title, description, cta }) => {
  return (
    <div className="bg-charcoal text-goldLumen rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
      <div className="text-mystic mb-2">{/* Icon placeholder */}</div>
      <h2 className="font-display text-xl mb-2">{title}</h2>
      <p className="font-sans text-base">{description}</p>
      <button className="bg-ember hover:bg-mystic text-white mt-4 px-4 py-2 rounded">{cta}</button>
    </div>
  );
};

export default ReflexCard;
