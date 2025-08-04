import React from 'react';

const FlavorSelector = ({ flavors, onSelect }) => (
  <div className="font-sans">
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
