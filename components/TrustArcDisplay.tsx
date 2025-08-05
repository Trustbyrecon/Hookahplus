'use client';

interface Props {
  score?: number;
}

export default function TrustArcDisplay({ score = 0 }: Props) {
  return (
    <div className="fixed top-4 right-4 bg-deepMoss text-goldLumen px-4 py-2 rounded shadow font-sans">
      Trust: {score.toFixed(1)}
    </div>
  );
}
