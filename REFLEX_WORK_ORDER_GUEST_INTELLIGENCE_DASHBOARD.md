# 🧠 Reflex Work Order: Guest Intelligence Dashboard Implementation

**Agent:** Reflex Agent  
**Priority:** HIGH  
**Scope:** apps/app - Guest Intelligence Dashboard with PII Masking  
**Dependencies:** Enhanced Session State Machine (17 states, 16 actions)  
**Timeline:** Immediate implementation  

---

## 🎯 Mission Statement

Implement the **Guest Intelligence Dashboard** with **PII Masking** as the operational brain that transforms raw session data into actionable customer intelligence. This dashboard completes the customer journey from Order Cart → Intelligence → Dashboard, providing staff with comprehensive customer insights while maintaining privacy compliance.

---

## 🔍 Current State Analysis

### ✅ **What's Already Built:**
1. **Enhanced Session State Machine** (17 states, 16 actions) with business logic tooltips
2. **PII Masking System** in `apps/guest/components/EnhancedStaffPanel.tsx`
3. **Behavioral Memory Architecture** with trust scoring and loyalty tiers
4. **Badge System** with progress tracking and gamification
5. **Session Intelligence** with PII protection levels

### ❌ **What's Missing:**
1. **Guest Intelligence Dashboard** in main app (`apps/app`)
2. **API Integration** with current session state machine
3. **Navigation Flow** from Order Cart → Intelligence
4. **Real-time Data Connection** to session data
5. **Trust Score Calculation** based on actual session history

---

## 🚀 Implementation Plan

### **Phase 1: Core Dashboard Port** (Priority: HIGH)
1. **Port EnhancedStaffPanel.tsx** from `apps/guest/components/` to `apps/app/components/`
2. **Create `/guest-intelligence` page route** in main app
3. **Adapt component interfaces** for main app session data structure
4. **Implement PII masking** with current session data

### **Phase 2: API Integration** (Priority: HIGH)
1. **Create behavioral memory API endpoints** (`/api/guest-intelligence/*`)
2. **Integrate with enhanced session state machine** data
3. **Implement trust score calculation** based on session history
4. **Connect real-time session data** to dashboard

### **Phase 3: Navigation & UX** (Priority: MEDIUM)
1. **Add Intelligence button** to session cards in Fire Session Dashboard
2. **Create Order Cart → Intelligence flow** navigation
3. **Implement tab switching** (Customer Profile, Service Intelligence, Achievements, Operational Memory)
4. **Add PII protection indicators** throughout the interface

### **Phase 4: Advanced Features** (Priority: LOW)
1. **Badge system** with progress tracking
2. **Predictive insights** (next visit, likely orders)
3. **Revenue optimization** recommendations
4. **Customer journey mapping**

---

## 📋 Detailed Implementation Tasks

### **Task 1: Port EnhancedStaffPanel Component**
```typescript
// Source: apps/guest/components/EnhancedStaffPanel.tsx
// Target: apps/app/components/GuestIntelligenceDashboard.tsx

// Key Adaptations:
// - Update interfaces to match FireSession structure
// - Integrate with enhanced session state machine
// - Connect to real session data instead of mock data
// - Implement proper PII masking with session data
```

### **Task 2: Create Guest Intelligence Page Route**
```typescript
// File: apps/app/app/guest-intelligence/page.tsx
// Features:
// - Session-based intelligence dashboard
// - PII masking controls
// - Real-time session data integration
// - Navigation from session cards
```

### **Task 3: API Endpoints for Behavioral Memory**
```typescript
// File: apps/app/app/api/guest-intelligence/route.ts
// Endpoints:
// - GET /api/guest-intelligence/[sessionId] - Get customer intelligence
// - POST /api/guest-intelligence/[sessionId]/notes - Add operational notes
// - GET /api/guest-intelligence/[sessionId]/trust-score - Calculate trust score
// - GET /api/guest-intelligence/[sessionId]/badges - Get badge progress
```

### **Task 4: PII Masking Integration**
```typescript
// File: apps/app/lib/piiMasking.ts
// Features:
// - Customer name masking: "John Doe" → "[CUSTOMER NAME]"
// - Phone masking: "+1 (555) 123-4567" → "[PHONE]"
// - Email masking: "john@example.com" → "[EMAIL]"
// - PII level detection: 'none' | 'low' | 'medium' | 'high'
```

