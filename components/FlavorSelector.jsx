import React from 'react';

const FlavorSelector = ({ flavors, onSelect }) => (
  <div>
    <h2>Select Your Flavor</h2>
    <ul>
      {flavors.map((flavor, index) => (
        <li key={index} onClick={() => onSelect(flavor)}>{flavor}</li>
      ))}
    </ul>
  </div>
);

export default FlavorSelector;
