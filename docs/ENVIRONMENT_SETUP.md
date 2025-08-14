# Environment Configuration Setup

This document explains how to configure environment variables for different deployment scenarios in the Hookah+ project.

## Environment Files Overview

### 1. `env.example` - Template File
- **Purpose**: Template showing all available environment variables
- **Usage**: Copy to `.env.local` and fill in your actual values
- **Never commit**: Contains sensitive information placeholders

### 2. `env.development` - Development Environment
- **Purpose**: Environment variables for development builds
- **Usage**: Automatically loaded when `NODE_ENV=development`
- **Features**: Debug mode, mock data, hot reload enabled

### 3. `env.production` - Production Environment
- **Purpose**: Environment variables for production builds
- **Usage**: Automatically loaded when `NODE_ENV=production`
- **Features**: Performance monitoring, error tracking, analytics

### 4. `app/dashboard/env.local` - Dashboard App Local
- **Purpose**: Dashboard-specific local environment variables
- **Usage**: Loaded only for dashboard app development
- **Features**: App-specific configuration and mock data

## Quick Setup

### For Local Development:
```bash
# Copy the example file
cp env.example .env.local

# Edit with your actual values
nano .env.local
```

### For Dashboard App:
```bash
# Copy dashboard-specific config
cp app/dashboard/env.local app/dashboard/.env.local

# Edit with your actual values
nano app/dashboard/.env.local
```

## Environment Variable Categories

### Public Variables (NEXT_PUBLIC_*)
- **Usage**: Accessible in browser/client-side code
- **Examples**: API URLs, feature flags, app configuration
- **Security**: Never include secrets or sensitive data

### Private Variables
- **Usage**: Server-side only, not exposed to browser
- **Examples**: Database URLs, API keys, secrets
- **Security**: Can include sensitive information

## Reflex Scoring Configuration

### Core Settings:
```bash
NEXT_PUBLIC_REFLEX_SCORE_THRESHOLD=92
NEXT_PUBLIC_REFLEX_ENABLE_ONBOARDING=true
NEXT_PUBLIC_REFLEX_LOG_LEVEL=info
```

### Dashboard-Specific:
```bash
NEXT_PUBLIC_DASHBOARD_REFLEX_THRESHOLD=92
NEXT_PUBLIC_DASHBOARD_REFLEX_ENABLE_LOGGING=true
NEXT_PUBLIC_DASHBOARD_REFLEX_LOG_LEVEL=debug
```

## Feature Flags

### Reflex Panel:
```bash
NEXT_PUBLIC_ENABLE_REFLEX_PANEL=true
NEXT_PUBLIC_ENABLE_ONBOARDING_FLOW=true
NEXT_PUBLIC_ENABLE_CI_CD_INTEGRATION=true
```

### Development Tools:
```bash
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_HOT_RELOAD=true
NEXT_PUBLIC_USE_MOCK_DATA=true
```

## Environment-Specific Configurations

### Development:
- Debug mode enabled
- Mock data available
- Hot reload active
- Verbose logging

### Production:
- Debug mode disabled
- Performance monitoring enabled
- Error tracking active
- Minimal logging

### Local Dashboard:
- App-specific features enabled
- Local API endpoints
- Mock data for testing
- Development tools active

## Security Best Practices

### ✅ Do:
- Use `NEXT_PUBLIC_` prefix for client-accessible variables
- Keep secrets in private variables only
- Use different values for different environments
- Document all required variables

### ❌ Don't:
- Commit `.env.local` files to version control
- Include API keys in public variables
- Use production values in development
- Share environment files publicly

## Troubleshooting

### Common Issues:

1. **Variables not loading**: Check file naming and location
2. **Build errors**: Verify all required variables are set
3. **Runtime errors**: Ensure variables are properly prefixed
4. **Environment mismatch**: Confirm correct file is being used

### Debug Commands:
```bash
# Check current environment
echo $NODE_ENV

# List all environment variables
env | grep NEXT_PUBLIC

# Verify file loading
cat .env.local
```

## CI/CD Integration

### Netlify:
- Environment variables set in Netlify dashboard
- Build-time variable injection
- Automatic environment detection

### GitHub Actions:
- Secrets stored in GitHub repository
- Environment-specific workflows
- Secure variable injection

## Next Steps

1. **Copy and configure** `env.example` to `.env.local`
2. **Set up dashboard-specific** configuration if needed
3. **Test configuration** with `npm run dev`
4. **Verify production** settings before deployment
5. **Update CI/CD** pipelines with required variables

## Support

For questions about environment configuration:
- Check this documentation
- Review the example files
- Consult the development team
- Check project-specific requirements
