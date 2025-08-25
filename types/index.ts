export type RaceKey = 'human' | 'sliver' | 'alien';

export type RaceConfig = {
  key: RaceKey;
  name: string;
  displayName: string;
  theme: 'technology' | 'biological' | 'energy';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    glow: string;
  };
  description: string;
};

export const RACE_CONFIGS: Record<RaceKey, RaceConfig> = {
  human: {
    key: 'human',
    name: 'human',
    displayName: 'Human',
    theme: 'technology',
    colors: {
      primary: '#4a9eff',
      secondary: '#2d5aa0',
      accent: '#87ceeb', 
      background: 'from-blue-900 via-slate-900 to-gray-900',
      glow: '#4a9eff40'
    },
    description: 'Masters of technology and warfare. Deploy bunkers, missiles, and automated defenses.'
  },
  sliver: {
    key: 'sliver',
    name: 'sliver',
    displayName: 'Sliver',
    theme: 'biological',
    colors: {
      primary: '#b455ff',
      secondary: '#7a3db3',
      accent: '#da70d6',
      background: 'from-purple-900 via-slate-900 to-gray-900',
      glow: '#b455ff40'
    },
    description: 'Biological swarm creatures. Use living towers that grow and evolve over time.'
  },
  alien: {
    key: 'alien',
    name: 'alien',
    displayName: 'Alien',
    theme: 'energy',
    colors: {
      primary: '#ffaa00',
      secondary: '#cc7700',
      accent: '#ffd700',
      background: 'from-yellow-900 via-slate-900 to-gray-900',
      glow: '#ffaa0040'
    },
    description: 'Advanced psionic beings. Harness energy shields and devastating plasma weapons.'
  }
};
