import React from 'react';

const DynamicPricing = ({ basePrice, addOns }) => {
  const total = basePrice + addOns.reduce((sum, item) => sum + item.price, 0);
  return (
    <div className="font-sans">
      <h2 className="font-display">Session Price: ${total}</h2>
      <ul>
        {addOns.map((item, index) => (
          <li key={index}>{item.name}: ${item.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default DynamicPricing;
