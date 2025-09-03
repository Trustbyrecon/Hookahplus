// lib/visualGrounder.ts
// Reflex Visual Grounder - Photo to Seating Map Conversion

export interface SeatingModule {
  type: 'bar_counter' | 'booth' | 'high_top' | 'communal' | 'lounge_cluster' | 'vip_alcove';
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  capacity: number;
  spacing: number;
  adaCompliant: boolean;
}

export interface SeatingPattern {
  name: string;
  modules: SeatingModule[];
  constraints: {
    minAisleWidth: number;
    turningSpace: number;
    occupancyPerSqFt: number;
  };
}

export interface DetectionTarget {
  class: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  metadata: Record<string, any>;
}

export interface LoungeSeed {
  lounge_id: string;
  name: string;
  defaults: {
    base_price_usd: number;
    session_timer_min: number;
    allow_qr_preorder: boolean;
  };
  hints?: {
    zones: string[];
    wheelchair_route_targets: string[];
  };
}

export class ReflexVisualGrounder {
  private seatingPatterns: Map<string, SeatingPattern> = new Map();
  private detectionClasses: string[] = [];
  private dimensionPriors: Map<string, number[]> = new Map();

  constructor() {
    this.initializeSeatingPatterns();
    this.initializeDetectionClasses();
    this.initializeDimensionPriors();
  }

  // Initialize core seating patterns for U.S. lounge/bar detection
  private initializeSeatingPatterns(): void {
    // Bar counter + stools pattern
    this.seatingPatterns.set('bar_counter', {
      name: 'Bar Counter + Stools',
      modules: [{
        type: 'bar_counter',
        dimensions: { width: 0, depth: 24, height: 42 }, // Variable width, standard depth/height
        capacity: 0, // Calculated based on length
        spacing: 8, // 6-8" spacing for stools
        adaCompliant: false
      }],
      constraints: {
        minAisleWidth: 36,
        turningSpace: 60,
        occupancyPerSqFt: 15
      }
    });

    // Booths & banquettes pattern
    this.seatingPatterns.set('booth_wall', {
      name: 'Booth Wall',
      modules: [{
        type: 'booth',
        dimensions: { width: 48, depth: 24, height: 34 }, // Single booth
        capacity: 4,
        spacing: 0,
        adaCompliant: false
      }],
      constraints: {
        minAisleWidth: 36,
        turningSpace: 60,
        occupancyPerSqFt: 15
      }
    });

    // High-tops / poseur tables
    this.seatingPatterns.set('high_top', {
      name: 'High-top Tables',
      modules: [{
        type: 'high_top',
        dimensions: { width: 30, depth: 30, height: 42 },
        capacity: 4,
        spacing: 36,
        adaCompliant: false
      }],
      constraints: {
        minAisleWidth: 36,
        turningSpace: 60,
        occupancyPerSqFt: 15
      }
    });

    // Lounge clusters
    this.seatingPatterns.set('lounge_cluster', {
      name: 'Lounge Cluster',
      modules: [{
        type: 'lounge_cluster',
        dimensions: { width: 72, depth: 48, height: 34 },
        capacity: 6,
        spacing: 48,
        adaCompliant: false
      }],
      constraints: {
        minAisleWidth: 36,
        turningSpace: 60,
        occupancyPerSqFt: 15
      }
    });
  }

  // Initialize detection classes for computer vision
  private initializeDetectionClasses(): void {
    this.detectionClasses = [
      // Fixtures
      'bar_counter', 'back_bar', 'service_counter', 'hostess_stand',
      // Tables
      'table_round_low', 'table_square_low', 'table_high', 'communal_table',
      // Seats
      'stool', 'chair', 'booth_single', 'booth_double', 'banquette', 'sofa', 'lounge_chair', 'ottoman',
      // Routes & markers
      'aisle', 'accessible_route', 'turning_circle', 'ramp', 'door', 'exit_sign',
      // Zones
      'bar_zone', 'lounge_zone', 'booth_zone', 'vip_zone', 'patio_zone',
      // Compliance cues
      'accessible_table', 'lowered_counter', 'obstruction'
    ];
  }

