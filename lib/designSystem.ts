// Hookah+ Design System - Born from AI Agent Collaboration & Human Inspiration
// This system creates a consistent semantic flow throughout the entire application

export interface DesignToken {
  name: string;
  value: string;
  description: string;
  usage: string[];
  aiInsight: string;
  humanInspiration: string;
}

export interface ColorPalette {
  primary: DesignToken[];
  secondary: DesignToken[];
  accent: DesignToken[];
  neutral: DesignToken[];
  semantic: DesignToken[];
}

export interface Typography {
  fonts: DesignToken[];
  sizes: DesignToken[];
  weights: DesignToken[];
  lineHeights: DesignToken[];
}

export interface Spacing {
  scale: DesignToken[];
  components: DesignToken[];
  layouts: DesignToken[];
}

export interface Components {
  buttons: DesignToken[];
  cards: DesignToken[];
  forms: DesignToken[];
  navigation: DesignToken[];
  feedback: DesignToken[];
}

export interface Layouts {
  grids: DesignToken[];
  containers: DesignToken[];
  sections: DesignToken[];
  spacing: DesignToken[];
}

export interface Animations {
  transitions: DesignToken[];
  transforms: DesignToken[];
  states: DesignToken[];
}

export interface SemanticFlow {
  workflows: DesignToken[];
  states: DesignToken[];
  transitions: DesignToken[];
  feedback: DesignToken[];
}

// AI Agent Collaboration - Color Palette
export const colorPalette: ColorPalette = {
  primary: [
    {
      name: 'teal-400',
      value: '#2dd4bf',
      description: 'Primary brand color - represents growth and freshness',
      usage: ['Brand elements', 'Primary actions', 'Success states'],
      aiInsight: 'AI Agent: Teal represents the fresh, organic nature of hookah and growth of business',
      humanInspiration: 'Lounge owners associate teal with premium, fresh experiences'
    },
    {
      name: 'emerald-500',
      value: '#10b981',
      description: 'Secondary primary - represents success and prosperity',
      usage: ['Secondary actions', 'Progress indicators', 'Positive feedback'],
      aiInsight: 'AI Agent: Emerald complements teal and represents financial success',
      humanInspiration: 'Success color that resonates with business owners'
    }
  ],
  secondary: [
    {
      name: 'purple-500',
      value: '#8b5cf6',
      description: 'Innovation and technology',
      usage: ['AI features', 'Innovation elements', 'Premium features'],
      aiInsight: 'AI Agent: Purple represents AI intelligence and premium system features',
      humanInspiration: 'Associated with luxury and advanced technology'
    },
    {
      name: 'pink-500',
      value: '#ec4899',
      description: 'Customer experience and engagement',
      usage: ['Customer features', 'Engagement elements', 'Social features'],
      aiInsight: 'AI Agent: Pink represents customer satisfaction and social engagement',
      humanInspiration: 'Warm, welcoming color for customer interactions'
    }
  ],
  accent: [
    {
      name: 'orange-500',
      value: '#f97316',
      description: 'Energy and urgency',
      usage: ['Warnings', 'High priority', 'Energy indicators'],
      aiInsight: 'AI Agent: Orange creates urgency and draws attention to important actions',
      humanInspiration: 'Associated with energy and excitement in lounge environments'
    },
    {
      name: 'yellow-500',
      value: '#eab308',
      description: 'Attention and highlights',
      usage: ['Important notices', 'Highlights', 'Attention grabbers'],
      aiInsight: 'AI Agent: Yellow highlights critical information and draws user focus',
      humanInspiration: 'Bright, noticeable color for important information'
    }
  ],
  neutral: [
    {
      name: 'zinc-950',
      value: '#09090b',
      description: 'Primary background - deep, professional',
      usage: ['Main backgrounds', 'Primary surfaces'],
      aiInsight: 'AI Agent: Deep neutral creates focus and reduces eye strain',
      humanInspiration: 'Professional, sophisticated background for business applications'
    },
    {
      name: 'zinc-800',
      value: '#27272a',
      description: 'Secondary background - elevated surfaces',
      usage: ['Cards', 'Secondary surfaces', 'Borders'],
      aiInsight: 'AI Agent: Lighter neutral creates visual hierarchy and depth',
      humanInspiration: 'Provides contrast while maintaining professional appearance'
    }
  ],
  semantic: [
    {
      name: 'red-500',
      value: '#ef4444',
      description: 'Errors and critical issues',
      usage: ['Error states', 'Critical alerts', 'Failures'],
      aiInsight: 'AI Agent: Red immediately signals problems requiring attention',
      humanInspiration: 'Universal color for errors and critical situations'
    },
    {
      name: 'green-500',
      value: '#22c55e',
      description: 'Success and completion',
      usage: ['Success states', 'Completed actions', 'Positive feedback'],
      aiInsight: 'AI Agent: Green confirms successful actions and positive outcomes',
      humanInspiration: 'Universal color for success and positive results'
    }
  ]
};

