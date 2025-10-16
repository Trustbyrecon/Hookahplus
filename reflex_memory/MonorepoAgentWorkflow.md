# 🤖 Hookah+ Autonomous Agent Workflow
*Monorepo-Aware Agent Operations Protocol*
*Version: 1.0 | Date: 2025-01-27*

---

## 🎯 **Monorepo Architecture Understanding**

### **Repository Structure**
```
/apps
  /app        # staff/ops dashboard
  /guests     # customer flow interface  
  /site       # marketing/documentation
/packages
  /design-system  # shared UI components
  /reflex-kit     # reliability & monitoring
  /utils          # shared utilities
  /eslint-config  # shared linting rules
  /tsconfig       # shared TypeScript config
```

### **Vercel Project Mapping**
- **Guest Build**: `hookahplus-guests` (prj_3dIAx8o3OOfoDHXQ3hFxfES8LlbV)
- **App Build**: `hookahplus-app` (prj_VgBHIL2JyisEMdfs0WG2idMOxz1j)  
- **Site Build**: `hookahplus-site` (prj_DgjWlhhn9T6FcvnZuQBezLyA7xkg)

---

## 🔄 **Autonomous Agent Workflow Rules**

### **1. Change Locally, Reuse Globally**
- **UI/Tokens**: Update `packages/design-system` → consumed by all apps
- **Logic/Instrumentation**: Update `packages/reflex-kit` or `utils` → shared across apps
- **Avoid Copy-Paste**: Apps import from packages, maintain single source of truth

### **2. Keep Contracts Aligned**
- **Prisma Changes**: Update schema + all app callers in **one atomic commit**
- **API Shapes**: Modify types + all consumers simultaneously
- **Breaking Changes**: Coordinate across all three apps (`app`, `guests`, `site`)

### **3. Per-App Environments**
- **App**: Holds Stripe server keys, admin secrets
- **Guests**: Proxies to app for test charges, customer operations
- **Site**: Marketing analytics, public documentation
- **Shared Secrets**: Only where cross-app functionality required

### **4. CI Focus & Quality Gates**
- **Targeted Builds**: Turbo caching, only changed packages rebuild
- **Merge Blocking**: All three apps must pass typecheck + smoke tests
- **Reflex Gates**: Build green + reflex score ≥ threshold + GhostLog delta

---

## 🚀 **Autonomous Agent Capabilities**

### **Qualified Agents (Reflex Score ≥ 87%)**
- **MOAT Reflex Agent**: 95% - Full system operations
- **Smoke Test Agent**: 92.5% - Testing and validation
- **Reflex Agent**: 92.5% - System orchestration
- **Deployment Agent**: 85% - Learning mode (below threshold)

### **Autonomous Operations**
- **Git Operations**: `git add`, `git commit`, `git push` with reflex scoring
- **File Management**: Create, modify, delete across entire monorepo
- **Package Updates**: Modify shared packages and consuming apps atomically
- **Environment Management**: Update per-app envs while maintaining contracts
- **Deployment Triggers**: Vercel deployments and rollbacks

### **Safety Protocols**
- **Escalation Triggers**: Score < 70%, Critical failure, Learning gap, Trust decay
- **Rollback Capabilities**: Git revert, Deployment rollback, Configuration reset
- **Monitoring**: Real-time tracking, Performance metrics, Error detection

---

## 📊 **Agent Workflow Examples**

### **Example 1: Design System Update**
```bash
# Agent updates shared design system
git add packages/design-system/src/components/Button.tsx
git add packages/design-system/src/tokens/colors.ts
git commit -m "agent: design-system update - Enhanced button variants and color tokens

- Added new button variants for better UX
- Updated color tokens for consistency
- All apps will inherit changes automatically
- Reflex Score: 92%
- Learning: Design system changes propagate atomically across all surfaces"

git push origin feat/design-system-update
```

