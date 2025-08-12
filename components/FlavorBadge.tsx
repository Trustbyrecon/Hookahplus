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

// Moodbook classes are required; avoid overriding with default Tailwind colors.
export default function FlavorBadge({ flavor }: Props) {
  return (
    <span
      className="inline-flex items-center rounded bg-deepMoss px-2 py-1 text-goldLumen text-sm mr-1 font-sans"
      title={flavor}
    >
      <span className="mr-1">{flavorEmoji[flavor] || '🍓'}</span>
      {flavor}
    </span>
  );
}