// AI Agent Collaboration - Typography System
export const typography: Typography = {
  fonts: [
    {
      name: 'Inter',
      value: 'Inter, system-ui, sans-serif',
      description: 'Primary font - modern, readable, professional',
      usage: ['Body text', 'UI elements', 'General content'],
      aiInsight: 'AI Agent: Inter provides excellent readability for business applications',
      humanInspiration: 'Clean, modern font that feels professional and trustworthy'
    }
  ],
  sizes: [
    {
      name: 'xs',
      value: '0.75rem',
      description: 'Extra small - for fine details and metadata',
      usage: ['Metadata', 'Fine details', 'Secondary information'],
      aiInsight: 'AI Agent: Small text for non-critical information that doesn\'t compete for attention',
      humanInspiration: 'Allows detailed information without overwhelming the user'
    },
    {
      name: 'sm',
      value: '0.875rem',
      description: 'Small - for secondary text and descriptions',
      usage: ['Descriptions', 'Secondary text', 'Captions'],
      aiInsight: 'AI Agent: Secondary text size that supports primary content',
      humanInspiration: 'Provides context without being too prominent'
    },
    {
      name: 'base',
      value: '1rem',
      description: 'Base - for primary body text',
      usage: ['Body text', 'Primary content', 'Main information'],
      aiInsight: 'AI Agent: Standard reading size for optimal comprehension',
      humanInspiration: 'Comfortable reading size for extended content'
    },
    {
      name: 'lg',
      value: '1.125rem',
      description: 'Large - for emphasized content',
      usage: ['Emphasized text', 'Important content', 'Section headers'],
      aiInsight: 'AI Agent: Larger text draws attention to important information',
      humanInspiration: 'Makes important content stand out'
    },
    {
      name: 'xl',
      value: '1.25rem',
      description: 'Extra large - for major headers',
      usage: ['Major headers', 'Page titles', 'Important sections'],
      aiInsight: 'AI Agent: Large text creates clear visual hierarchy',
      humanInspiration: 'Establishes clear content structure'
    }
  ],
  weights: [
    {
      name: 'normal',
      value: '400',
      description: 'Normal weight - for body text',
      usage: ['Body text', 'General content', 'Descriptions'],
      aiInsight: 'AI Agent: Normal weight provides optimal readability',
      humanInspiration: 'Standard weight that\'s easy to read'
    },
    {
      name: 'medium',
      value: '500',
      description: 'Medium weight - for emphasis',
      usage: ['Emphasized text', 'Important content', 'Labels'],
      aiInsight: 'AI Agent: Medium weight creates subtle emphasis without being too heavy',
      humanInspiration: 'Provides emphasis without being overwhelming'
    },
    {
      name: 'semibold',
      value: '600',
      description: 'Semibold - for strong emphasis',
      usage: ['Strong emphasis', 'Section headers', 'Important labels'],
      aiInsight: 'AI Agent: Semibold creates clear visual hierarchy',
      humanInspiration: 'Strong emphasis for important elements'
    },
    {
      name: 'bold',
      value: '700',
      description: 'Bold - for maximum emphasis',
      usage: ['Maximum emphasis', 'Primary headers', 'Critical information'],
      aiInsight: 'AI Agent: Bold text demands immediate attention',
      humanInspiration: 'Maximum impact for critical information'
    }
  ],
  lineHeights: [
    {
      name: 'tight',
      value: '1.25',
      description: 'Tight spacing - for headers and titles',
      usage: ['Headers', 'Titles', 'Short text'],
      aiInsight: 'AI Agent: Tight spacing creates compact, impactful headers',
      humanInspiration: 'Compact spacing for visual impact'
    },
    {
      name: 'normal',
      value: '1.5',
      description: 'Normal spacing - for body text',
      usage: ['Body text', 'General content', 'Readable text'],
      aiInsight: 'AI Agent: Normal spacing provides optimal readability',
      humanInspiration: 'Comfortable reading spacing'
    },
    {
      name: 'relaxed',
      value: '1.75',
      description: 'Relaxed spacing - for comfortable reading',
      usage: ['Long content', 'Comfortable reading', 'Spacious text'],
      aiInsight: 'AI Agent: Relaxed spacing improves readability for extended content',
      humanInspiration: 'More comfortable for longer reading sessions'
    }
  ]
};

