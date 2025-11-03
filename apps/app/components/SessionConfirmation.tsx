'use client';

import React from 'react';

interface Props {
  flavor: string;
}

export default function SessionConfirmation({ flavor }: Props) {
  return (
    <div className="mt-4 p-4 border border-ember text-goldLumen">
      <p>Session confirmed with {flavor} flavor.</p>
    </div>
  );
}
