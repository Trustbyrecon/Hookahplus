import React from 'react';

// Moodbook classes are required; avoid overriding with default Tailwind colors.
const FlavorSelector = ({ flavors, onSelect }) => (
  <div className="rounded bg-charcoal p-4 text-goldLumen font-sans">
    <h2 className="font-display">Select Your Flavor</h2>
    <ul>
      {flavors.map((flavor, index) => (
        <li key={index} onClick={() => onSelect(flavor)}>
          {flavor}
        </li>
      ))}
    </ul>
  </div>
);

export default FlavorSelector;
