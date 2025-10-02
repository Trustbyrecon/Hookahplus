# RWO: Green Build for Hookah+ App Deployment

**RWO ID**: RWO-DEPLOY-001  
**Priority**: Critical  
**Status**: In Progress  
**Assigned**: Development Team  
**Created**: October 2, 2025  

## Executive Summary

Achieve a successful (green) production deployment of the Hookah+ application on Vercel, resolving persistent routes manifest and build configuration issues in the monorepo structure.

## Success Criteria

### Primary Goals
- ✅ **Successful Vercel deployment** with green status
- ✅ **All routes functional** without 404 errors
- ✅ **$1 Stripe Smoke Test** working in production
- ✅ **Routes manifest found** in correct location
- ✅ **Build completes** without errors

### Technical Requirements
- Build time < 5 minutes
- All 42 routes deployed successfully
- API endpoints accessible
- Static pages generated correctly
- Environment variables properly configured

## Scope of Change

### In Scope
- Vercel configuration optimization
- Monorepo build configuration
- Routes manifest path resolution
- Build command optimization
- Deployment pipeline fixes

### Out of Scope
- Stripe Authorization header fixes (separate RWO)
- Feature development
- Database migrations
- Third-party service integrations

## Environment Variables

### Required for Production
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Application Configuration
NEXT_PUBLIC_APP_URL=https://hookahplus-app.vercel.app
NEXT_PUBLIC_PRETTY_THEME=1

