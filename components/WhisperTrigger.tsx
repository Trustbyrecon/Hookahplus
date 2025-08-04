'use client';

export default function WhisperTrigger() {
  return (
    <button
      onClick={() => {
        alert('Alie intro whisper pending.');
      }}
      className="mt-8 px-6 py-3 bg-mystic text-charcoal rounded-full animate-pulse hover:animate-none transition transform hover:scale-105"
    >
      Play Alie’s Intro
    </button>
  );
}