// AI Agent Collaboration - Spacing System
export const spacing: Spacing = {
  scale: [
    {
      name: 'xs',
      value: '0.25rem',
      description: 'Extra small spacing - for tight elements',
      usage: ['Tight spacing', 'Compact layouts', 'Minimal gaps'],
      aiInsight: 'AI Agent: Minimal spacing for compact, efficient layouts',
      humanInspiration: 'Creates tight, organized appearance'
    },
    {
      name: 'sm',
      value: '0.5rem',
      description: 'Small spacing - for related elements',
      usage: ['Related elements', 'Small gaps', 'Minor separation'],
      aiInsight: 'AI Agent: Small spacing groups related elements together',
      humanInspiration: 'Subtle separation that maintains relationships'
    },
    {
      name: 'md',
      value: '1rem',
      description: 'Medium spacing - for standard separation',
      usage: ['Standard separation', 'Component spacing', 'General gaps'],
      aiInsight: 'AI Agent: Medium spacing provides comfortable visual breathing room',
      humanInspiration: 'Standard spacing that feels natural'
    },
    {
      name: 'lg',
      value: '1.5rem',
      description: 'Large spacing - for major separation',
      usage: ['Major separation', 'Section spacing', 'Significant gaps'],
      aiInsight: 'AI Agent: Large spacing creates clear section boundaries',
      humanInspiration: 'Clear separation between major sections'
    },
    {
      name: 'xl',
      value: '2rem',
      description: 'Extra large spacing - for page-level separation',
      usage: ['Page sections', 'Major divisions', 'Top-level spacing'],
      aiInsight: 'AI Agent: Extra large spacing creates clear page structure',
      humanInspiration: 'Establishes clear page organization'
    }
  ],
  components: [
    {
      name: 'button-padding',
      value: '0.75rem 1.5rem',
      description: 'Standard button padding for optimal clickability',
      usage: ['Primary buttons', 'Action buttons', 'Interactive elements'],
      aiInsight: 'AI Agent: Optimal padding for touch and click targets',
      humanInspiration: 'Comfortable button size for easy interaction'
    },
    {
      name: 'card-padding',
      value: '1.5rem',
      description: 'Standard card padding for content breathing room',
      usage: ['Cards', 'Content containers', 'Information boxes'],
      aiInsight: 'AI Agent: Adequate padding prevents content from feeling cramped',
      humanInspiration: 'Comfortable content spacing'
    }
  ],
  layouts: [
    {
      name: 'section-margin',
      value: '2rem',
      description: 'Standard margin between major sections',
      usage: ['Page sections', 'Major content blocks', 'Section separation'],
      aiInsight: 'AI Agent: Consistent section spacing creates clear page structure',
      humanInspiration: 'Clear visual separation between sections'
    },
    {
      name: 'container-padding',
      value: '1.5rem',
      description: 'Standard container padding for content margins',
      usage: ['Page containers', 'Content margins', 'Layout boundaries'],
      aiInsight: 'AI Agent: Container padding prevents content from touching edges',
      humanInspiration: 'Comfortable content margins'
    }
  ]
};

