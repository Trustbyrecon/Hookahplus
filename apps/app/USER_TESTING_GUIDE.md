# 🧪 **Hookah+ User Testing Guide**

## **Overview**
This guide provides comprehensive testing scenarios for the Hookah+ system, covering the complete customer journey from landing to session completion.

## **Prerequisites**
- Access to the deployed application: `https://hookahplus-mh3dqnal9-dwaynes-projects-1c5c280a.vercel.app`
- Test environment with `NEXT_PUBLIC_PRETTY_THEME=1` enabled
- Admin test token for $1 Stripe testing

## **Test Scenarios**

### **1. Landing Page Testing**

#### **Scenario 1.1: Pretty Theme Display**
- **URL**: `/`
- **Expected**: Beautiful gradient background with hero section, reflex cards, and quick access grid
- **Test Steps**:
  1. Navigate to landing page
  2. Verify gradient background is visible
  3. Check for "Hookah+" hero title with gradient text
  4. Confirm "Powered by Reflex Intelligence" cards are displayed
  5. Verify Quick Access grid with 8 cards is visible
  6. Check for HiTrust TU+ badge and primary CTAs

#### **Scenario 1.2: Navigation Testing**
- **Test Steps**:
  1. Click "Pre-Order Station" button
  2. Verify navigation to `/preorder/T-001`
  3. Click "Live Dashboard" button
  4. Verify navigation to `/fire-session-dashboard`
  5. Test all Quick Access cards for proper navigation

### **2. Pre-Order Station Testing**

#### **Scenario 2.1: Pre-Order Page Display**
- **URL**: `/preorder/T-001`
- **Expected**: Pretty theme with menu items, test mode, and live session status
- **Test Steps**:
  1. Navigate to preorder page
  2. Verify pretty theme is applied (gradient background, cards)
  3. Check for "Table T-001" header
  4. Verify menu items are displayed with proper styling
  5. Check for "Test Mode ($1.00)" banner
  6. Verify "Run $1 Stripe test" button is visible

#### **Scenario 2.2: $1 Stripe Test**
- **Test Steps**:
  1. Click "Run $1 Stripe test" button
  2. Verify API call is made to `/api/payments/live-test`
  3. Check for success/error message display
  4. Verify Stripe sandbox shows $1 charge
  5. Test error handling with invalid credentials

#### **Scenario 2.3: Menu Interaction**
- **Test Steps**:
  1. Click "Quick Add" buttons on menu items
  2. Verify items are added to cart (if cart system implemented)
  3. Test category filtering (Hookah, Drinks, Food, Desserts)
  4. Verify price display and formatting

### **3. Fire Session Dashboard Testing**

#### **Scenario 3.1: Dashboard Display**
- **URL**: `/fire-session-dashboard`
- **Expected**: Complete dashboard with metrics, sessions, and create modal
- **Test Steps**:
  1. Navigate to fire session dashboard
  2. Verify pretty theme is applied
  3. Check for metrics grid (Active Sessions, Revenue, etc.)
  4. Verify "NEW Create Session" button is prominent
  5. Check for session list with proper styling
  6. Verify filter tabs (Overview, BOH, FOH, Edge Cases)

#### **Scenario 3.2: Create New Session Modal**
- **Test Steps**:
  1. Click "NEW Create Session" button
  2. Verify modal opens with proper styling
  3. Test form validation:
     - Try submitting with empty required fields
     - Verify error messages appear
     - Test with valid data
  4. Fill out form completely:
     - Table ID: T-015
     - Customer Name: John Smith
     - Phone: +1 (555) 123-4567
     - Session Type: Walk-in
     - Flavor: Blue Mist
     - Amount: $30
     - Assign BOH Staff: Mike Rodriguez
     - Assign FOH Staff: John Smith
     - Session Notes: "Customer requested extra mint"
  5. Click "NEW Create Session" button
  6. Verify session is created and appears in list
  7. Verify session has status "CREATED" and team "BOH"

