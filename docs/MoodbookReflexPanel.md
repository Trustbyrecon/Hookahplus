# MoodbookReflexPanel Integration

## Overview

The `MoodbookReflexPanel` component provides dynamic UI/UX reflex scoring, log preview, and SSR onboarding capabilities across all Moodbook pages and layouts. It enforces a reflex score threshold of ≥92 and prepares the system for CI/CD preflight integration.

## Features

### Core Functionality
- **Dynamic Reflex Scoring**: Real-time calculation and display of UI/UX reflex scores
- **Threshold Enforcement**: Enforces minimum reflex score of 92 for optimal performance
- **Log Preview**: Displays recent reflex scoring logs with categorization
- **SSR/CSR Hybrid**: Handles both server-side and client-side rendering scenarios
- **Onboarding Integration**: Automatic onboarding flow when scores are below threshold

### Technical Implementation
- **TypeScript**: Fully typed with comprehensive interfaces
- **React Hooks**: Uses modern React patterns for state management
- **Responsive Design**: Adapts to different screen sizes and contexts
- **Performance Optimized**: Efficient re-rendering and state updates

## Component Props

```typescript
interface MoodbookReflexPanelProps {
  initialScore?: number;           // Starting reflex score (default: 0)
  showLogPreview?: boolean;        // Show recent logs (default: true)
  enableOnboarding?: boolean;      // Enable onboarding flow (default: true)
  threshold?: number;              // Minimum score threshold (default: 92)
  className?: string;              // Additional CSS classes
  onScoreUpdate?: (score: number) => void;           // Score update callback
  onOnboardingComplete?: () => void;                 // Onboarding completion callback
}
```

## Integration Points

### 1. Main Index Page (`pages/index.tsx`)
- **Context**: Home page with full onboarding capabilities
- **Props**: `initialScore={75}`, `enableOnboarding={true}`
- **Purpose**: Introduce users to reflex scoring system

### 2. Onboarding Page (`pages/onboarding.tsx`)
- **Context**: Dedicated onboarding flow
- **Props**: `initialScore={45}`, `enableOnboarding={true}`
- **Purpose**: Guide users through onboarding process

### 3. Dashboard Page (`app/dashboard/pages/index.tsx`)
- **Context**: Admin dashboard environment
- **Props**: `initialScore={88}`, `enableOnboarding={false}`
- **Purpose**: Monitor ongoing reflex scores

### 4. Global Layout (`app/layout.tsx`)
- **Context**: Application-wide layout
- **Props**: `initialScore={82}`, `showLogPreview={false}`
- **Purpose**: Persistent reflex monitoring across all pages

### 5. Demo Page (`pages/demo.tsx`)
- **Context**: Demonstration environment
- **Props**: `initialScore={95}`, `enableOnboarding={false}`
- **Purpose**: Show optimal reflex scoring in action

### 6. Live Session Page (`pages/live-session.tsx`)
- **Context**: Real-time session monitoring
- **Props**: `initialScore={78}`, `enableOnboarding={true}`
- **Purpose**: Monitor live reflex scores during sessions

## SSR/CSR Hybrid Logic

The component implements intelligent rendering logic:

```typescript
// SSR/CSR hybrid logic
useEffect(() => {
  setIsClient(true);
  
  // Check if onboarding is needed
  if (enableOnboarding && reflexScore < threshold) {
    setIsOnboarding(true);
  }
}, [enableOnboarding, reflexScore, threshold]);
```

### Fallback Modal
- **Trigger**: When `isClient` is false (SSR context)
- **Purpose**: Provides onboarding access in server-rendered environments
- **Behavior**: Modal appears with onboarding options

## Reflex Score Categories

The system tracks scores across four key areas:

1. **UI (User Interface)**: Visual design and layout consistency
2. **UX (User Experience)**: Interaction flow and usability
3. **Performance**: Loading times and responsiveness
4. **Accessibility**: Screen reader support and keyboard navigation

## CI/CD Integration Preparation

The component includes built-in preparation for CI/CD integration:

```typescript
{/* CI/CD Integration Hint */}
<div className="mt-6 p-4 bg-text/5 rounded-lg border border-text/10">
  <div className="flex items-center space-x-2 mb-2">
    <div className="w-2 h-2 bg-blue-500 rounded-full" />
    <span className="text-sm font-medium text-blue-500">CI/CD Ready</span>
  </div>
  <p className="text-xs text-text-light">
    ReflexScore integration prepared for automated preflight checks and deployment validation.
  </p>
</div>
```

### Preflight Integration Features
- **Automated Scoring**: Ready for build-time reflex score calculation
- **Threshold Validation**: Enforces minimum scores before deployment
- **Log Aggregation**: Collects scoring data for CI/CD pipelines
- **Performance Monitoring**: Tracks reflex scores across deployments

## Usage Examples

### Basic Integration
```tsx
<MoodbookReflexPanel
  initialScore={80}
  threshold={92}
  onScoreUpdate={(score) => console.log('Score:', score)}
/>
```

### Full Feature Integration
```tsx
<MoodbookReflexPanel
  initialScore={75}
  showLogPreview={true}
  enableOnboarding={true}
  threshold={92}
  onScoreUpdate={handleScoreUpdate}
  onOnboardingComplete={handleOnboardingComplete}
  className="custom-styling"
/>
```

## Styling and Customization

The component uses Tailwind CSS classes and supports custom styling:

- **Base Classes**: `bg-surface`, `border-text/10`, `rounded-2xl`
- **Custom Classes**: Accepts `className` prop for additional styling
- **Responsive Design**: Adapts to different screen sizes
- **Theme Integration**: Uses consistent color scheme across the application

## Performance Considerations

- **State Management**: Efficient React state updates
- **Re-rendering**: Minimal unnecessary re-renders
- **Memory Usage**: Limited log history (last 10 entries)
- **Bundle Size**: Lightweight component with minimal dependencies

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live score updates
2. **Analytics Dashboard**: Comprehensive reflex score analytics
3. **Custom Thresholds**: Per-page or per-user threshold configuration
4. **Integration APIs**: External service integration for reflex scoring
5. **Machine Learning**: AI-powered reflex score optimization

## Troubleshooting

### Common Issues
- **SSR Hydration**: Ensure proper client-side hydration
- **Score Calculation**: Verify threshold values and scoring logic
- **Onboarding Flow**: Check enableOnboarding prop configuration
- **Styling Conflicts**: Review className prop and CSS specificity

### Debug Mode
Enable console logging for debugging:
```typescript
onScoreUpdate={(score) => console.log('Reflex score updated:', score)}
onOnboardingComplete={() => console.log('Onboarding completed')}
```
