# Context Engineering Guide
*HookahPlus Agent Architecture - Context Management Best Practices*

**Based on:** [Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Core Principles](#core-principles)
3. [Context Compression](#context-compression)
4. [Context Degradation Prevention](#context-degradation-prevention)
5. [Multi-Agent Context Sharing](#multi-agent-context-sharing)
6. [Memory System Optimization](#memory-system-optimization)
7. [Implementation Examples](#implementation-examples)
8. [Monitoring & Metrics](#monitoring--metrics)

---

## Overview

Context engineering is the discipline of managing the language model's context window efficiently. Unlike prompt engineering, which focuses on crafting effective instructions, context engineering addresses the holistic curation of all information that enters the model's limited attention budget.

### The Challenge

Context windows are constrained not by raw token capacity but by attention mechanics. As context length increases, models exhibit predictable degradation patterns:

- **Lost-in-the-Middle**: Critical information placed in the middle of long contexts is often missed
- **U-Shaped Attention Curves**: Models pay more attention to the beginning and end
- **Attention Scarcity**: As context grows, attention is spread thinner

### Our Solution

Effective context engineering means finding the smallest possible set of high-signal tokens that maximize the likelihood of desired outcomes. This guide documents our implementation of context engineering principles across the HookahPlus agent architecture.

---

## Core Principles

### 1. Progressive Disclosure

**Principle**: Load only essential context at startup, activate full content only when needed.

**Implementation**:
- Skill names and descriptions loaded first
- Full skill content loaded only when skill is activated
- Context seeds from `reflex_memory/` mounted only when relevant

**Example**:
```typescript
// Load metadata first
const skillMetadata = await loadSkillMetadata('context-compression');

// Load full content only when needed
if (shouldActivateSkill(skillMetadata)) {
  const fullContent = await loadSkillContent('context-compression');
}
```

### 2. Context Compression

**Principle**: Compress long-running sessions and historical data to summaries.

**Implementation**:
- Compress session histories > 10 interactions
- Summarize Reflex Chain outputs after processing
- Archive old GhostLog entries (>30 days) to summaries

**Example**:
```typescript
// Compress Reflex Chain flow
const compressed = reflexChainEngine.compressFlow(sessionId, {
  compressAfterLayers: 2,
  preserveCriticalData: true,
});

// Result: 70-80% size reduction while preserving critical data
```

### 3. Context Degradation Prevention

**Principle**: Monitor for degradation patterns and place critical information strategically.

**Implementation**:
- Place critical information at start and end of context
- Use structured formats (YAML, JSON) for key data
- Monitor for "lost-in-the-middle" patterns

**Example**:
```typescript
// Good: Critical data at start
const context = {
  // Critical data first
  sessionId: '...',
  trustScore: 95,
  status: 'active',
  
  // Detailed data in middle
  history: [...],
  
  // Summary at end
  summary: '...'
};

// Bad: Critical data in middle
const context = {
  metadata: {...},
  history: [...], // Critical data buried here
  summary: '...'
};
```

### 4. Multi-Agent Context Sharing

**Principle**: Share compressed summaries between agents, avoid duplicating full context.

**Implementation**:
- Use TrustGraph for context-aware routing
- Share compressed summaries, not full context
- Use agent-specific context limits

**Example**:
```typescript
// Share compressed context
const compressedContext = {
  context_type: 'compressed',
  compression_level: 3,
  summary: '...',
  critical_data: {...}
};

// Agent receives compressed version
await sendToAgent('aliethia', compressedContext);
```

---

## Context Compression

### Reflex Chain Compression

The Reflex Chain engine includes built-in compression for completed flows:

```typescript
// Compress a flow
const compressed = reflexChainEngine.compressFlow(sessionId, {
  compressAfterLayers: 2,
  preserveCriticalData: true,
  archiveAfterHours: 24,
});

// Result structure
{
  sessionId: '...',
  currentLayer: 'completed',
  summary: {
    status: 'completed',
    progress: 100,
    keyEvents: [...]
  },
  criticalData: {
    trustScore: 95,
    totalFlowTime: 300,
    transactionAmount: 2500,
    paymentStatus: 'completed',
    loyaltyIssued: true
  },
  compression: {
    compressedAt: 1234567890,
    originalSize: 10000,
    compressedSize: 2000,
    compressionRatio: 0.2
  }
}
```

### Compression Strategies

#### 1. Layer-Based Compression
- Compress after 2+ layers complete
- Keep only critical data from completed layers
- Preserve active layer data in full

#### 2. Time-Based Compression
- Compress flows older than 24 hours
- Archive flows older than 30 days
- Keep summaries for historical analysis

#### 3. Size-Based Compression
- Compress when flow size > 10KB
- Target 70-80% size reduction
- Preserve all critical data

### Compression Ratios

| Context Type | Original Size | Compressed Size | Ratio |
|-------------|---------------|-----------------|-------|
| Reflex Chain Flow | 10KB | 2KB | 0.2 |
| GhostLog Entry | 5KB | 1KB | 0.2 |
| Session History | 20KB | 4KB | 0.2 |
| Agent Message | 3KB | 1KB | 0.33 |

---

## Context Degradation Prevention

### Lost-in-the-Middle Detection

Monitor for patterns where critical information is placed in the middle of long contexts:

```typescript
function detectLostInMiddle(context: string, criticalData: string[]): boolean {
  const contextLength = context.length;
  const middleStart = contextLength * 0.3;
  const middleEnd = contextLength * 0.7;
  
  for (const data of criticalData) {
    const position = context.indexOf(data);
    if (position > middleStart && position < middleEnd) {
      return true; // Critical data in middle
    }
  }
  
  return false;
}
```

### Strategic Placement

**Best Practice**: Place critical information at start and end:

```typescript
// Good structure
const context = {
  // 1. Critical data at start (0-20%)
  sessionId: '...',
  trustScore: 95,
  status: 'active',
  
  // 2. Detailed data in middle (20-80%)
  history: [...],
  details: {...},
  
  // 3. Summary at end (80-100%)
  summary: '...',
  nextActions: [...]
};
```

### Structured Formats

Use structured formats for better parsing and attention:

```typescript
// Good: Structured format
const context = {
  metadata: {
    sessionId: '...',
    timestamp: 1234567890
  },
  data: {
    trustScore: 95,
    status: 'active'
  }
};

// Bad: Unstructured text
const context = "Session abc123 started at 1234567890 with trust score 95 and status active...";
```

---

## Multi-Agent Context Sharing

### Context Sharing Protocol

Agents share context using a standardized protocol:

```yaml
agent_id: "aliethia"
timestamp: "2025-01-27T12:00:00Z"
context_type: "compressed"
compression_level: 3
content:
  summary: "Reflex Chain flow completed"
  critical_data:
    trustScore: 95
    transactionAmount: 2500
  source: "reflex_chain"
  relevance: "high"
```

### Agent-Specific Limits

Each agent has context limits defined in `.cursorrules`:

| Agent | Max Context | Compression Level |
|-------|------------|------------------|
| Noor (session_agent) | 10KB | 2 |
| Aliethia (reflex_agent) | 8KB | 3 |
| EchoPrime (growth_agent) | 6KB | 3 |
| Lumi (pricing_agent) | 4KB | 4 |
| Jules (loyalty_agent) | 5KB | 3 |

### TrustGraph Routing

Use TrustGraph for context-aware routing:

```typescript
// Route context based on trust relationships
const targetAgent = trustGraph.findBestRoute(sourceAgent, contextType);

// Share compressed context
await shareContext(sourceAgent, targetAgent, compressedContext);
```

---

## Memory System Optimization

### GhostLog Management

**Archiving Rules**:
- **Last 50 Entries**: Keep in full detail
- **Entries 51-200**: Compress to summaries
- **Entries >200**: Archive to monthly files

**Implementation**:
```typescript
// Archive old entries
function archiveGhostLog() {
  const entries = loadGhostLogEntries();
  
  // Keep last 50 in full
  const recent = entries.slice(-50);
  
  // Compress 51-200
  const compressed = entries.slice(-200, -50).map(compressEntry);
  
  // Archive >200
  const archived = entries.slice(0, -200);
  archiveToMonthlyFile(archived);
  
  // Update GhostLog
  updateGhostLog([...recent, ...compressed]);
}
```

### Reflex Memory Seeds

Context seeds in `reflex_memory/` are loaded progressively:

```typescript
// Load metadata first
const seedMetadata = await loadSeedMetadata('AgentProtocols');

// Load full content only when skill activated
if (isSkillActivated('agent-protocols')) {
  const fullContent = await loadSeedContent('AgentProtocols');
}
```

### Caching Strategy

Cache compressed versions for reuse:

```typescript
// Check cache first
const cached = contextCache.get(sessionId);
if (cached && !isExpired(cached)) {
  return cached;
}

// Compress and cache
const compressed = compressFlow(flow);
contextCache.set(sessionId, compressed, { ttl: 3600 });
```

---

## Implementation Examples

### Example 1: Compressing Reflex Chain Flow

```typescript
import { reflexChainEngine } from './lib/reflex-chain/core';

// Get flow
const flow = reflexChainEngine.getFlow(sessionId);

// Compress if flow is completed or has enough layers
const compressed = reflexChainEngine.compressFlow(sessionId, {
  compressAfterLayers: 2,
  preserveCriticalData: true,
});

// Use compressed version for context sharing
await shareContext('noor', 'aliethia', compressed);
```

### Example 2: Archiving GhostLog

```typescript
// Archive old GhostLog entries
function archiveGhostLog() {
  const entries = parseGhostLog();
  
  if (entries.length > 200) {
    // Archive entries >200
    const toArchive = entries.slice(0, -200);
    const archiveFile = `reflex_memory/archives/${getCurrentMonth()}.md`;
    
    writeArchive(archiveFile, toArchive);
    
    // Update GhostLog with remaining entries
    const remaining = entries.slice(-200);
    updateGhostLog(remaining);
  }
}
```

### Example 3: Context Sharing Between Agents

```typescript
// Share context between agents
async function shareContext(
  fromAgent: string,
  toAgent: string,
  context: any
) {
  // Compress context
  const compressed = compressContext(context, {
    compression_level: getAgentCompressionLevel(toAgent),
    preserve_critical: true,
  });
  
  // Route via TrustGraph
  const route = trustGraph.findRoute(fromAgent, toAgent);
  
  // Send compressed context
  await sendToAgent(toAgent, {
    from: fromAgent,
    context_type: 'compressed',
    content: compressed,
    route: route,
  });
}
```

---

## Monitoring & Metrics

### Key Metrics

Track these metrics to monitor context engineering effectiveness:

1. **Context Size**: Average context size per operation
2. **Compression Ratio**: Average compression ratio achieved
3. **Context Hit Rate**: Percentage of cached vs fresh context
4. **Degradation Incidents**: Number of "lost-in-middle" detections
5. **Retrieval Time**: Time to retrieve/compress context

### Thresholds

Set these thresholds for alerts:

- **Warning**: Context size > 10KB
- **Critical**: Context size > 20KB
- **Archive**: GhostLog entries > 1000
- **Compress**: Session history > 20 actions

### Monitoring Dashboard

Create a dashboard to track:

```typescript
const metrics = {
  averageContextSize: calculateAverage(contextSizes),
  compressionRatio: calculateAverage(compressionRatios),
  cacheHitRate: calculateHitRate(cacheStats),
  degradationIncidents: countIncidents(degradationLog),
  averageRetrievalTime: calculateAverage(retrievalTimes),
};
```

---

## Best Practices Summary

### ✅ Do

- Load context progressively (metadata first)
- Compress long-running sessions
- Place critical data at start and end
- Use structured formats (JSON/YAML)
- Share compressed summaries between agents
- Archive old GhostLog entries regularly
- Monitor context size and compression ratios

### ❌ Don't

- Load full GhostLog for every operation
- Pass complete Reflex Chain flows between agents
- Include entire session histories in context
- Duplicate context across multiple agents
- Keep unlimited context growth
- Place critical data in middle of long contexts
- Use unstructured text for key data

---

## References

- [Agent Skills for Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)
- [Context Engineering Principles](.cursorrules)
- [Reflex Chain Implementation](../REFLEX_CHAIN_IMPLEMENTATION.md)
- [Agent Protocols](../reflex_memory/AgentProtocols.md)

---

*Last Updated: 2025-01-27*

