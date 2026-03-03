// HookahPlus Design System
// Unified component library for all HookahPlus applications

// Core Components
export { default as Button } from './components/Button';
export { default as Card } from './components/Card';
export { default as Badge } from './components/Badge';
export { default as MetricCard } from './components/MetricCard';
export { default as StatusIndicator } from './components/StatusIndicator';
export { default as TrustLock } from './components/TrustLock';
export { default as GlobalNavigation } from './components/GlobalNavigation';

// HookahPlus Specific Components
export { default as SessionCard } from './components/hookah/SessionCard';
export { default as TableCard } from './components/hookah/TableCard';
export { default as StaffCard } from './components/hookah/StaffCard';

// Journey Flow Components
export { default as StepIndicator } from './components/journey/StepIndicator';
export { default as FlowProgress } from './components/journey/FlowProgress';
export { default as JourneyCard } from './components/journey/JourneyCard';

// Customer Experience Components
export { default as QRScanner } from './components/customer/QRScanner';
export { default as FlavorSelector } from './components/customer/FlavorSelector';
export { default as SessionTimer } from './components/customer/SessionTimer';

// Staff Workflow Components
export { default as TaskQueue } from './components/staff/TaskQueue';

// Utility functions
export { cn } from './utils/cn';
export { formatCurrency, formatTime, formatDate } from './utils/format';

// Types
export type { ButtonProps } from './components/Button';
export type { CardProps } from './components/Card';
export type { BadgeProps } from './components/Badge';
export type { StepIndicatorProps } from './components/journey/StepIndicator';
export type { FlowProgressProps } from './components/journey/FlowProgress';
export type { JourneyCardProps } from './components/journey/JourneyCard';
export type { QRScannerProps } from './components/customer/QRScanner';
export type { FlavorSelectorProps, Flavor } from './components/customer/FlavorSelector';
export type { SessionTimerProps } from './components/customer/SessionTimer';
export type { TaskQueueProps, Task } from './components/staff/TaskQueue';
