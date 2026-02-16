export interface MoodBookTheme {
  name: string;
  tone: string;
  palette: string[];
  animation: string;
  soundscape: string;
}

export const moodBookThemes: MoodBookTheme[] = [
  {
    name: 'Glow',
    tone: 'uplifting',
    palette: ['#FFD36E', '#FF7F50', '#FCE38A'],
    animation: 'pulsingLight',
    soundscape: 'softBassWaves',
  },
  {
    name: 'Stillness',
    tone: 'calm, reflective',
    palette: ['#B0E0E6', '#FFFFFF', '#D3D3D3'],
    animation: 'slowFade',
    soundscape: 'rainChimes',
  },
  {
    name: 'Midnight Ember',
    tone: 'moody, luxurious',
    palette: ['#1A1A2E', '#C06C84', '#355C7D'],
    animation: 'embersGlow',
    soundscape: 'deepAmbient',
  },
  {
    name: 'Alive',
    tone: 'energetic, confident',
    palette: ['#7EFFC1', '#FF6B6B', '#FFFA65'],
    animation: 'sparkleBounce',
    soundscape: 'futureFunkLoop',
  },
];

export function applyMoodBook(themeName: string) {
  const theme = moodBookThemes.find((t) => t.name === themeName);
  if (!theme) return;
  const root = document.documentElement;
  theme.palette.forEach((color, idx) => {
    root.style.setProperty(`--mood-color-${idx + 1}`, color);
  });
  root.dataset.moodTone = theme.tone;
  console.log(`MoodBook theme applied: ${theme.name}`);
}
