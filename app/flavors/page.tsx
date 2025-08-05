import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import SelectorAphrodite from './SelectorAphrodite';
import {
  WhisperTrigger,
  TrustArcDisplay,
  ReflexPromptModal,
  MemoryPulseTracker,
} from '../../components/ReflexOverlay';

export default function FlavorsPage() {
  const filePath = path.join(process.cwd(), 'data', 'flavor_profiles.yaml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const flavors = yaml.load(fileContents) as { name: string; notes: string }[];

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-display font-bold">Flavor Selector</h1>
      <SelectorAphrodite flavors={flavors} />
      <div className="mt-8 space-y-4">
        <WhisperTrigger />
        <ReflexPromptModal />
      </div>
      <TrustArcDisplay score={8.5} />
      <MemoryPulseTracker />
    </div>
  );
}
