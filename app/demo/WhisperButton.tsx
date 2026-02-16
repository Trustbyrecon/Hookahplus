'use client';

export default function WhisperButton() {
  return (
    <button
      onClick={() => {
        // Trigger future Aliethia whisper interface here
        alert('Aliethia Whisper Preview Activated 🎙️');
      }}
      className="mt-4 text-ember hover:underline font-sans"
    >
      Play Whisper →
    </button>
  );
}
