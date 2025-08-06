'use client';

import { useState } from 'react';

export default function PartnerWaitlistForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/partner-waitlist', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      setStatus('success');
      setMessage(
        'Thanks for joining the waitlist! Your config file has been generated.'
      );
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <p className="mt-4 font-sans text-mystic">
        {message}
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
      <input type="file" name="photo" accept="image/*" className="w-full" required />
      <div className="text-sm">Pricing YAML</div>
      <input type="file" name="pricing" accept=".yml,.yaml" className="w-full" required />
      {status === 'error' && (
        <p className="text-red-600 text-sm">{message}</p>
      )}
      <button
        type="submit"
        className="bg-ember text-goldLumen px-4 py-2 rounded w-full"
      >
        Join Waitlist
      </button>
    </form>
  );
}
