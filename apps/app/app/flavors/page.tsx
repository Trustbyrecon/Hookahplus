import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import SelectorAphrodite from './SelectorAphrodite';
import FlavorLeaderboard from '../../components/FlavorLeaderboard';
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../../components/ReflexOverlay';

export default function FlavorsPage() {
  const filePath = path.join(process.cwd(), 'data', 'flavor_profiles.yaml');
  let flavors: { name: string; notes: string }[] = [];
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    flavors = yaml.load(fileContents) as { name: string; notes: string }[];
  } catch (err) {
    console.error('Failed to load flavor profiles:', err);
  }

  const leaderboardPath = path.join(
    process.cwd(),
    'data',
    'flavor_leaderboard.yaml'
  );
  let leaderboard: {
    name: string;
    sales: number;
    loyalty: number;
    burnout: number;
  }[] = [];
  try {
    const leaderboardContents = fs.readFileSync(leaderboardPath, 'utf8');
    leaderboard = yaml.load(leaderboardContents) as {
      name: string;
      sales: number;
      loyalty: number;
      burnout: number;
    }[];
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  }

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-display font-bold">Flavor Selector</h1>
      <div className="mt-2 mb-4 p-4 bg-deepMoss text-goldLumen rounded">
        Buy 3, Earn 1 Premium Flavor
      </div>
      <SelectorAphrodite flavors={flavors} />
      <h2 className="mt-8 text-xl font-display font-bold">Top Flavors</h2>
      <FlavorLeaderboard flavors={leaderboard} />
      <div className="mt-8 space-y-4">
        <WhisperTrigger />
        <ReflexPromptModal />
      </div>
      <TrustArcDisplay score={8.5} />
      <MemoryPulseTracker />
    </div>
  );
}