  // Initialize dimension priors for scale estimation
  private initializeDimensionPriors(): void {
    // Bar height vs counter height pairs
    this.dimensionPriors.set('bar_height', [40, 42]); // inches
    this.dimensionPriors.set('counter_height', [34, 36]); // inches
    
    // Stool heights
    this.dimensionPriors.set('stool_height_bar', [28, 33]); // for bar height
    this.dimensionPriors.set('stool_height_counter', [24, 27]); // for counter height
    
    // Stool spacing
    this.dimensionPriors.set('stool_spacing', [6, 11]); // inches
    
    // Booth dimensions
    this.dimensionPriors.set('booth_depth_single', [24, 24]);
    this.dimensionPriors.set('booth_depth_double', [49, 49]);
    this.dimensionPriors.set('booth_length', [30, 48]);
    
    // ADA requirements
    this.dimensionPriors.set('accessible_route_width', [36, 36]);
    this.dimensionPriors.set('turning_space_diameter', [60, 60]);
    this.dimensionPriors.set('dining_surface_height', [28, 34]);
    this.dimensionPriors.set('knee_clearance_height', [27, 27]);
    this.dimensionPriors.set('knee_clearance_width', [30, 30]);
    this.dimensionPriors.set('knee_clearance_depth', [17, 25]);
  }

  // Process photos and generate seating map
  public async processPhotos(photos: File[], seed: LoungeSeed): Promise<{
    seatingMap: SeatingMapData;
    routes: RoutesData;
    complianceReport: ComplianceReport;
    suggestions: string[];
  }> {
    console.log('🔍 Reflex Visual Grounder: Processing photos for', seed.name);
    
    // Simulate photo analysis (in production, this would use computer vision)
    const detections = await this.analyzePhotos(photos);
    
    // Generate seating map from detections
    const seatingMap = this.generateSeatingMap(detections, seed);
    
    // Generate routes and accessibility paths
    const routes = this.generateRoutes(detections, seatingMap);
    
    // Check compliance and generate report
    const complianceReport = this.checkCompliance(seatingMap, routes);
    
    // Generate owner suggestions
    const suggestions = this.generateSuggestions(complianceReport, seatingMap);
    
    return {
      seatingMap,
      routes,
      complianceReport,
      suggestions
    };
  }

  // Simulate photo analysis (replace with actual computer vision)
  private async analyzePhotos(photos: File[]): Promise<DetectionTarget[]> {
    // Mock detections based on common lounge patterns
    const mockDetections: DetectionTarget[] = [
      {
        class: 'bar_counter',
        confidence: 0.95,
        boundingBox: { x: 100, y: 200, width: 300, height: 50 },
        dimensions: { width: 300, height: 42, depth: 24 },
        metadata: { zone: 'bar_zone', length: 300 }
      },
      {
        class: 'stool',
        confidence: 0.90,
        boundingBox: { x: 120, y: 150, width: 20, height: 30 },
        dimensions: { width: 20, height: 30, depth: 20 },
        metadata: { zone: 'bar_zone', spacing: 8 }
      },
      {
        class: 'booth_single',
        confidence: 0.88,
        boundingBox: { x: 50, y: 100, width: 48, height: 24 },
        dimensions: { width: 48, height: 34, depth: 24 },
        metadata: { zone: 'booth_zone', capacity: 4 }
      },
      {
        class: 'table_high',
        confidence: 0.85,
        boundingBox: { x: 200, y: 300, width: 30, height: 30 },
        dimensions: { width: 30, height: 42, depth: 30 },
        metadata: { zone: 'lounge_zone', capacity: 4 }
      },
      {
        class: 'accessible_route',
        confidence: 0.92,
        boundingBox: { x: 150, y: 250, width: 40, height: 200 },
        metadata: { width: 40, compliant: true }
      }
    ];

    return mockDetections;
  }

