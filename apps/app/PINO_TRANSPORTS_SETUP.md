# ✅ Pino Transports Setup

**Date:** 2025-01-28  
**Status:** ✅ Configured  
**Phase:** Log Aggregation

---

## 🎯 Overview

Pino transports allow you to forward logs to multiple destinations simultaneously. This setup provides a flexible, production-ready logging system that can send logs to console, files, Datadog, LogRocket, or any HTTP endpoint.

---

## ✅ What Was Implemented

### 1. Transport System (`lib/logger-pino-transports.ts`)

**Features:**
- ✅ **Multistream support** - Send logs to multiple destinations
- ✅ **Environment-based configuration** - Enable/disable via env vars
- ✅ **Console/Stdout** - Always enabled (captured by Vercel Logs)
- ✅ **File transport** - Optional local log files
- ✅ **Datadog transport** - Optional Datadog log forwarding
- ✅ **LogRocket transport** - Optional LogRocket integration
- ✅ **Custom HTTP transport** - Forward to any HTTP endpoint

### 2. Updated Logger (`lib/logger-pino.ts`)

**Changes:**
- ✅ Automatically uses multistream when transports are configured
- ✅ Falls back to single stream if only console is enabled
- ✅ Backward compatible - works without any configuration

---

## 📊 Supported Transports

### 1. Console/Stdout (Always Enabled)

**Default behavior:**
- **Development:** Pretty-printed, colored output
- **Production:** JSON output (captured by Vercel Logs)

**Configuration:**
```bash
# Force JSON output even in development
STRUCTURED_LOGGING=true
```

**Vercel Logs:**
- Automatically captures stdout/stderr
- Available in Vercel Dashboard → Deployments → Logs
- Retention: 30 days (Pro) or 7 days (Hobby)

---

### 2. File Transport (Optional)

**Enable:**
```bash
PINO_FILE_ENABLED=true
PINO_FILE_PATH=./logs/app.log  # Optional, default: ./logs/app.log
PINO_FILE_LEVEL=info            # Optional, default: info
```

**Features:**
- Creates log directory automatically
- Rotates logs (handled by log rotation tools)
- Useful for local development or self-hosted deployments

**Example:**
```bash
# Enable file logging
export PINO_FILE_ENABLED=true
export PINO_FILE_PATH=./logs/app.log
export PINO_FILE_LEVEL=info
```

---

### 3. Datadog Transport (Optional)

**Prerequisites:**
- Datadog account
- API key from Datadog

**Enable:**
```bash
DATADOG_API_KEY=your_api_key_here
DATADOG_SITE=us1                    # us1, us3, eu, ap1, etc.
DATADOG_SERVICE=hookahplus-app      # Optional, default: hookahplus-app
DATADOG_LOG_LEVEL=info               # Optional, default: info
DATADOG_HOSTNAME=your-hostname       # Optional, auto-detected
```

**Setup Steps:**

1. **Get Datadog API Key:**
   - Go to https://app.datadoghq.com
   - Navigate to Organization Settings → API Keys
   - Create a new API key or use existing

2. **Install Datadog Transport (if needed):**
   ```bash
   npm install pino-datadog
   ```

3. **Set Environment Variables:**
   ```bash
   DATADOG_API_KEY=your_api_key
   DATADOG_SITE=us1
   DATADOG_SERVICE=hookahplus-app
   ```

4. **Verify:**
   - Check Datadog Logs Explorer
   - Look for logs with service: `hookadplus-app`

**Datadog Sites:**
- `us1` - US1 (default)
- `us3` - US3
- `eu` - Europe
- `ap1` - Asia Pacific

---

### 4. LogRocket Transport (Optional)

**Prerequisites:**
- LogRocket account
- App ID from LogRocket

**Enable:**
```bash
LOGROCKET_APP_ID=your_app_id_here
LOGROCKET_LOG_LEVEL=warn            # Optional, default: warn
```

**Setup Steps:**

1. **Get LogRocket App ID:**
   - Go to https://logrocket.com
   - Create a project or select existing
   - Copy the App ID from project settings

2. **Install LogRocket Transport (if needed):**
   ```bash
   npm install pino-logrocket
   ```

3. **Set Environment Variables:**
   ```bash
   LOGROCKET_APP_ID=your_app_id
   ```

4. **Verify:**
   - Check LogRocket dashboard
   - Look for server-side logs

---

### 5. Custom HTTP Transport (Optional)

**Enable:**
```bash
PINO_HTTP_ENABLED=true
PINO_HTTP_URL=https://your-log-endpoint.com/api/logs
PINO_HTTP_METHOD=POST               # Optional, default: POST
PINO_HTTP_LEVEL=info                 # Optional, default: info
PINO_HTTP_HEADERS='{"Authorization":"Bearer token"}'  # Optional, JSON string
```

**Use Cases:**
- Custom log aggregation service
- Internal logging API
- Webhook-based log forwarding

**Example:**
```bash
export PINO_HTTP_ENABLED=true
export PINO_HTTP_URL=https://api.example.com/logs
export PINO_HTTP_HEADERS='{"Authorization":"Bearer abc123","X-API-Key":"xyz"}'
```

---

## 🔧 Configuration Examples

### Development (Pretty Console Only)

```bash
# .env.local
NODE_ENV=development
LOG_LEVEL=debug
# No transport config = console only with pretty printing
```

### Production (Console + Datadog)

```bash
# Vercel Environment Variables
NODE_ENV=production
LOG_LEVEL=info
DATADOG_API_KEY=your_key
DATADOG_SITE=us1
DATADOG_SERVICE=hookahplus-app
```

### Production (Console + File + Datadog)

