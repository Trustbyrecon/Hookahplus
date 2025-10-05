'use client';

import TimerController from '../../components/TimerController';
import FlavorSelector from '../../components/FlavorSelector';
import SessionNotes from '../../components/SessionNotes';
import { useSession } from '../../components/SessionContext';

export default function Home() {
  const { session, setSession } = useSession();

  const handleFlavorChange = (flavor: string) => {
    console.log('Flavor changed to:', flavor);
  };

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Hookah+ Dashboard</h1>

      <div className="max-w-md mx-auto bg-[#1f1f1f] rounded-2xl p-5 shadow-md border border-gray-700">
        <TimerController />
        <div className="text-2xl font-semibold mb-4">{session.flavor}</div>
        <FlavorSelector 
          session={session} 
          setSession={setSession} 
          onFlavorChange={handleFlavorChange}
        />
        <SessionNotes />
      </div>
    </main>
  );
}