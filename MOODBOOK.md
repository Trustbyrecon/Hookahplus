# 🎨 Hookah+ Design System & Moodbook

## 🎯 **Design Philosophy**

Hookah+ uses a **dark, premium aesthetic** that reflects the sophisticated atmosphere of modern hookah lounges. The design emphasizes **clarity, conversion, and trust** while maintaining a **professional yet approachable** feel.

---

## 🌈 **Color Palette**

### **Primary Colors**
- **Teal-400** (`#2dd4bf`) - Primary brand color, used for headings and CTAs
- **Teal-500** (`#14b8a6`) - Primary button background
- **Teal-300** (`#5eead4`) - Secondary text and accents

### **Secondary Colors**
- **Cyan-400** (`#22d3ee`) - Secondary brand color for gradients
- **Cyan-600** (`#0891b2`) - Secondary button backgrounds
- **Purple-600** (`#9333ea`) - Special actions (mobile QR generation)

### **Neutral Colors**
- **Zinc-950** (`#09090b`) - Primary background
- **Zinc-900** (`#18181b`) - Secondary background, cards
- **Zinc-800** (`#27272a`) - Borders, dividers
- **Zinc-700** (`#3f3f46`) - Hover states, secondary borders
- **Zinc-400** (`#a1a1aa`) - Secondary text
- **Zinc-300** (`#d4d4d8`) - Primary text on dark backgrounds
- **White** (`#ffffff`) - Primary text on colored backgrounds

### **Status Colors**
- **Green-400** (`#4ade80`) - Success states
- **Red-400** (`#f87171`) - Error states, destructive actions
- **Yellow-400** (`#facc15`) - Warning states
- **Blue-400** (`#60a5fa`) - Information states

---

## 🔤 **Typography**

### **Headings**
- **H1**: `text-4xl md:text-6xl font-semibold leading-tight tracking-tight`
- **H2**: `text-3xl font-bold text-teal-400`
- **H3**: `text-xl font-semibold text-teal-300`
- **H4**: `text-lg font-semibold`

### **Body Text**
- **Primary**: `text-zinc-300` (white on dark backgrounds)
- **Secondary**: `text-zinc-400`
- **Muted**: `text-zinc-500`
- **Accent**: `text-teal-400 font-medium`

### **Font Weights**
- **Light**: `font-light` (300)
- **Normal**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semibold**: `font-semibold` (600)
- **Bold**: `font-bold` (700)

---

## 🧱 **Component Patterns**

### **Cards & Containers**
```css
/* Primary Card */
.bg-zinc-900 rounded-xl border border-zinc-800 p-6

/* Secondary Card */
.bg-zinc-950 rounded-xl border border-zinc-800 p-4

/* Highlighted Card */
.border-teal-500 bg-teal-500/10
```

### **Buttons**
```css
/* Primary Button */
.bg-teal-500 text-zinc-950 hover:bg-teal-400 
rounded-xl px-5 py-3 font-medium transition-colors

/* Secondary Button */
.border border-zinc-700 hover:border-teal-500/70
rounded-xl px-5 py-3 font-medium transition-colors

/* Small Button */
.rounded-xl px-4 py-2 border text-sm
```

### **Form Elements**
```css
/* Input Fields */
.rounded-xl bg-zinc-950 border border-zinc-800 
px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors

/* Labels */
.text-xs text-zinc-400
```

### **Navigation**
```css
/* Navigation Items */
.bg-[color]-600 hover:bg-[color]-700 text-white 
px-4 py-2 rounded-lg text-sm font-medium 
transition-all duration-200 flex items-center space-x-2 hover:scale-105

/* Active State */
.ring-2 ring-white ring-opacity-50
```

---

## 📱 **Layout Patterns**

### **Page Structure**
```css
/* Page Container */
.min-h-screen bg-zinc-950 text-white

/* Section Container */
.mx-auto max-w-7xl px-4 py-16

/* Grid Layouts */
.grid md:grid-cols-2 gap-8 items-center
.grid md:grid-cols-3 gap-8
.grid lg:grid-cols-5 gap-6
```

### **Spacing System**
- **XS**: `gap-2`, `p-2`, `m-2`
- **S**: `gap-3`, `p-3`, `m-3`
- **M**: `gap-4`, `p-4`, `m-4`
- **L**: `gap-6`, `p-6`, `m-6`
- **XL**: `gap-8`, `p-8`, `m-8`
- **2XL**: `gap-12`, `p-12`, `m-12`

### **Responsive Breakpoints**
- **Mobile**: Default (no prefix)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

---

## 🎭 **Interactive States**

### **Hover Effects**
```css
/* Button Hover */
.hover:bg-teal-400
.hover:border-teal-500/70
.hover:scale-105

/* Card Hover */
.hover:shadow-md
.hover:border-zinc-300
```