# Build Configuration
NODE_ENV=production
VERCEL_REGION=iad1
```

## Implementation Tasks

### Phase 1: Vercel Configuration ✅ COMPLETED
- [x] Create minimal `vercel.json` configuration
- [x] Set explicit `outputDirectory: "apps/app/.next"`
- [x] Configure build command for monorepo
- [x] Add region specification for consistency

### Phase 2: Build Command Optimization ✅ COMPLETED
- [x] Test workspace script: `pnpm -w run build:app`
- [x] Test pnpm filter: `pnpm --filter @hookahplus/app run build`
- [x] Verify local build success
- [x] Confirm routes manifest creation

### Phase 3: Branch Strategy ✅ COMPLETED
- [x] Create new branch: `fix/vercel-deployment`
- [x] Test fresh deployment trigger
- [x] Verify webhook functionality
- [x] Confirm commit pickup

### Phase 4: Deployment Verification 🔄 IN PROGRESS
- [ ] Monitor latest deployment logs
- [ ] Verify routes manifest location
- [ ] Test all API endpoints
- [ ] Confirm static page generation
- [ ] Validate $1 Stripe Smoke Test

## Current Configuration

### vercel.json (Latest)
```json
{
  "version": 2,
  "buildCommand": "pnpm install --no-frozen-lockfile && pnpm --filter @hookahplus/app run build",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "outputDirectory": "apps/app/.next"
}
```

### Build Process
1. **Install Dependencies**: `pnpm install --no-frozen-lockfile`
2. **Build App**: `pnpm --filter @hookahplus/app run build`
3. **Output Location**: `apps/app/.next`
4. **Routes Manifest**: `apps/app/.next/routes-manifest.json`

## Observability Requirements

### Monitoring Points
- Build duration and success rate
- Routes manifest detection
- API endpoint availability
- Static page generation
- Environment variable loading

### Logging Standards
- Tag all logs with `[RWO:Green-Build]`
- Include commit hash in build logs
- Log build command execution
- Track deployment status changes

### Health Checks
- `/api/health` endpoint response
- Routes manifest file existence
- Build output directory structure
- Environment variable validation

## Roles & Permissions

### Development Team
- **Full Access**: Modify Vercel configuration
- **Deploy Access**: Trigger deployments
- **Log Access**: View build logs and errors

### Operations Team
- **Monitor Access**: View deployment status
- **Alert Access**: Receive failure notifications
- **Rollback Access**: Revert failed deployments

## Test Procedures

### Pre-Deployment Testing
1. **Local Build Test**
   ```bash
   pnpm -w run build:app
   ls -la apps/app/.next/routes-manifest.json
   ```

2. **Configuration Validation**
   ```bash
   cat vercel.json
   git log --oneline -3
   ```

### Post-Deployment Testing
1. **Routes Verification**
   - Visit all static pages
   - Test API endpoints
   - Verify $1 Stripe Smoke Test

2. **Performance Validation**
   - Check build time < 5 minutes
   - Verify all 42 routes deployed
   - Confirm no 404 errors

## Failure Playbook

### Build Failures
1. **Routes Manifest Not Found**
   - Check `outputDirectory` configuration
   - Verify build command execution
   - Confirm Next.js app detection

2. **Build Command Errors**
   - Test alternative build commands
   - Verify pnpm workspace configuration
   - Check package.json scripts

3. **Deployment Not Triggered**
   - Verify GitHub webhook configuration
   - Check branch settings in Vercel
   - Confirm commit push success

### Recovery Actions
1. **Immediate**: Check latest deployment logs
2. **Short-term**: Test alternative build configuration
3. **Long-term**: Optimize monorepo structure

## Rollback Strategy

### Automatic Rollback Triggers
- Build time > 10 minutes
- Routes manifest not found
- API endpoints returning 500 errors
- Static pages not generating

### Manual Rollback Process
1. Revert to last known working commit
2. Update Vercel configuration
3. Trigger new deployment
4. Verify rollback success

## Success Metrics

### Key Performance Indicators
- **Build Success Rate**: 100%
- **Deployment Time**: < 5 minutes
- **Routes Available**: 42/42
- **API Endpoints**: All functional
- **Error Rate**: 0%

### Monitoring Dashboard
- Real-time deployment status
- Build duration tracking
- Error rate monitoring
- Performance metrics

## Timeline

### Phase 1: Configuration ✅ COMPLETED (Day 1)
- Vercel configuration optimization
- Build command testing
- Local validation

### Phase 2: Deployment ✅ COMPLETED (Day 1)
- Branch strategy implementation
- Fresh deployment testing
- Webhook verification

### Phase 3: Verification 🔄 IN PROGRESS (Day 1)
- Production deployment monitoring
- Routes manifest validation
- End-to-end testing

### Phase 4: Optimization 📋 PLANNED (Day 2)
- Performance optimization
- Monitoring implementation
- Documentation completion

## Dependencies

### External Services
- **Vercel**: Deployment platform
- **GitHub**: Source code repository
- **Stripe**: Payment processing (separate RWO)

### Internal Systems
- **Monorepo Structure**: pnpm workspace
- **Next.js Application**: React framework
- **Build Pipeline**: Vercel CLI

## Risk Assessment

### High Risk
- **Routes Manifest Issues**: Could prevent deployment
- **Build Command Failures**: May cause deployment failures
- **Webhook Problems**: Could delay deployments

### Medium Risk
- **Environment Variables**: May cause runtime errors
- **Build Timeouts**: Could cause deployment failures
- **Cache Issues**: May prevent fresh deployments

### Low Risk
- **Performance Impact**: Minimal user impact
- **Feature Delays**: Non-critical functionality

## Communication Plan

### Stakeholder Updates
- **Daily**: Development team standup
- **Weekly**: Management status report
- **As Needed**: Critical issue notifications

### Escalation Path
1. **Level 1**: Development team
2. **Level 2**: Technical lead
3. **Level 3**: Engineering manager

## Acceptance Criteria

### Technical Acceptance
- [ ] Green deployment status in Vercel
- [ ] All 42 routes accessible
- [ ] Routes manifest found in correct location
- [ ] Build completes in < 5 minutes
- [ ] No 404 errors on critical pages

### Business Acceptance
- [ ] $1 Stripe Smoke Test functional
- [ ] Order Management page accessible
- [ ] Pre-Order Station working
- [ ] Admin panel accessible
- [ ] Staff dashboard functional

## Post-Deployment Actions

### Immediate (0-24 hours)
- Monitor deployment stability
- Verify all critical functionality
- Check error rates and performance

### Short-term (1-7 days)
- Optimize build performance
- Implement monitoring alerts
- Document lessons learned

### Long-term (1-4 weeks)
- Review and optimize deployment pipeline
- Implement automated testing
- Plan future deployment improvements

---

**RWO Status**: 🔄 In Progress  
**Last Updated**: October 2, 2025  
**Next Review**: October 3, 2025  
**Completion Target**: October 2, 2025
