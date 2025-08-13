'use client';

export default function PublicTrustArcs() {
  const arcs = [
    { d: 'M10,90 Q60,10 110,90', color: '#8E79B9' }, // mystic
    { d: 'M110,90 Q160,10 210,90', color: '#D35930' }, // ember
  ];

  return (
    <div className="mt-6">
      <h3 className="font-display text-xl text-goldLumen mb-2">Public Trust Arcs</h3>
      <svg viewBox="0 0 220 100" className="w-full h-40">
        {arcs.map((arc, idx) => (
          <path key={idx} d={arc.d} stroke={arc.color} strokeWidth={3} fill="none" />
        ))}
      </svg>
      <p className="text-sm text-goldLumen/80 text-center">Lounge Pilot #001</p>
    </div>
  );
}