// AI Agent Collaboration - Component System
export const components: Components = {
  buttons: [
    {
      name: 'primary-button',
      value: 'bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg',
      description: 'Primary action button with teal branding',
      usage: ['Main actions', 'Primary CTAs', 'Important functions'],
      aiInsight: 'AI Agent: Teal branding creates strong visual hierarchy for primary actions',
      humanInspiration: 'Professional appearance that encourages action'
    },
    {
      name: 'secondary-button',
      value: 'bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200',
      description: 'Secondary action button with neutral styling',
      usage: ['Secondary actions', 'Supporting functions', 'Alternative options'],
      aiInsight: 'AI Agent: Neutral styling doesn\'t compete with primary actions',
      humanInspiration: 'Clear secondary option without confusion'
    }
  ],
  cards: [
    {
      name: 'primary-card',
      value: 'bg-zinc-900 rounded-xl border border-zinc-800 p-6 shadow-lg',
      description: 'Primary content card with dark theme',
      usage: ['Main content', 'Primary information', 'Key data'],
      aiInsight: 'AI Agent: Dark theme creates focus and reduces visual noise',
      humanInspiration: 'Professional appearance for business content'
    },
    {
      name: 'accent-card',
      value: 'bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-xl border border-teal-500/20 p-6',
      description: 'Accent card with teal gradient background',
      usage: ['Highlights', 'Important information', 'Featured content'],
      aiInsight: 'AI Agent: Gradient background draws attention to important content',
      humanInspiration: 'Visually appealing highlight for key information'
    }
  ],
  forms: [
    {
      name: 'input-field',
      value: 'bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200',
      description: 'Standard input field with focus states',
      usage: ['Text inputs', 'Form fields', 'Data entry'],
      aiInsight: 'AI Agent: Focus states provide clear user feedback',
      humanInspiration: 'Clear indication of active input field'
    }
  ],
  navigation: [
    {
      name: 'nav-item',
      value: 'text-zinc-400 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-lg transition-all duration-200',
      description: 'Navigation item with hover effects',
      usage: ['Navigation links', 'Menu items', 'Navigation elements'],
      aiInsight: 'AI Agent: Hover effects provide clear interactive feedback',
      humanInspiration: 'Clear indication of clickable elements'
    }
  ],
  feedback: [
    {
      name: 'success-message',
      value: 'bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg',
      description: 'Success message with green styling',
      usage: ['Success feedback', 'Positive results', 'Completed actions'],
      aiInsight: 'AI Agent: Green color universally represents success',
      humanInspiration: 'Clear positive feedback'
    }
  ]
};

// AI Agent Collaboration - Layout System
export const layouts: Layouts = {
  grids: [
    {
      name: 'responsive-grid',
      value: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      description: 'Responsive grid that adapts to screen size',
      usage: ['Content layouts', 'Card grids', 'Responsive designs'],
      aiInsight: 'AI Agent: Responsive design ensures optimal viewing on all devices',
      humanInspiration: 'Works well on all screen sizes'
    }
  ],
  containers: [
    {
      name: 'main-container',
      value: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      description: 'Main content container with responsive padding',
      usage: ['Page containers', 'Main content', 'Layout boundaries'],
      aiInsight: 'AI Agent: Responsive padding ensures content doesn\'t touch screen edges',
      humanInspiration: 'Comfortable content margins on all devices'
    }
  ],
  sections: [
    {
      name: 'section-spacing',
      value: 'py-8',
      description: 'Standard section padding for content separation',
      usage: ['Page sections', 'Content blocks', 'Section separation'],
      aiInsight: 'AI Agent: Consistent spacing creates clear visual hierarchy',
      humanInspiration: 'Clear separation between content sections'
    }
  ],
  spacing: [
    {
      name: 'component-gap',
      value: 'space-y-6',
      description: 'Standard gap between components',
      usage: ['Component spacing', 'Element separation', 'Content gaps'],
      aiInsight: 'AI Agent: Consistent spacing creates organized appearance',
      humanInspiration: 'Organized, clean layout'
    }
  ]
};

