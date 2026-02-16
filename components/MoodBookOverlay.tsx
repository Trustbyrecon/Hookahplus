'use client';

import React, { useState } from 'react';
import { moodBookThemes, applyMoodBook } from '../codex/Modules/moodbook_sora_overlay_v1';

export default function MoodBookOverlay() {
  const [theme, setTheme] = useState(moodBookThemes[0].name);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    applyMoodBook(newTheme);
  };

  return (
    <div className="p-4 bg-charcoal rounded text-goldLumen mb-6">
      <label className="block mb-2 font-semibold">MoodBook Theme</label>
      <select
        value={theme}
        onChange={handleChange}
        className="bg-charcoal border border-ember rounded p-2"
      >
        {moodBookThemes.map((t) => (
          <option key={t.name} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
