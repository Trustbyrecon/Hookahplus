# Performance Testing Scripts

Performance testing suite for Hookah+ application.

## Scripts

### 1. Load Test (`load-test.ts`)
Tests concurrent session creation and API performance under load.

**Usage:**
```bash
npx tsx scripts/performance/load-test.ts [concurrency] [baseUrl]
```

**Example:**
```bash
npx tsx scripts/performance/load-test.ts 100 http://localhost:3002
```

**Tests:**
- Concurrent session creation (10, 50, 100, 500)
- Response time metrics
- Success/error rates
- Performance thresholds

---

### 2. API Performance Test (`api-test.ts`)
Tests all major API endpoints response times.

**Usage:**
```bash
npx tsx scripts/performance/api-test.ts [baseUrl]
```

**Example:**
```bash
npx tsx scripts/performance/api-test.ts http://localhost:3002
```

**Tests:**
- Health check endpoint
- Session creation/retrieval
- Analytics endpoints
- Revenue endpoints
- KTL-4 health check

**Metrics:**
- Response time per endpoint
- Success rate
- 95th percentile response time
- Performance assessment

---

### 3. Timer Performance Test (`timer-test.ts`)
Tests real-time timer updates with multiple active sessions.

**Usage:**
```bash
npx tsx scripts/performance/timer-test.ts [baseUrl] [sessionCount]
```

**Example:**
```bash
npx tsx scripts/performance/timer-test.ts http://localhost:3002 50
```

**Tests:**
- Timer update frequency
- Memory usage with many active sessions
- Update accuracy
- Concurrent timer handling

---

### 4. Run All Tests (`run-all.ts`)
Executes all performance tests and generates comprehensive report.

**Usage:**
```bash
npx tsx scripts/performance/run-all.ts [baseUrl]
```

**Example:**
```bash
BASE_URL=http://localhost:3002 SAVE_REPORT=true npx tsx scripts/performance/run-all.ts
```

**Output:**
- Combined test results
- Performance summary
- Recommendations
- Optional JSON report file

---

## Performance Thresholds

### Response Times
- **Excellent:** < 200ms
- **Good:** < 500ms
- **Acceptable:** < 1000ms
- **Needs Improvement:** > 1000ms

### Load Test Targets
- **10 concurrent:** 100% success rate
- **50 concurrent:** > 95% success rate
- **100 concurrent:** > 90% success rate
- **500 concurrent:** > 80% success rate

### Timer Performance
- **Update Frequency:** > 1 update/second per session
- **Accuracy:** > 90% consistent updates
- **Memory:** < 1MB per active session

---

## Environment Variables

- `BASE_URL`: Base URL for API (default: `http://localhost:3002`)
- `SAVE_REPORT`: Save JSON report file (default: `false`)

---

## Running Tests

### Local Development
```bash
cd apps/app
npx tsx scripts/performance/run-all.ts
```

### Production Testing
```bash
BASE_URL=https://your-production-url.com npx tsx scripts/performance/run-all.ts
```

### CI/CD Integration
```bash
BASE_URL=$API_URL SAVE_REPORT=true npx tsx scripts/performance/run-all.ts
```

---

## Interpreting Results

### Load Test Results
- **Success Rate:** Percentage of successful requests
- **Avg Response Time:** Average time for all requests
- **Min/Max:** Fastest and slowest response times
- **Errors:** List of unique error messages

### API Test Results
- **Status Codes:** HTTP response codes
- **Response Times:** Time to first byte
- **95th Percentile:** 95% of requests faster than this

### Timer Test Results
- **Update Frequency:** Updates per second across all sessions
- **Memory Usage:** Estimated memory per session
- **Accuracy:** Percentage of successful updates

---

## Troubleshooting

### High Response Times
1. Check database query performance
2. Verify indexes are in place
3. Check for N+1 query problems
4. Review API endpoint logic

### High Error Rates
1. Check server logs
2. Verify database connections
3. Check rate limiting
4. Review error handling

### Timer Accuracy Issues
1. Check WebSocket/SSE connections
2. Verify real-time update mechanism
3. Check for memory leaks
4. Review timer calculation logic

---

## Next Steps

1. **Baseline Metrics:** Run tests to establish baseline
2. **Optimize:** Address any performance issues
3. **Re-test:** Verify improvements
4. **Monitor:** Set up continuous performance monitoring

