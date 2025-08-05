'use client';

import { useState } from 'react';

interface Props {
  prompt?: string;
}

export default function ReflexPromptModal({ prompt = 'Ready to elevate loyalty?' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-6 px-4 py-2 bg-ember text-charcoal rounded font-sans"
      >
        {prompt}
      </button>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-charcoal/80">
          <div className="bg-deepMoss text-goldLumen p-6 rounded shadow-lg font-sans">
            <p>Loyalty layer engaged.</p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 px-4 py-2 bg-ember text-charcoal rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
