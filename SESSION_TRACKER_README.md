# Enhanced Live Session Tracker

## Overview
The enhanced live session tracker now includes advanced customer profile management, intelligent refill handling with automatic timers, comprehensive flavor mix library system, and ScreenCoder integration for lounge layout visualization. Designed for network ecosystem value across multiple lounges.

## New Features

### 1. Smart Refill Functionality with Auto-Timer
- **Status Management**: When a session status changes to "Needs refill", the Refill button transforms to "Complete Refill" (green)
- **Automatic Reset**: Clicking "Complete Refill" automatically resets the status back to "Active"
- **10-Second Auto-Timer**: If refill is not completed within 10 seconds, status automatically changes to "Coal Burnt Out" (red)
- **Visual Countdown**: Real-time countdown timer showing seconds remaining before auto-burnout
- **Color-Coded Timer**: Timer changes color (orange → yellow → red) as time runs out

### 2. Customer Profile Metadata
- **Customer Name Display**: Shows customer name in the top right of each session card
- **Default Fallback**: Displays "Staff Customer" when no customer profile is assigned
- **Profile Information**: 
  - Customer ID for cross-lounge identification
  - Favorite flavors and preferences
  - Session duration preferences
  - Add-on flavor preferences
  - Staff notes and observations

### 3. Enhanced Flavor Selection System
- **Flavor Mix Library**: Access to popular flavor combinations based on usage data
- **Customer History**: Previous 3 sessions for returning customers
- **Smart Recommendations**: AI-powered suggestions based on customer preferences
- **Custom Flavor Input**: Ability to add new flavor combinations

### 4. Network Ecosystem Integration
- **Cross-Lounge Profiles**: Customer preferences follow them across different locations
- **POS Integration Ready**: Compatible with Clover, Toast, and other POS systems
- **Data Portability**: Customer metadata can be shared between lounges
- **Loyalty Tracking**: Session history and preferences for enhanced customer experience

### 5. ScreenCoder Lounge Layout Integration
- **Visual Lounge Map**: Top-down view of the lounge with bar and table positions
- **Table Type Mapping**: Support for 6 table types:
  - High Boy (2 seats)
  - Standard Tables (4 seats)
  - 2x Booths (2 seats)
  - 4x Booths (4 seats)
  - 8x Sectionals (8 seats)
  - 4x Sofas (4 seats)
- **Interactive Tables**: Hover over tables to see session details
- **Click Navigation**: Click tables to scroll to corresponding session cards
- **Real-time Status**: Tables change color based on session status
- **Position Coordinates**: X/Y coordinates for precise table placement

### 6. Enhanced UI Layout
- **Session Summary Relocation**: Moved below header for better visibility
- **Table Type Display**: Each session card shows table type with color coding
- **ScreenCoder Info**: Position coordinates displayed on each session card
- **Smooth Scrolling**: Click tables in layout to navigate to session details

## Technical Implementation

### Backend Changes
- **Enhanced Order Type**: Added customer profile fields, table mapping, and refill timer tracking
- **New API Endpoints**: 
  - `handle_refill`: Manages refill status reset
  - `get_flavor_suggestions`: Provides flavor recommendations
- **Customer Management**: Functions for retrieving customer history and preferences
- **Auto-Timer System**: Automatic status change after 10 seconds of refill status

### Frontend Components
- **Session Dashboard**: Enhanced with customer profile display and table type information
- **Customer Profile Manager**: Standalone component for managing customer data
- **Flavor Selection Modal**: Advanced flavor selection interface
- **Lounge Layout Component**: Interactive lounge map with ScreenCoder integration
- **Refill Timer Display**: Real-time countdown with color-coded warnings
- **Responsive Design**: Mobile-friendly interface for staff use