#### **Scenario 3.3: Session Management Workflow**
- **Test Steps**:
  1. Create a new session (as above)
  2. Verify session appears in BOH tab
  3. Test BOH workflow:
     - Click "Start Prep" button
     - Verify status changes to "PREP_IN_PROGRESS"
     - Click "Heat Up" button
     - Verify status changes to "HEAT_UP"
     - Click "Ready for Delivery" button
     - Verify status changes to "READY_FOR_DELIVERY"
  4. Switch to FOH tab
  5. Test FOH workflow:
     - Click "Deliver & Start Session" button
     - Verify status changes to "SESSION_ACTIVE"
     - Click "Request Refill" button
     - Verify status changes to "REQUEST_REFILL"

#### **Scenario 3.4: Session Notes Testing**
- **Test Steps**:
  1. Click "More" button on any session
  2. Click "Add Note" from dropdown
  3. Verify notes modal opens
  4. Test different note types:
     - General note
     - Issue note
     - Resolution note
     - Customer Request note
  5. Add notes and verify they appear in session details
  6. Test note author tracking and timestamps

#### **Scenario 3.5: Edge Case Management**
- **Test Steps**:
  1. Create a session with equipment issue
  2. Click "Flag Manager" button
  3. Verify session moves to Edge Cases tab
  4. Test "Resolve Issue" button
  5. Test "Hold Session" functionality
  6. Verify proper status changes and team assignments

### **4. Mobile Responsiveness Testing**

#### **Scenario 4.1: Mobile Layout**
- **Test Steps**:
  1. Open browser developer tools
  2. Set device to mobile (iPhone/Android)
  3. Test all pages for proper mobile layout
  4. Verify touch interactions work properly
  5. Check for proper button sizing and spacing

### **5. Error Handling Testing**

#### **Scenario 5.1: API Error Handling**
- **Test Steps**:
  1. Test with invalid Stripe credentials
  2. Test with network connectivity issues
  3. Verify proper error messages are displayed
  4. Test form validation errors
  5. Verify graceful degradation

## **Expected Results**

### **Pretty Theme Features**
- ✅ Gradient backgrounds on all pages
- ✅ Card-based layouts with proper shadows
- ✅ Teal/cyan color scheme throughout
- ✅ Smooth animations and hover effects
- ✅ Professional typography and spacing

### **Session Management Features**
- ✅ Complete BOH/FOH workflow
- ✅ Dynamic button states based on session status
- ✅ Proper team separation (BOH sees BOH actions, FOH sees FOH actions)
- ✅ Session notes with categorization
- ✅ Edge case handling and escalation

### **User Experience Features**
- ✅ Intuitive navigation between pages
- ✅ Clear visual feedback for all actions
- ✅ Responsive design for all screen sizes
- ✅ Proper loading states and error handling
- ✅ Professional, production-ready appearance

## **Bug Reporting**

When reporting bugs, please include:
1. **Page URL** where the issue occurred
2. **Steps to reproduce** the issue
3. **Expected behavior** vs actual behavior
4. **Screenshot** if applicable
5. **Browser and device** information
6. **Console errors** if any

## **Success Criteria**

The system passes user testing when:
- ✅ All pretty theme elements display correctly
- ✅ Create New Session modal works completely
- ✅ Session workflow functions end-to-end
- ✅ All buttons respond appropriately to status changes
- ✅ Mobile experience is smooth and intuitive
- ✅ Error handling is graceful and informative
- ✅ Performance is fast and responsive

## **Next Steps After Testing**

1. **Fix any identified bugs**
2. **Optimize performance** based on testing feedback
3. **Refine UX** based on user feedback
4. **Deploy to production** with confidence
5. **Train staff** on the new system
6. **Monitor usage** and gather feedback

---

**Ready for comprehensive user testing!** 🚀