  // Generate seating map from detections
  private generateSeatingMap(detections: DetectionTarget[], seed: LoungeSeed): SeatingMapData {
    const nodes: SeatingNode[] = [];
    const edges: SeatingEdge[] = [];
    let nodeId = 1;

    detections.forEach(detection => {
      if (this.isSeatingElement(detection.class)) {
        const node: SeatingNode = {
          id: `seat-${nodeId.toString().padStart(3, '0')}`,
          type: this.mapDetectionToSeatType(detection.class),
          position: {
            x: detection.boundingBox.x,
            y: detection.boundingBox.y
          },
          data: {
            zone: detection.metadata.zone || 'lounge_zone',
            capacity: detection.metadata.capacity || 1,
            ada_clear: detection.metadata.compliant || false,
            dim_in: {
              seat_h: detection.dimensions?.height || 30,
              ctr_h: detection.dimensions?.height || 34
            },
            tags: [detection.class],
            stripe_meta: {
              session_id: null,
              flavor_mix: null
            }
          }
        };
        nodes.push(node);
        nodeId++;
      }
    });

    return {
      lounge_id: seed.lounge_id,
      name: seed.name,
      nodes,
      edges,
      metadata: {
        total_capacity: nodes.reduce((sum, node) => sum + node.data.capacity, 0),
        zones: Array.from(new Set(nodes.map(node => node.data.zone))),
        generated_at: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  // Generate routes and accessibility paths
  private generateRoutes(detections: DetectionTarget[], seatingMap: SeatingMapData): RoutesData {
    const routes: Route[] = [];
    const accessiblePaths: AccessiblePath[] = [];

    // Find accessible routes from detections
    const routeDetections = detections.filter(d => d.class === 'accessible_route');
    
    routeDetections.forEach((route, index) => {
      const path: AccessiblePath = {
        id: `route-${index + 1}`,
        type: 'accessible_route',
        width: route.metadata.width || 36,
        compliant: route.metadata.compliant || false,
        waypoints: [
          { x: route.boundingBox.x, y: route.boundingBox.y },
          { x: route.boundingBox.x + route.boundingBox.width, y: route.boundingBox.y + route.boundingBox.height }
        ],
        constraints: {
          min_width: 36,
          turning_space: 60,
          clearance_height: 80
        }
      };
      accessiblePaths.push(path);
    });

    // Generate routes between key areas
    const keyRoutes = this.generateKeyRoutes(seatingMap);
    routes.push(...keyRoutes);

    return {
      lounge_id: seatingMap.lounge_id,
      routes,
      accessible_paths: accessiblePaths,
      compliance: {
        ada_compliant: accessiblePaths.every(path => path.compliant),
        violations: this.findRouteViolations(accessiblePaths),
        suggestions: this.generateRouteSuggestions(accessiblePaths)
      }
    };
  }

  // Check compliance and generate report
  private checkCompliance(seatingMap: SeatingMapData, routes: RoutesData): ComplianceReport {
    const violations: ComplianceViolation[] = [];
    const passes: CompliancePass[] = [];

    // Check accessible route widths
    routes.accessible_paths.forEach(path => {
      if (path.width < 36) {
        violations.push({
          type: 'accessible_route_width',
          severity: 'high',
          description: `Route ${path.id} is ${path.width}" wide, minimum required is 36"`,
          location: { x: path.waypoints[0].x, y: path.waypoints[0].y },
          fix: `Widen route to minimum 36" width`
        });
      } else {
        passes.push({
          type: 'accessible_route_width',
          description: `Route ${path.id} meets minimum width requirement`,
          location: { x: path.waypoints[0].x, y: path.waypoints[0].y }
        });
      }
    });

    // Check turning spaces
    const turningSpaces = routes.accessible_paths.filter(path => 
      path.waypoints.length > 2 && this.hasTurningSpace(path)
    );
    
    if (turningSpaces.length === 0) {
      violations.push({
        type: 'turning_space',
        severity: 'medium',
        description: 'No 60" diameter turning spaces detected in key areas',
        location: { x: 0, y: 0 },
        fix: 'Add turning spaces at route intersections and dead ends'
      });
    }

    // Check dining surface heights
    seatingMap.nodes.forEach(node => {
      if (node.data.dim_in.ctr_h < 28 || node.data.dim_in.ctr_h > 34) {
        violations.push({
          type: 'dining_surface_height',
          severity: 'medium',
          description: `Table ${node.id} height ${node.data.dim_in.ctr_h}" outside ADA range (28-34")`,
          location: node.position,
          fix: 'Adjust table height to 28-34" range or add accessible table'
        });
      }
    });

    return {
      lounge_id: seatingMap.lounge_id,
      generated_at: new Date().toISOString(),
      overall_compliance: violations.length === 0 ? 'compliant' : 'non_compliant',
      violations,
      passes,
      summary: {
        total_violations: violations.length,
        high_severity: violations.filter(v => v.severity === 'high').length,
        medium_severity: violations.filter(v => v.severity === 'medium').length,
        low_severity: violations.filter(v => v.severity === 'low').length
      }
    };
  }

  // Generate owner suggestions
  private generateSuggestions(complianceReport: ComplianceReport, seatingMap: SeatingMapData): string[] {
    const suggestions: string[] = [];

    // Check for missing lowered counter
    const hasLoweredCounter = seatingMap.nodes.some(node => 
      node.type === 'service_counter' && node.data.dim_in.ctr_h <= 36
    );
    
    if (!hasLoweredCounter) {
      suggestions.push('Add 1 lowered 36" counter segment at check-in for ADA compliance');
    }

    // Check for narrow aisles
    const narrowAisles = complianceReport.violations.filter(v => v.type === 'accessible_route_width');
    if (narrowAisles.length > 0) {
      suggestions.push(`Widen ${narrowAisles.length} aisle(s) to 36" minimum width`);
    }

    // Check for stool spacing
    const barStools = seatingMap.nodes.filter(node => node.type === 'stool');
    if (barStools.length > 0) {
      suggestions.push('Verify stool spacing meets 6-8" minimum for comfort and accessibility');
    }

    return suggestions;
  }

  // Helper methods
  private isSeatingElement(className: string): boolean {
    const seatingClasses = ['stool', 'chair', 'booth_single', 'booth_double', 'banquette', 'sofa', 'lounge_chair', 'ottoman', 'table_round_low', 'table_square_low', 'table_high', 'communal_table'];
    return seatingClasses.includes(className);
  }

  private mapDetectionToSeatType(className: string): string {
    const mapping: Record<string, string> = {
      'stool': 'seat.stool',
      'chair': 'seat.chair',
      'booth_single': 'seat.booth_single',
      'booth_double': 'seat.booth_double',
      'banquette': 'seat.banquette',
      'sofa': 'seat.sofa',
      'lounge_chair': 'seat.lounge_chair',
      'ottoman': 'seat.ottoman',
      'table_round_low': 'table.round_low',
      'table_square_low': 'table.square_low',
      'table_high': 'table.high',
      'communal_table': 'table.communal'
    };
    return mapping[className] || 'seat.unknown';
  }

  private generateKeyRoutes(seatingMap: SeatingMapData): Route[] {
    // Generate routes between key areas (bar, restroom, exit)
    return [
      {
        id: 'route-bar-restroom',
        type: 'service_route',
        waypoints: [
          { x: 100, y: 200 },
          { x: 400, y: 200 },
          { x: 400, y: 400 }
        ],
        width: 36,
        purpose: 'bar_to_restroom'
      },
      {
        id: 'route-entrance-exit',
        type: 'egress_route',
        waypoints: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 100 }
        ],
        width: 36,
        purpose: 'entrance_to_exit'
      }
    ];
  }

  private findRouteViolations(paths: AccessiblePath[]): string[] {
    return paths
      .filter(path => !path.compliant)
      .map(path => `Route ${path.id}: ${path.width}" width (minimum 36" required)`);
  }

  private generateRouteSuggestions(paths: AccessiblePath[]): string[] {
    const suggestions: string[] = [];
    const narrowPaths = paths.filter(path => path.width < 36);
    
    if (narrowPaths.length > 0) {
      suggestions.push(`Widen ${narrowPaths.length} route(s) to meet 36" minimum width`);
    }
    
    return suggestions;
  }

  private hasTurningSpace(path: AccessiblePath): boolean {
    // Check if path has sufficient turning space (simplified)
    return path.waypoints.length > 2;
  }

  // Export knowledge pack for other agents
  public exportKnowledgePack(): Record<string, any> {
    return {
      seating_types: [
        'bar_stool', 'dining_chair', 'booth_single', 'booth_double', 
        'banquette', 'sofa', 'lounge_chair', 'ottoman'
      ],
      table_types: ['low_round', 'low_square', 'high_round', 'communal'],
      zones: ['bar_zone', 'lounge_zone', 'booth_zone', 'vip_zone', 'patio_zone'],
      hard_rules: {
        accessible_route_width_in_min: 36,
        turning_space_diameter_in_min: 60,
        dining_surface_top_in: [28, 34],
        knee_clearance_in: { h_min: 27, w_min: 30, d_range: [17, 25] }
      },
      soft_heuristics: {
        stool_spacing_in: [6, 11],
        occupant_load_ft2_per_person: 15
      }
    };
  }
}

// Type definitions
export interface SeatingNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    zone: string;
    capacity: number;
    ada_clear: boolean;
    dim_in: { seat_h: number; ctr_h: number };
    tags: string[];
    stripe_meta: { session_id: string | null; flavor_mix: string | null };
  };
}