### **Focus States**
```css
/* Input Focus */
.focus:outline-none focus:border-teal-500

/* Button Focus */
.focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
```

### **Transitions**
```css
/* Smooth Transitions */
.transition-colors
.transition-all duration-200
```

---

## 🚀 **Component Library**

### **Navigation Components**
- **GlobalNavigation**: Consistent header with branded navigation
- **AdminNavigation**: Specialized admin navigation patterns

### **Dashboard Components**
- **BOHPrepRoom**: Back of house prep room interface
- **FOHFloorDashboard**: Front of house floor management
- **AdminControlCenter**: Comprehensive admin dashboard

### **Form Components**
- **Input Fields**: Consistent styling with focus states
- **Buttons**: Primary, secondary, and special action variants
- **Selectors**: Plan tier selectors and state toggles

### **Display Components**
- **Status Cards**: Revenue, sessions, and metrics display
- **Progress Indicators**: Workflow progress and status tracking
- **Data Tables**: Session information and analytics

---

## 🎨 **Visual Elements**

### **Icons & Emojis**
- **Primary Actions**: 🚀 (launch), 💰 (ROI), 🔥 (fire session)
- **Status Indicators**: ✅ (ready), 🔧 (prep), 🚚 (delivery)
- **Navigation**: 🏠 (home), ⚙️ (admin), 📱 (mobile)

### **Gradients**
```css
/* Primary Gradient */
.bg-gradient-to-br from-teal-400 to-cyan-400

/* Background Gradient */
.bg-[radial-gradient(60%_60%_at_50%_-10%,rgba(16,185,129,0.25),transparent_60%)]
```

### **Shadows & Depth**
```css
/* Subtle Shadows */
.shadow-sm
.shadow-lg

/* Custom Shadows */
.shadow-teal-500/25
```

---

## 📱 **Mobile-First Design**

### **Responsive Patterns**
- **Stack Layouts**: Single column on mobile, multi-column on desktop
- **Touch Targets**: Minimum 44px height for buttons
- **Readable Text**: Minimum 16px font size for body text
- **Spacing**: Consistent spacing that works on all screen sizes

### **Mobile Optimizations**
- **Simplified Navigation**: Collapsible navigation on mobile
- **Touch-Friendly Buttons**: Larger touch targets
- **Optimized Forms**: Full-width inputs on mobile

---

## 🔄 **Animation & Motion**

### **Micro-Interactions**
```css
/* Scale on Hover */
.hover:scale-105

/* Smooth Transitions */
.transition-all duration-200

/* Loading States */
.animate-spin
.animate-pulse
```

### **Page Transitions**
- **Smooth Scrolling**: `scroll-behavior: smooth`
- **Fade Effects**: Opacity transitions for content loading
- **Staggered Animations**: Sequential loading of list items

---

## 🎯 **Conversion-Focused Elements**

### **Call-to-Action Buttons**
- **Primary CTAs**: High contrast, prominent placement
- **Secondary CTAs**: Supporting actions with clear hierarchy
- **Social Proof**: Testimonials and success metrics

### **Trust Indicators**
- **Security Badges**: Payment security and data protection
- **Success Metrics**: ROI calculations and case studies
- **Customer Testimonials**: Real user experiences

---

## 📋 **Implementation Guidelines**

### **CSS Classes**
- Use Tailwind utility classes for consistency
- Follow the established color palette
- Maintain consistent spacing and typography

### **Component Structure**
- Follow the established component patterns
- Use consistent naming conventions
- Implement responsive design by default

### **Accessibility**
- Maintain proper contrast ratios
- Use semantic HTML elements
- Implement keyboard navigation
- Provide alternative text for images

---

## 🚀 **Quick Start Templates**

### **New Page Template**
```tsx
"use client";

import GlobalNavigation from "../../components/GlobalNavigation";

export default function NewPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <GlobalNavigation />
      
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-400 mb-2">Page Title</h1>
          <p className="text-zinc-400">Page description</p>
        </div>
        
        {/* Page content here */}
      </div>
    </div>
  );
}
```

### **New Component Template**
```tsx
"use client";

interface ComponentProps {
  // Props interface
}

export default function ComponentName({ }: ComponentProps) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
      {/* Component content */}
    </div>
  );
}
```

---

## 📚 **Resources & References**

### **Design Tools**
- **Figma**: Component library and design system
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Icon library for consistent iconography

### **Documentation**
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev

---

## 🔄 **Maintenance & Updates**

### **Version Control**
- Document all design system changes
- Maintain changelog for component updates
- Use semantic versioning for major changes

### **Quality Assurance**
- Regular accessibility audits
- Cross-browser compatibility testing
- Mobile responsiveness validation
- Performance optimization reviews

---

*This moodbook serves as the single source of truth for all Hookah+ design decisions. Update it whenever new patterns emerge or existing ones evolve.*