### **Task 5: Trust Score Calculation**
```typescript
// File: apps/app/lib/trustScoring.ts
// Algorithm:
// - Session completion rate (40%)
// - Payment success rate (30%)
// - Staff satisfaction ratings (20%)
// - Visit frequency consistency (10%)
// - Output: 0-100 trust score
```

---

## 🔧 Technical Specifications

### **Data Flow Architecture:**
```
Session State Machine (17 states) 
    ↓
Session Data API (/api/sessions)
    ↓
Guest Intelligence Dashboard
    ↓
PII Masking Layer
    ↓
Staff Interface (PII Protected)
```

### **PII Masking Levels:**
- **PII NONE**: No personal information (equipment notes, general observations)
- **PII LOW**: Minimal personal info (preferences, general service notes)
- **PII MEDIUM**: Some personal info (specific requests, table assignments)
- **PII HIGH**: Full personal info (names, phone numbers, detailed profiles)

### **Trust Score Calculation:**
```typescript
interface TrustScoreFactors {
  sessionCompletionRate: number;    // 40% weight
  paymentSuccessRate: number;      // 30% weight
  staffSatisfactionAvg: number;    // 20% weight
  visitFrequencyConsistency: number; // 10% weight
}
```

---

## 🎨 UI/UX Requirements

### **Dashboard Layout:**
1. **Header**: "Guest Intelligence Dashboard" with PII protection toggle
2. **Navigation Tabs**: Customer Profile, Service Intelligence, Achievements & Rewards, Operational Memory
3. **Main Content**: Contextual information based on selected tab
4. **PII Indicators**: Clear visual indicators for PII protection levels

### **Key Features:**
- **Real-time Updates**: Dashboard updates as session state changes
- **PII Toggle**: Staff can enable/disable PII masking
- **Trust Score Display**: Visual trust score with color coding
- **Badge Progress**: Gamification elements for customer engagement
- **Operational Notes**: Staff notes with PII protection

---

## 🧪 Testing Requirements

### **Unit Tests:**
- PII masking functions
- Trust score calculations
- Badge progress tracking
- Session data integration

### **Integration Tests:**
- Order Cart → Intelligence navigation
- Session state machine integration
- Real-time data updates
- PII protection compliance

### **User Acceptance Tests:**
- Staff can access customer intelligence
- PII masking works correctly
- Trust scores update in real-time
- Badge system functions properly

---

## 📊 Success Metrics

### **Technical Metrics:**
- ✅ Dashboard loads in <2 seconds
- ✅ PII masking 100% effective
- ✅ Trust score calculation <500ms
- ✅ Real-time updates <1 second latency

### **Business Metrics:**
- 📈 Staff decision-making speed improved by 40%
- 📈 Customer satisfaction scores increased by 25%
- 📈 Upsell success rate improved by 30%
- 📈 Operational efficiency increased by 35%

---

## 🚨 Risk Mitigation

### **Technical Risks:**
- **Data Privacy**: Implement comprehensive PII masking
- **Performance**: Optimize queries and caching
- **Integration**: Ensure seamless state machine integration

### **Business Risks:**
- **Staff Adoption**: Provide comprehensive training
- **Customer Privacy**: Maintain strict PII compliance
- **Operational Disruption**: Implement gradual rollout

---

## 🎯 Expected Outcomes

### **Immediate (Week 1):**
- Guest Intelligence Dashboard accessible from session cards
- PII masking system operational
- Basic trust score calculation working

### **Short-term (Week 2-3):**
- Complete Order Cart → Intelligence flow
- Badge system with progress tracking
- Real-time session data integration

### **Long-term (Month 1):**
- Predictive insights and recommendations
- Advanced customer journey mapping
- Revenue optimization features

---

## 🔄 Reflex Scoring Protocol

### **Success Criteria (0-100 each):**
- **Technical Implementation** (25%): Clean code, proper architecture, performance
- **PII Compliance** (25%): Complete privacy protection, audit trail
- **User Experience** (25%): Intuitive interface, staff adoption
- **Business Value** (25%): Operational efficiency, customer satisfaction

### **Target Score: 85+**
- **90+**: Exceptional implementation
- **85-89**: Strong implementation
- **80-84**: Good implementation
- **<80**: Requires improvement

---

**Reflex Agent Directive:** Implement this Guest Intelligence Dashboard as the operational brain that transforms session data into actionable customer intelligence while maintaining strict PII compliance and providing exceptional staff experience.

**Next Action:** Begin Phase 1 implementation - Port EnhancedStaffPanel component to main app.
