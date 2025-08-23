// components/WhisperOverlay.jsx
import React from 'react';

export default function WhisperOverlay({ message }) {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 bg-purple-800 text-white p-4 rounded-xl shadow-lg z-50 animate-pulse">
      {message}
    </div>
  );
}
