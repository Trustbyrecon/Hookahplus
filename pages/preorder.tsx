import React, { useState } from 'react';
import PreorderEntry from '../components/PreorderEntry';
import FlavorSelector from '../components/FlavorSelector';
import SessionConfirmation from '../components/SessionConfirmation';
import LoyaltyBadge from '../components/LoyaltyBadge';

export default function PreorderPage() {
  const [flavor, setFlavor] = useState('Mint');
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className="p-4">
      <PreorderEntry />
      <FlavorSelector value={flavor} onChange={setFlavor} />
      <button className="mt-4 px-4 py-2 bg-ember text-goldLumen" onClick={() => setConfirmed(true)}>
        Checkout
      </button>
      {confirmed && <SessionConfirmation flavor={flavor} />}
      <LoyaltyBadge />
    </main>
  );
}