// AI Agent Collaboration - Animation System
export const animations: Animations = {
  transitions: [
    {
      name: 'smooth-transition',
      value: 'transition-all duration-200',
      description: 'Smooth transition for all properties',
      usage: ['Hover effects', 'State changes', 'Interactive elements'],
      aiInsight: 'AI Agent: Smooth transitions provide polished user experience',
      humanInspiration: 'Professional, smooth interactions'
    }
  ],
  transforms: [
    {
      name: 'hover-scale',
      value: 'hover:scale-105',
      description: 'Subtle scale on hover for interactive feedback',
      usage: ['Interactive elements', 'Hover effects', 'Button feedback'],
      aiInsight: 'AI Agent: Subtle scale provides clear interactive feedback',
      humanInspiration: 'Clear indication of interactive elements'
    }
  ],
  states: [
    {
      name: 'loading-state',
      value: 'animate-pulse',
      description: 'Pulsing animation for loading states',
      usage: ['Loading indicators', 'Processing states', 'Waiting feedback'],
      aiInsight: 'AI Agent: Pulsing animation indicates active processing',
      humanInspiration: 'Clear indication that system is working'
    }
  ]
};

// AI Agent Collaboration - Semantic Flow System
export const semanticFlow: SemanticFlow = {
  workflows: [
    {
      name: 'data-generation',
      value: 'data-generation',
      description: 'Workflow for generating demo data',
      usage: ['Dashboard setup', 'System initialization', 'Demo preparation'],
      aiInsight: 'AI Agent: Data generation is the first step in system demonstration',
      humanInspiration: 'Users need to see data to understand system value'
    },
    {
      name: 'session-management',
      value: 'session-management',
      description: 'Workflow for managing hookah sessions',
      usage: ['Session tracking', 'Workflow management', 'Operational control'],
      aiInsight: 'AI Agent: Session management is the core operational workflow',
      humanInspiration: 'Primary function that lounge owners need'
    }
  ],
  states: [
    {
      name: 'idle',
      value: 'idle',
      description: 'System in idle state waiting for action',
      usage: ['Initial state', 'Waiting for input', 'System ready'],
      aiInsight: 'AI Agent: Idle state indicates system is ready for user action',
      humanInspiration: 'Clear indication that system is ready'
    },
    {
      name: 'active',
      value: 'active',
      description: 'System actively processing or displaying data',
      usage: ['Active workflows', 'Data display', 'System operation'],
      aiInsight: 'AI Agent: Active state shows system is working and valuable',
      humanInspiration: 'Shows system is functioning and useful'
    }
  ],
  transitions: [
    {
      name: 'state-change',
      value: 'state-change',
      description: 'Transition between system states',
      usage: ['Workflow progression', 'State updates', 'System changes'],
      aiInsight: 'AI Agent: State transitions show system progress and value',
      humanInspiration: 'Users can see system responding to their actions'
    }
  ],
  feedback: [
    {
      name: 'progress-indicator',
      value: 'progress-indicator',
      description: 'Visual indicator of workflow progress',
      usage: ['Progress bars', 'Step indicators', 'Completion tracking'],
      aiInsight: 'AI Agent: Progress indicators show system value and guide users',
      humanInspiration: 'Users need to see their progress and next steps'
    }
  ]
};

// Design System Export
export const designSystem = {
  colors: colorPalette,
  typography,
  spacing,
  components,
  layouts,
  animations,
  semanticFlow
};

// Utility Functions for Design System
export const getDesignToken = (category: keyof typeof designSystem, name: string): DesignToken | undefined => {
  const categoryData = designSystem[category];
  if (Array.isArray(categoryData)) {
    return categoryData.find(token => token.name === name);
  }
  return undefined;
};

export const applyDesignToken = (category: keyof typeof designSystem, name: string): string => {
  const token = getDesignToken(category, name);
  return token ? token.value : '';
};

export const getAIInsight = (category: keyof typeof designSystem, name: string): string => {
  const token = getDesignToken(category, name);
  return token ? token.aiInsight : '';
};

export const getHumanInspiration = (category: keyof typeof designSystem, name: string): string => {
  const token = getDesignToken(category, name);
  return token ? token.humanInspiration : '';
};