export interface SeatingEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: Record<string, any>;
}

export interface SeatingMapData {
  lounge_id: string;
  name: string;
  nodes: SeatingNode[];
  edges: SeatingEdge[];
  metadata: {
    total_capacity: number;
    zones: string[];
    generated_at: string;
    version: string;
  };
}

export interface Route {
  id: string;
  type: string;
  waypoints: { x: number; y: number }[];
  width: number;
  purpose: string;
}

export interface AccessiblePath {
  id: string;
  type: string;
  width: number;
  compliant: boolean;
  waypoints: { x: number; y: number }[];
  constraints: {
    min_width: number;
    turning_space: number;
    clearance_height: number;
  };
}

export interface RoutesData {
  lounge_id: string;
  routes: Route[];
  accessible_paths: AccessiblePath[];
  compliance: {
    ada_compliant: boolean;
    violations: string[];
    suggestions: string[];
  };
}

export interface ComplianceViolation {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  location: { x: number; y: number };
  fix: string;
}

export interface CompliancePass {
  type: string;
  description: string;
  location: { x: number; y: number };
}

export interface ComplianceReport {
  lounge_id: string;
  generated_at: string;
  overall_compliance: 'compliant' | 'non_compliant';
  violations: ComplianceViolation[];
  passes: CompliancePass[];
  summary: {
    total_violations: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
  };
}

// Singleton instance
export const visualGrounder = new ReflexVisualGrounder();
