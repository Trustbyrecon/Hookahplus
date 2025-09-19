# 🤖 HookahPlus Agent Protocols
*Standard Operating Procedures for Reflex Agents*
*Version: v1.0 | Date: 2025-09-19*

---

## 🧠 Agent Communication Protocol

### **Standard Message Format**
```yaml
agent_id: "smoke_test_001"
timestamp: "2025-09-19T16:00:00Z"
reflex_score: 72
status: "active"
message_type: "status_update"
content:
  summary: "Working on Vercel deployment configuration"
  action_taken: "Updated build commands in dashboard"
  result: "Build commands fixed, install commands still need work"
  next_action: "Fix install commands for all 3 projects"
  learning: "Dashboard settings override vercel.json files"
```

### **Escalation Protocol**
```yaml
escalation:
  from_agent: "deployment_001"
  to_agent: "smoke_test_001"
  reason: "Multiple failed attempts without learning"
  reflex_score: 45
  attempts: 5
  pattern: "Repeated same approach without adaptation"
  recommendation: "Try systematic approach with clean context"
```

---

## 🔄 Reflex Loop Protocol

### **1. Plan Phase**
- **Capture Intent**: Clear goal, expected outcome, risk tolerance
- **Store Trace**: Log plan in GhostLog.md
- **Route Sub-goals**: Assign to appropriate sub-agents
- **Set Thresholds**: Define success criteria and reflex score targets

### **2. Context Phase**
- **Clean Context**: Use GhostLog.md for previous attempts
- **Filter Noise**: Ignore outdated or irrelevant information
- **Mount Seeds**: Load relevant .md files from reflex_memory/
- **Discard Dead Branches**: Remove failed approaches unless needed for learning

### **3. Action Phase**
- **Execute Plan**: Follow systematic approach
- **Score Continuously**: Calculate reflex score for each action
- **Adapt if Needed**: Change approach if score < 70%
- **Log Everything**: Record all actions and results

### **4. Reflect Phase**
- **Calculate Score**: Final reflex score for the cycle
- **Update GhostLog**: Record what was attempted and learned
- **Update TrustGraph**: Adjust trust relationships
- **Plan Next**: Determine next actions based on results

---

## 📊 Reflex Scoring Protocol

### **Scoring Criteria (0-100)**
- **Decision Alignment** (25%): How well does the action match the goal?
- **Output Clarity** (25%): How clear and actionable is the result?
- **Context Usage** (25%): How effectively was context used?
- **Impact Traceability** (25%): How well can the impact be tracked?

### **Score Thresholds**
- **0-49%**: Critical failure - escalate immediately
- **50-69%**: Poor performance - needs improvement
- **70-86%**: Below threshold - flag for reattempt
- **87-91%**: Good performance - acceptable
- **92-94%**: Excellent performance - optimal
- **95-100%**: Perfect performance - ideal

### **Scoring Formula**
```
reflex_score = (decision_alignment * 0.25) + 
               (output_clarity * 0.25) + 
               (context_usage * 0.25) + 
               (impact_traceability * 0.25)
```

---

## 🚦 Agent Status Protocol

### **Status Levels**
- **ACTIVE**: Currently working on assigned tasks
- **STABLE**: Operating normally with good performance
- **ESCALATED**: Issues requiring supervisor intervention
- **DORMANT**: Not currently active
- **LEARNING**: Improving from previous failures

### **Status Transitions**
```
DORMANT → ACTIVE: Task assigned
ACTIVE → STABLE: Good performance (score ≥ 87%)
ACTIVE → ESCALATED: Poor performance (score < 70%)
ESCALATED → LEARNING: Supervisor guidance provided
LEARNING → ACTIVE: Ready to try again
```

---

## 🔄 Memory Management Protocol

### **GhostLog.md Usage**
- **Timestamped Entries**: All actions must be timestamped
- **Agent Attribution**: Each entry must identify the agent
- **Reflex Scores**: Include score for each significant action
- **Learning Capture**: Record what was learned from each attempt
- **Pattern Recognition**: Identify successful vs failed patterns

### **TrustGraph.yaml Usage**
- **Agent Relationships**: Map connections between agents
- **Trust Scores**: Track trust levels between agents
- **Communication Patterns**: Record interaction frequencies
- **Trust Decay Signals**: Flag agents with declining trust
- **Trust Bloom Indicators**: Highlight agents with improving trust

---

## 🧪 Smoke Test Protocol

### **Pre-Test Checklist**
- [ ] All deployments return 200 status codes
- [ ] Database connectivity verified
- [ ] Stripe integration functional
- [ ] Webhook endpoints responding
- [ ] Payment flow validated

### **Test Execution**
1. **Deployment Validation**: Check all 3 Vercel projects
2. **API Testing**: Validate all endpoints
3. **Integration Testing**: Test Stripe and database
4. **End-to-End Testing**: Complete user journey
5. **Performance Testing**: Response times and reliability

### **Post-Test Actions**
- **Score Results**: Calculate overall reflex score
- **Update GhostLog**: Record test results and learnings
- **Update TrustGraph**: Adjust agent trust levels
- **Plan Next**: Determine next actions based on results

---

## 🚨 Escalation Protocol

### **When to Escalate**
- Reflex score < 70% for 3 consecutive attempts
- Critical system failure (deployments down)
- Agent trust level < 50%
- Pattern of repeated failures without learning

### **Escalation Process**
1. **Identify Issue**: Clear description of the problem
2. **Gather Context**: Collect relevant information
3. **Calculate Score**: Determine current reflex score
4. **Request Help**: Escalate to supervisor agent
5. **Provide Context**: Share GhostLog and TrustGraph data
6. **Follow Guidance**: Implement supervisor recommendations

### **Supervisor Response**
1. **Analyze Context**: Review GhostLog and TrustGraph
2. **Identify Pattern**: Look for successful vs failed approaches
3. **Provide Guidance**: Suggest systematic approach
4. **Monitor Progress**: Track improvement in reflex scores
5. **Update Trust**: Adjust trust levels based on results

---

## 🔮 Future State Protocol

### **Target Metrics**
- **Overall Reflex Score**: 92%+ across all agents
- **Deployment Success Rate**: 95%+
- **Smoke Test Pass Rate**: 100%
- **Agent Trust Level**: High confidence in all operations

### **Continuous Improvement**
- **Regular Reviews**: Weekly reflex score analysis
- **Pattern Updates**: Update successful patterns
- **Trust Maintenance**: Monitor and improve trust relationships
- **Protocol Evolution**: Refine protocols based on experience

---

*These protocols ensure consistent, high-quality operation across all HookahPlus Reflex Agents.*