```bash
NODE_ENV=production
LOG_LEVEL=info
PINO_FILE_ENABLED=true
PINO_FILE_PATH=/var/log/app.log
DATADOG_API_KEY=your_key
DATADOG_SITE=us1
```

### Full Stack (All Transports)

```bash
NODE_ENV=production
LOG_LEVEL=info

# File
PINO_FILE_ENABLED=true
PINO_FILE_PATH=./logs/app.log

# Datadog
DATADOG_API_KEY=your_key
DATADOG_SITE=us1
DATADOG_SERVICE=hookahplus-app

# LogRocket
LOGROCKET_APP_ID=your_app_id

# Custom HTTP
PINO_HTTP_ENABLED=true
PINO_HTTP_URL=https://api.example.com/logs
```

---

## 📝 Usage

### No Code Changes Required!

The transport system is automatic. Just set environment variables:

```typescript
import { logger } from '@/lib/logger';

// This log will go to all enabled transports automatically
logger.info('User logged in', { userId: '123', component: 'auth' });
```

### Check Active Transports

```typescript
import { getTransportSummary } from '@/lib/logger-pino-transports';

const { enabled, configured } = getTransportSummary();
console.log('Enabled transports:', enabled);
console.log('Configured transports:', configured);
```

---

## 🎯 Transport Priority & Levels

### Log Level Hierarchy

Each transport can have its own log level:

```bash
LOG_LEVEL=debug              # Base logger level
PINO_FILE_LEVEL=info         # File transport level
DATADOG_LOG_LEVEL=warn       # Datadog transport level
LOGROCKET_LOG_LEVEL=error   # LogRocket transport level
```

**Example:**
- Base logger: `debug` (logs everything)
- File: `info` (logs info, warn, error)
- Datadog: `warn` (logs warn, error only)
- LogRocket: `error` (logs error only)

This allows you to:
- Keep detailed logs locally (file)
- Send important logs to Datadog (warn+)
- Send critical logs to LogRocket (error only)

---

## 🚀 Performance Considerations

### Async & Non-Blocking

- All transports are **non-blocking**
- HTTP transports use async fetch (don't block logging)
- File writes are buffered
- Console output is immediate

### Overhead

- **Console:** Minimal (stdout)
- **File:** Low (buffered writes)
- **Datadog:** Medium (HTTP request, async)
- **LogRocket:** Medium (HTTP request, async)
- **HTTP:** Medium (HTTP request, async)

### Best Practices

1. **Use appropriate log levels** - Don't send debug logs to external services
2. **Limit transports in production** - Use 1-2 transports max
3. **Monitor transport health** - Check if logs are reaching destinations
4. **Use log sampling** - For high-volume scenarios

---

## 🧪 Testing Transports

### Test Console Transport

```typescript
import { logger } from '@/lib/logger';

logger.info('Test console log');
// Should appear in terminal/console
```

### Test File Transport

```bash
# Enable file transport
export PINO_FILE_ENABLED=true
export PINO_FILE_PATH=./test.log

# Run app and log something
# Check ./test.log file
```

### Test Datadog Transport

```bash
# Enable Datadog
export DATADOG_API_KEY=your_key
export DATADOG_SITE=us1

# Log something
logger.info('Test Datadog log');

# Check Datadog Logs Explorer
```

### Test HTTP Transport

```bash
# Use a test endpoint like webhook.site
export PINO_HTTP_ENABLED=true
export PINO_HTTP_URL=https://webhook.site/your-unique-id

# Log something
logger.info('Test HTTP log');

# Check webhook.site for received logs
```

---

## 📊 Transport Summary

| Transport | Status | Config | Use Case |
|-----------|--------|--------|----------|
| **Console** | ✅ Always | None | Development, Vercel Logs |
| **File** | ⚙️ Optional | `PINO_FILE_ENABLED` | Local logs, self-hosted |
| **Datadog** | ⚙️ Optional | `DATADOG_API_KEY` | Production log aggregation |
| **LogRocket** | ⚙️ Optional | `LOGROCKET_APP_ID` | Session replay + logs |
| **HTTP** | ⚙️ Optional | `PINO_HTTP_ENABLED` | Custom endpoints |

---

## 🔍 Troubleshooting

### Logs Not Appearing in Datadog

1. **Check API key:**
   ```bash
   echo $DATADOG_API_KEY
   ```

2. **Verify site:**
   ```bash
   echo $DATADOG_SITE  # Should be us1, us3, eu, or ap1
   ```

3. **Check log level:**
   ```bash
   echo $DATADOG_LOG_LEVEL  # Should be <= your LOG_LEVEL
   ```

4. **Test manually:**
   ```bash
   curl -X POST "https://http-intake.logs.datadoghq.com/v1/input/${DATADOG_API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"message":"test","service":"hookahplus-app"}'
   ```

### File Transport Not Working

1. **Check permissions:**
   ```bash
   ls -la logs/  # Directory should be writable
   ```

2. **Check path:**
   ```bash
   echo $PINO_FILE_PATH
   ```

3. **Create directory:**
   ```bash
   mkdir -p logs
   ```

### HTTP Transport Failing Silently

- HTTP transport failures are **silent** (non-blocking)
- Check network connectivity
- Verify endpoint accepts POST requests
- Check authentication headers

---

## ✅ Summary

**Status:** ✅ **Pino transports configured and ready!**

- ✅ Multistream support for multiple destinations
- ✅ Environment-based configuration
- ✅ Console, File, Datadog, LogRocket, HTTP transports
- ✅ Zero code changes required
- ✅ Production-ready with performance optimizations

**Set environment variables to enable transports - no code changes needed!** 🚀