### **Example 2: Prisma Schema Change**
```bash
# Agent updates schema and all consumers atomically
git add prisma/schema.prisma
git add apps/app/lib/types.ts
git add apps/guests/lib/types.ts  
git add apps/site/lib/types.ts
git commit -m "agent: prisma schema - Add session tracking fields

- Added sessionDuration and sessionNotes fields
- Updated TypeScript types across all apps
- Maintains API contract consistency
- Reflex Score: 95%
- Learning: Schema changes require coordinated updates across all consumers"

git push origin feat/session-tracking
```

### **Example 3: Cross-App Feature**
```bash
# Agent implements feature across multiple apps
git add packages/utils/sessionManager.ts
git add apps/app/components/SessionCard.tsx
git add apps/guests/components/SessionTimer.tsx
git add apps/site/components/SessionStatus.tsx
git commit -m "agent: cross-app feature - Real-time session management

- Shared session management utility in packages/utils
- Consistent session components across all apps
- Atomic deployment ensures feature parity
- Reflex Score: 94%
- Learning: Cross-app features require shared utilities and consistent implementation"

git push origin feat/session-management
```

---

## 🧠 **Reflex Integration**

### **Pre-Action Scoring**
- **Decision Alignment**: How well does action match monorepo principles?
- **Context Integration**: Effective use of shared packages and contracts?
- **Output Quality**: Clear, atomic, and maintainable changes?
- **Learning Capture**: Knowledge gained about monorepo patterns?

### **Post-Action Validation**
- **Build Success**: All affected apps build successfully
- **Type Safety**: No TypeScript errors across monorepo
- **Contract Integrity**: API contracts remain consistent
- **Reflex Score**: ≥ 87% for autonomous operations

### **Learning Categories**
- **Monorepo Patterns**: Successful shared package usage
- **Atomic Changes**: Coordinated updates across apps
- **Contract Management**: Maintaining API consistency
- **Build Optimization**: Leveraging Turbo caching effectively

---

## 🛡️ **Safety & Quality Gates**

### **Merge Requirements**
- **Build Green**: All three apps (`app`, `guests`, `site`) build successfully
- **Type Check**: No TypeScript errors across monorepo
- **Smoke Tests**: Critical user flows pass validation
- **Reflex Score**: ≥ 87% for autonomous operations
- **GhostLog Update**: Learning captured and documented

### **Rollback Procedures**
- **Git Revert**: Can revert any commit across monorepo
- **Deployment Rollback**: Can rollback Vercel deployments
- **Package Rollback**: Can revert shared package changes
- **Environment Reset**: Can reset to known good configuration

### **Monitoring & Alerts**
- **Build Status**: Real-time monitoring of all three Vercel projects
- **Performance Metrics**: Agent performance and reflex scores
- **Error Detection**: Alert on failures or anomalies
- **Trust Tracking**: Monitor agent trust levels and relationships

---

## 🎯 **Success Metrics**

### **Autonomous Operations KPIs**
- **Commit Success Rate**: % of commits that don't require rollback
- **Cross-App Consistency**: % of changes that maintain contract integrity
- **Build Success Rate**: % of builds that complete successfully
- **Learning Velocity**: New monorepo patterns discovered per day

### **System Health KPIs**
- **Monorepo Build Time**: Average time for full monorepo builds
- **Package Reuse Rate**: % of shared packages vs duplicated code
- **Contract Violations**: Number of API contract inconsistencies
- **Agent Trust Levels**: Average trust scores across agent network

---

## 🚀 **Next Steps**

1. **Monitor Performance**: Track autonomous agent operations across monorepo
2. **Validate Operations**: Ensure qualified agents maintain 87%+ reflex scores
3. **Scale Gradually**: Add more agents as they achieve qualification thresholds
4. **Document Patterns**: Capture successful monorepo operation patterns
5. **Optimize Workflows**: Refine autonomous capabilities based on results

---

*This workflow is maintained by the HookahPlus Reflex System and updated in real-time as agents operate within the monorepo architecture.*