### Data Structure
```typescript
interface CustomerProfile {
  id: string;                    // Unique identifier across lounges
  name: string;                  // Customer display name
  preferences: {
    favoriteFlavors?: string[];   // Preferred base flavors
    sessionDuration?: number;     // Typical session length
    addOnPreferences?: string[];  // Preferred add-ons
    notes?: string;               // Staff observations
  };
  previousSessions?: string[];    // Session history
}

interface TableMapping {
  tableType: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition: { x: number; y: number };
  refillTimerStart?: number;     // For auto-burnout functionality
}
```

## Usage Instructions

### For Staff
1. **Monitor Sessions**: View all active sessions with real-time status updates
2. **Handle Refills**: Click "Refill" when coal needs attention, then "Complete Refill" when done
3. **Watch Timer**: Monitor the 10-second countdown to prevent auto-burnout
4. **Add Flavors**: Use the enhanced flavor selection system for customer requests
5. **Navigate Layout**: Use the lounge layout to quickly find and manage tables
6. **Manage Profiles**: Access customer profile manager for preference updates

### For Managers
1. **Customer Insights**: View customer preferences and session patterns
2. **Flavor Analytics**: Monitor popular flavor combinations
3. **Network Data**: Prepare customer data for cross-lounge sharing
4. **Staff Training**: Use the system to train new staff on customer preferences
5. **Lounge Optimization**: Visualize table usage and optimize seating arrangements

## API Endpoints

### GET /api/sessions
Returns all active sessions with customer profile data and table mapping

### POST /api/sessions
- **action: 'handle_refill'**: Resets session status from "needs_refill" to "active"
- **action: 'get_flavor_suggestions'**: Returns flavor library and customer history
- **action: 'add_flavor'**: Adds new flavor to existing session
- **action: 'update_coal_status'**: Updates session coal status (triggers auto-timer)

## Demo Data
The system includes comprehensive demo data generation:
- 20-30 realistic orders over 2-hour periods
- 5 sample customer profiles with preferences
- 8 table configurations with positions and types
- Simulated session management and status changes
- Flavor combination tracking
- Auto-timer simulation for refill scenarios

## ScreenCoder Integration

### Table Types and Capacities
- **High Boy (HB)**: 2 seats, compact standing tables
- **Standard Tables (T)**: 4 seats, traditional dining tables
- **2x Booths (2B)**: 2 seats, intimate booth seating
- **4x Booths (4B)**: 4 seats, group booth seating
- **8x Sectionals (8S)**: 8 seats, large group seating
- **4x Sofas (4S)**: 4 seats, comfortable lounge seating

### Layout Features
- **Bar Positioning**: Top-center placement for easy access
- **Table Coordinates**: X/Y positioning for precise layout mapping
- **Status Visualization**: Color-coded tables based on session status
- **Interactive Elements**: Hover tooltips and click navigation
- **Responsive Design**: Adapts to different screen sizes

## Future Enhancements
- **Loyalty Program Integration**: Points and rewards system
- **Advanced Analytics**: Customer behavior insights and table utilization
- **Mobile App**: Staff mobile interface with push notifications
- **POS Sync**: Real-time integration with POS systems
- **Multi-Location**: Centralized customer database and cross-location analytics
- **AI-Powered Insights**: Predictive analytics for table management
- **Real-time Collaboration**: Staff communication and coordination tools

## Network Ecosystem Value
This system provides significant value for multi-location hookah lounges:
- **Customer Retention**: Personalized experiences across locations
- **Staff Efficiency**: Quick access to customer preferences and table status
- **Data Insights**: Understanding of flavor trends, customer behavior, and table utilization
- **Competitive Advantage**: Enhanced customer experience through personalization and efficient service
- **Scalability**: Easy expansion to new locations with shared customer data and proven layouts
- **Operational Excellence**: Automated timers prevent service delays and improve consistency

## Installation
1. Ensure all dependencies are installed
2. Run the demo data generation endpoint to populate sample data
3. Access the sessions page to view the enhanced tracker
4. Use the customer profile manager to create and edit customer profiles
5. Explore the lounge layout for ScreenCoder integration
6. Test the refill timer functionality with demo sessions

## Support
For technical support or feature requests, refer to the main project documentation or contact the development team.
