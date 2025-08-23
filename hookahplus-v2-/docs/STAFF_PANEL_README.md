# Behavioral Memory Staff Panel

> **Status:** ✅ Implemented • Cursor-ready • Production-ready

## 🎯 Overview

The Behavioral Memory Staff Panel is a comprehensive staff interface for managing customer profiles, preferences, and sessions in real-time. It provides a dual-scope note system (lounge vs network), badge management, and session tracking capabilities.

## 🚀 Quick Start

### Access the Panel
- **URL**: `/staff-panel`
- **Component**: `components/BehavioralMemoryStaffPanel.tsx`

### Features
- **Check-in System**: Phone/email/QR code lookup with profile resolution
- **Dual-Scope Notes**: Lounge-specific (private) vs Network-wide (portable)
- **Badge Management**: Award Explorer, Mix Master, and Loyalist badges
- **Session Control**: Start/stop sessions with auto-start option
- **Export Functionality**: Download JSON snapshots of customer profiles

## 🏗️ Architecture

### Component Structure
```
BehavioralMemoryStaffPanel/
├── Header (H+ branding + title)
├── Sidebar (360px width)
│   ├── Check-in Section
│   ├── Note Creation
│   ├── Quick Actions
│   └── Export Tools
└── Main Content (2x2 grid)
    ├── Profile Display
    ├── Badges & Loyalty
    ├── Notes (Lounge/Network)
    ├── Session Status
    └── Venue Context
```

### Data Types
```typescript
type Profile = {
  hid: string;           // Unique identifier
  name: string;          // Customer name
  phone: string;         // Contact phone
  email: string;         // Contact email
  tier: string;          // Loyalty tier
  prefs: string[];       // Last 3 preferences
  suggest: string[];     // Suggested actions
  badges: Badge[];       // Earned badges
  notesL: string[];      // Lounge-scoped notes
  notesN: string[];      // Network-scoped notes
  loyalty: number;       // Loyalty progress (0-100)
  catalog: string[];     // Available flavors/services
};
```

## 🎨 Design System

### Color Palette
- **Primary Background**: `#0e1220` (Dark navy)
- **Panel Background**: `#151a33` (Medium navy)
- **Stroke/Border**: `#2a2f4a` (Light navy)
- **Text Primary**: `#e9ecff` (White-blue)
- **Text Muted**: `#aab6ff` (Light blue)
- **Brand Gold**: `#d4af37` (Accent)

### Typography
- **Scale**: 12/14/16/20/26px
- **Weights**: 400 (body), 600-700 (headings)
- **Density**: 40×40px minimum hit areas

## 🔧 Integration

### API Endpoints (Future)
```typescript
// Profile resolution
GET /profiles/resolve?identifier={phone|email|qr}

// Note management
POST /notes { scope: "lounge"|"network", text: string }

// Badge awards
POST /badges { code: string }

// Session control
POST /sessions/start
POST /sessions/stop
```

### Security Considerations
- Role-based access control
- PII redaction for unverified staff
- Audit logging for all actions
- Network-scoped data encryption

## 📱 Mobile Responsiveness

The component is designed with mobile-first principles:
- Responsive grid layout
- Touch-friendly button sizes
- Optimized for portrait orientation
- Swipe gestures for navigation

## 🧪 Testing

### Demo Mode
- **Simulate Check-in**: Loads demo profile (Ava Thompson)
- **Auto-start Session**: Optional session initiation
- **Export Demo**: Downloads sample JSON data

### Test Scenarios
1. **Profile Loading**: Check-in simulation
2. **Note Creation**: Add lounge vs network notes
3. **Badge Awarding**: Test badge system
4. **Session Management**: Start/stop timing
5. **Data Export**: JSON download functionality

## 🔄 State Management

### Local State
- `profile`: Current customer profile
- `note`: New note input
- `sessionActive`: Session status
- `sessionStamp`: Session timestamp
- `autoStart`: Auto-session toggle

### State Updates
- Profile changes trigger re-renders
- Notes are added to appropriate scope
- Badges are appended to profile
- Session state updates in real-time

## 📊 Analytics & Telemetry

### Tracked Events
- `profile_load`: Customer profile resolution
- `note_add`: Note creation (with scope)
- `badge_award`: Badge assignment
- `session_start`: Session initiation
- `session_stop`: Session termination
- `export_snapshot`: Data export

### Privacy Compliance
- GDPR-compliant data handling
- PII encryption in production
- User consent tracking
- Data retention policies

## 🚀 Deployment

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Production start
npm run start
```

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional (for production)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
TRUSTLOCK_SECRET=your_secret_here
```

## 🔮 Future Enhancements

### Phase 2 Features
- **Real-time Updates**: WebSocket integration
- **Advanced Search**: Fuzzy matching algorithms
- **Bulk Operations**: Multi-customer management
- **Analytics Dashboard**: Usage insights
- **Mobile App**: Native iOS/Android

### Phase 3 Features
- **AI Recommendations**: ML-powered suggestions
- **Predictive Analytics**: Customer behavior forecasting
- **Integration Hub**: Third-party POS systems
- **Multi-language**: Internationalization support

## 📚 Additional Resources

- [API Endpoints Documentation](./API_ENDPOINTS_README.md)
- [Design System Guidelines](./MOODBOOK.md)
- [Security Best Practices](./SECURITY.md)
- [Deployment Checklist](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

**Maintained by**: HookahPlus Development Team  
**Last Updated**: December 2024  
**Version**: 1.0.0
