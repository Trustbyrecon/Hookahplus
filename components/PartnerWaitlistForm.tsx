'use client';

import { useState } from 'react';

export default function PartnerWaitlistForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch('/api/partner-waitlist', {
      method: 'POST',
      body: formData,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="mt-4 font-sans text-mystic">
        Thanks for joining the waitlist! Your config file has been generated.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4 text-charcoal bg-goldLumen p-4 rounded"
    >
      <input
        name="name"
        placeholder="Name"
        className="w-full p-2 border"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full p-2 border"
        required
      />
      <input
        name="city"
        placeholder="City"
        className="w-full p-2 border"
        required
      />
      <select name="pos" className="w-full p-2 border" required>
        <option value="">POS System</option>
        <option value="Square">Square</option>
        <option value="Clover">Clover</option>
        <option value="Toast">Toast</option>
      </select>
      <div className="text-sm">Seating Photo</div>
      <input type="file" name="photo" accept="image/*" className="w-full" />
      <div className="text-sm">Pricing YAML</div>
      <input type="file" name="pricing" accept=".yml,.yaml" className="w-full" />
      <button
        type="submit"
        className="bg-ember text-goldLumen px-4 py-2 rounded w-full"
      >
        Join Waitlist
      </button>
    </form>
  );
}
