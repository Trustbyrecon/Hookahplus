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
 codex/update-component-styles-to-moodbook-palette
    <span className="inline-flex items-center px-2 py-1 bg-charcoal rounded text-sm mr-1" title={flavor}>

 codex/add-moodbook-classes-to-reusable-components
    <span
      className="inline-flex items-center rounded bg-deepMoss px-2 py-1 text-goldLumen text-sm mr-1"
      title={flavor}
    >

 codex/add-moodbook-fonts-to-components
    <span
      className="font-sans inline-flex items-center px-2 py-1 bg-gray-800 rounded text-sm mr-1"
      title={flavor}
    >

    <span className="inline-flex items-center px-2 py-1 bg-charcoal rounded text-sm mr-1" title={flavor}>
 main
 main
 main
      <span className="mr-1">{flavorEmoji[flavor] || '🍓'}</span>
      {flavor}
    </span>
  );
}
