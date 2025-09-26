import type { TrustGraphNode, ReflexEvent } from '../../types/reflex';

interface TrustGraph {
  nodes: Map<string, TrustGraphNode>;
  edges: Map<string, string[]>; // nodeId -> [dependentNodeIds]
}

class TrustGraphManager {
  private graph: TrustGraph;
  private readonly decayFactor = 0.95; // How much to decay reliability over time
  private readonly minReliability = 0.1; // Minimum reliability threshold

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map()
    };
  }

  /**
   * Add or update a node in the trust graph
   */
  addNode(node: TrustGraphNode): void {
    this.graph.nodes.set(node.id, { ...node });
  }

  /**
   * Get a node from the trust graph
   */
  getNode(id: string): TrustGraphNode | undefined {
    return this.graph.nodes.get(id);
  }

  /**
   * Add a dependency edge between two nodes
   */
  addDependency(fromNodeId: string, toNodeId: string): void {
    if (!this.graph.edges.has(fromNodeId)) {
      this.graph.edges.set(fromNodeId, []);
    }
    
    const dependencies = this.graph.edges.get(fromNodeId)!;
    if (!dependencies.includes(toNodeId)) {
      dependencies.push(toNodeId);
    }
  }

  /**
   * Update node reliability based on success/failure
   */
  updateReliability(nodeId: string, success: boolean, weight: number = 1.0): void {
    const node = this.graph.nodes.get(nodeId);
    if (!node) return;

    const { successCount, failureCount } = node;
    
    if (success) {
      node.successCount += weight;
    } else {
      node.failureCount += weight;
    }

    // Calculate new reliability using exponential moving average
    const totalEvents = node.successCount + node.failureCount;
    if (totalEvents > 0) {
      node.reliability = node.successCount / totalEvents;
    }

    // Apply time decay
    const timeSinceUpdate = Date.now() - new Date(node.lastUpdated).getTime();
    const hoursSinceUpdate = timeSinceUpdate / (1000 * 60 * 60);
    if (hoursSinceUpdate > 1) {
      node.reliability *= Math.pow(this.decayFactor, hoursSinceUpdate);
      node.reliability = Math.max(node.reliability, this.minReliability);
    }

    node.lastUpdated = new Date().toISOString();
    this.graph.nodes.set(nodeId, node);
  }

  /**
   * Process a reflex event and update the trust graph
   */
  processReflexEvent(event: ReflexEvent): void {
    const { route, action, score, outcome } = event;
    const nodeId = `${route}:${action}`;
    
    // Ensure node exists
    if (!this.graph.nodes.has(nodeId)) {
      this.addNode({
        id: nodeId,
        type: 'route',
        reliability: 0.5,
        lastUpdated: new Date().toISOString(),
        failureCount: 0,
        successCount: 0,
        dependencies: []
      });
    }

    // Update reliability based on outcome
    const success = outcome === 'proceed';
    const weight = score; // Use score as weight (higher score = more confidence)
    this.updateReliability(nodeId, success, weight);

    // Update dependent nodes
    this.updateDependentNodes(nodeId, success, weight);
  }

  /**
   * Update nodes that depend on the given node
   */
  private updateDependentNodes(nodeId: string, success: boolean, weight: number): void {
    const dependencies = this.graph.edges.get(nodeId) || [];
    
    for (const depNodeId of dependencies) {
      const depNode = this.graph.nodes.get(depNodeId);
      if (!depNode) continue;

      // Dependent nodes are affected by their dependencies
      // If dependency fails, dependent reliability decreases
      // If dependency succeeds, dependent reliability increases slightly
      const adjustment = success ? 0.1 : -0.2;
      const newReliability = Math.max(
        this.minReliability,
        Math.min(1.0, depNode.reliability + adjustment * weight)
      );
      
      depNode.reliability = newReliability;
      depNode.lastUpdated = new Date().toISOString();
      this.graph.nodes.set(depNodeId, depNode);
    }
  }

  /**
   * Get the reliability of a node
   */
  getReliability(nodeId: string): number {
    const node = this.graph.nodes.get(nodeId);
    return node?.reliability || 0.5; // Default to neutral
  }

  /**
   * Get all nodes with reliability below a threshold
   */
  getUnreliableNodes(threshold: number = 0.7): TrustGraphNode[] {
    return Array.from(this.graph.nodes.values())
      .filter(node => node.reliability < threshold)
      .sort((a, b) => a.reliability - b.reliability);
  }

  /**
   * Get the most reliable nodes
   */
  getMostReliableNodes(limit: number = 10): TrustGraphNode[] {
    return Array.from(this.graph.nodes.values())
      .sort((a, b) => b.reliability - a.reliability)
      .slice(0, limit);
  }

  /**
   * Calculate the overall system health
   */
  getSystemHealth(): {
    averageReliability: number;
    unreliableCount: number;
    totalNodes: number;
    healthScore: number;
  } {
    const nodes = Array.from(this.graph.nodes.values());
    const totalNodes = nodes.length;
    
    if (totalNodes === 0) {
      return {
        averageReliability: 0.5,
        unreliableCount: 0,
        totalNodes: 0,
        healthScore: 0.5
      };
    }

    const averageReliability = nodes.reduce((sum, node) => sum + node.reliability, 0) / totalNodes;
    const unreliableCount = nodes.filter(node => node.reliability < 0.7).length;
    
    // Health score: higher is better, penalizes unreliable nodes
    const healthScore = averageReliability * (1 - (unreliableCount / totalNodes) * 0.5);
    
    return {
      averageReliability,
      unreliableCount,
      totalNodes,
      healthScore: Math.max(0, Math.min(1, healthScore))
    };
  }

  /**
   * Get nodes that need attention (low reliability or high failure rate)
   */
  getNodesNeedingAttention(): TrustGraphNode[] {
    return Array.from(this.graph.nodes.values())
      .filter(node => {
        const totalEvents = node.successCount + node.failureCount;
        const failureRate = totalEvents > 0 ? node.failureCount / totalEvents : 0;
        
        return node.reliability < 0.6 || failureRate > 0.3;
      })
      .sort((a, b) => a.reliability - b.reliability);
  }

  /**
   * Export the trust graph for analysis
   */
  exportGraph(): {
    nodes: TrustGraphNode[];
    edges: Record<string, string[]>;
    health: ReturnType<TrustGraphManager['getSystemHealth']>;
  } {
    return {
      nodes: Array.from(this.graph.nodes.values()),
      edges: Object.fromEntries(this.graph.edges),
      health: this.getSystemHealth()
    };
  }

  /**
   * Clear the trust graph
   */
  clear(): void {
    this.graph = {
      nodes: new Map(),
      edges: new Map()
    };
  }
}

// Export singleton instance
export const trustGraph = new TrustGraphManager();

// Export the class for testing
export { TrustGraphManager };
