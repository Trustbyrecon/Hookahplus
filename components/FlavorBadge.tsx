import React from 'react';

interface Props {
  flavor: string; // e.g., "Mint" or "Lemon"
}

// Maps flavors to emoji for quick visual recognition
const flavorEmoji: Record<string, string> = {
  Mint: '🌿',
  Lemon: '🍋',
  Watermelon: '🍉',
  Grape: '🍇',
};

export default function FlavorBadge({ flavor }: Props) {
  return (
 codex/add-moodbook-fonts-to-components
    <span
      className="font-sans inline-flex items-center px-2 py-1 bg-gray-800 rounded text-sm mr-1"
      title={flavor}
    >

    <span className="inline-flex items-center px-2 py-1 bg-charcoal rounded text-sm mr-1" title={flavor}>
 main
      <span className="mr-1">{flavorEmoji[flavor] || '🍓'}</span>
      {flavor}
    </span>
  );
}
