
import React from 'react';

export default function SelectTable({ onSelect }: { onSelect: (table: string) => void }) {
  const tables = ["T1", "T2", "T3", "VIP-1"];
  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-2">Select Table</h2>
      <select onChange={(e) => onSelect(e.target.value)} className="w-full p-2 rounded bg-gray-800">
        <option value="">-- Choose a table --</option>
        {tables.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
}
