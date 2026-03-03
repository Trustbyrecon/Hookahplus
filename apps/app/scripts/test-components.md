# Component Testing Guide

## Overview
Component testing validates React components render correctly and handle user interactions.

## Manual Testing Checklist

### Priority 1: Table Layout Components

#### TableSelector Component
- [ ] **Renders correctly**
  - [ ] Shows table list when tables exist
  - [ ] Shows empty state when no tables
  - [ ] Displays table capacity
  - [ ] Shows availability status (available/occupied/reserved)
  - [ ] Shows capacity warnings

- [ ] **Filtering works**
  - [ ] Search filters tables by name
  - [ ] Type filter works (bar/booth/table/vip)
  - [ ] Availability filter works
  - [ ] Capacity filter works

- [ ] **Selection works**
  - [ ] Click selects table
  - [ ] Selected table highlighted
  - [ ] onTableSelect callback fires

- [ ] **Real-time updates**
  - [ ] Updates when sessions change
  - [ ] Availability status updates
  - [ ] Capacity warnings update

#### CreateSessionModal Component
- [ ] **Form validation**
  - [ ] Validates tableId required
  - [ ] Validates customer name required
  - [ ] Validates capacity
  - [ ] Shows helpful error messages
  - [ ] Prevents submission on errors

- [ ] **Table selection**
  - [ ] TableSelector integrated
  - [ ] Selected table displayed
  - [ ] Capacity validation works
  - [ ] Suggestions shown for alternatives

- [ ] **Submission**
  - [ ] Creates session on valid submit
  - [ ] Shows loading state
  - [ ] Handles errors gracefully
  - [ ] Closes modal on success

### Priority 2: Analytics Components

#### LoungeHeatMap Component
- [ ] **Rendering**
  - [ ] Renders heat map with tables
  - [ ] Colors reflect metric values
  - [ ] Legend displays correctly
  - [ ] Handles empty data

- [ ] **Interactions**
  - [ ] Click on table triggers callback
  - [ ] Hover shows tooltip
  - [ ] Metric toggle updates colors

- [ ] **Metrics**
  - [ ] Revenue heat map works
  - [ ] Utilization heat map works
  - [ ] Sessions heat map works

#### TableAnalytics Component
- [ ] **Metrics display**
  - [ ] Shows summary metrics
  - [ ] Shows table metrics
  - [ ] Shows zone metrics
  - [ ] Formats numbers correctly

- [ ] **Interactions**
  - [ ] Table selection works
  - [ ] Zone expansion works
  - [ ] Sorting works

- [ ] **Historical trends**
  - [ ] Week-over-week comparison displays
  - [ ] Peak hours chart displays
  - [ ] Day-of-week trends display
  - [ ] Daily trends display

#### HistoricalTrends Component
- [ ] **Rendering**
  - [ ] Week-over-week comparison renders
  - [ ] Peak hours list renders
  - [ ] Day-of-week trends render
  - [ ] Daily trends render

- [ ] **Data display**
  - [ ] Trend indicators show correctly
  - [ ] Percentages formatted correctly
  - [ ] Charts render correctly
  - [ ] Handles missing data

### Priority 3: Availability Components

#### Table Availability Indicators
- [ ] **Status display**
  - [ ] Available status shows green
  - [ ] Occupied status shows red
  - [ ] Reserved status shows yellow
  - [ ] Maintenance status shows gray

- [ ] **Capacity warnings**
  - [ ] Shows warning for small tables
  - [ ] Shows capacity info
  - [ ] Suggests alternatives

### Priority 4: Zone Components

#### ZoneAnalytics Component
- [ ] **Workload display**
  - [ ] Shows zone workloads
  - [ ] Status indicators work
  - [ ] Utilization bars render
  - [ ] Staff count displays

- [ ] **Metrics display**
  - [ ] Revenue per zone
  - [ ] Utilization per zone
  - [ ] Staff efficiency
  - [ ] Performance comparisons

- [ ] **Interactions**
  - [ ] Zone cards clickable
  - [ ] Details expandable
  - [ ] Filters work

### Priority 5: Unified Dashboard

#### UnifiedDashboard Component
- [ ] **Metrics cards**
  - [ ] Revenue card displays
  - [ ] Sessions card displays
  - [ ] Tables card displays
  - [ ] Staff card displays
  - [ ] Trend indicators work

- [ ] **Insights section**
  - [ ] Cross-system insights display
  - [ ] Priority badges show
  - [ ] Recommendations display
  - [ ] Handles empty insights

- [ ] **Forecasts section**
  - [ ] Predictive forecasts display
  - [ ] Confidence levels show
  - [ ] Recommendations display
  - [ ] Factors listed

- [ ] **Top performers**
  - [ ] Top tables list displays
  - [ ] Top staff list displays
  - [ ] Rankings correct
  - [ ] Metrics formatted

- [ ] **Zone performance**
  - [ ] Zone cards display
  - [ ] Metrics show correctly
  - [ ] Comparisons work

- [ ] **Peak hours**
  - [ ] Peak hours list displays
  - [ ] Utilization bars render
  - [ ] Sorted correctly

## Automated Testing (Future)

### Component Test Structure
```typescript
// Example: TableSelector.test.tsx
describe('TableSelector', () => {
  it('renders table list', () => {
    // Test rendering
  });
  
  it('filters tables by search', () => {
    // Test filtering
  });
  
  it('handles table selection', () => {
    // Test selection
  });
});
```

### Testing Tools
- React Testing Library
- Jest
- Playwright (for E2E)

## Test Execution

### Manual Testing
1. Start dev server: `npm run dev`
2. Navigate to each page
3. Test each component interaction
4. Verify data displays correctly
5. Test error states
6. Test loading states

### Automated Testing (Future)
```bash
# Unit tests
npm test

# Component tests
npm run test:components

# E2E tests
npm run test:e2e
```

## Test Data Requirements

### Test Layout
- 10+ tables
- 3+ zones (Main, VIP, Outdoor)
- Various capacities (2-8)
- Various types (table, booth, bar)

### Test Sessions
- Active sessions
- Completed sessions
- Various states
- Various tables

### Test Staff
- Multiple FOH staff
- Multiple BOH staff
- Various zones
- Various loads

