// Netlify Function for fire session dashboard
// This enables real-time session state management and dashboard sync

const fireSessions = new Map();
let sessionCounter = 0;

// Initialize with demo fire sessions
function initializeFireSessions() {
  if (fireSessions.size === 0) {
    // Create demo fire sessions
    for (let i = 1; i <= 3; i++) {
      const sessionId = `fire-${i}`;
      const session = {
        id: sessionId,
        tableId: `T-${i}`,
        state: ['PAID_CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY'][Math.floor(Math.random() * 3)],
        flavor: ['Blue Mist + Mint', 'Double Apple', 'Grape + Mint'][Math.floor(Math.random() * 3)],
        amount: [3000, 5000, 7000][Math.floor(Math.random() * 3)],
        customer: `Fire Session Customer ${i}`,
        payment: { status: 'completed', amount: [30, 50, 70][Math.floor(Math.random() * 3)] },
        timers: {
          deliveryBuffer: [5, 10, 15][Math.floor(Math.random() * 3)],
          lastActivity: Date.now(),
          startTime: Date.now() - (i * 120000) // 2 min intervals
        },
        meta: {
          deliveryZone: ['Zone A', 'Zone B', 'Zone C'][Math.floor(Math.random() * 3)],
          prepNotes: `Fire session prep notes ${i}`,
          customerId: `fire_cust_${i}`,
          staffRole: ['foh', 'boh'][Math.floor(Math.random() * 2)]
        },
        created: Date.now() - (i * 180000), // 3 min intervals
        audit: []
      };
      fireSessions.set(sessionId, session);
    }
  }
}

// Initialize fire sessions on first load
initializeFireSessions();

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/api/fire-session')) {
          // Get all fire sessions
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
              success: true,
              sessions: Array.from(fireSessions.values()),
              count: fireSessions.size
            })
          };
        }
        break;
        
      case 'POST':
        if (path.includes('/api/fire-session')) {
          const data = JSON.parse(body || '{}');
          
          if (data.action === 'generate-floor-sessions') {
            // Generate floor sessions for demo
            const { sessionLimit = 3 } = data;
            
            // Clear existing sessions
            fireSessions.clear();
            
            // Generate new demo sessions
            for (let i = 1; i <= sessionLimit; i++) {
              const sessionId = `fire-${Date.now()}-${i}`;
              const session = {
                id: sessionId,
                tableId: `T-${i}`,
                state: ['PAID_CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY'][Math.floor(Math.random() * 3)],
                flavor: ['Blue Mist + Mint', 'Double Apple', 'Grape + Mint'][Math.floor(Math.random() * 3)],
                amount: [3000, 5000, 7000][Math.floor(Math.random() * 3)],
                customer: `Floor Session ${i}`,
                payment: { status: 'completed', amount: [30, 50, 70][Math.floor(Math.random() * 3)] },
                timers: {
                  deliveryBuffer: [5, 10, 15][Math.floor(Math.random() * 3)],
                  lastActivity: Date.now(),
                  startTime: Date.now()
                },
                meta: {
                  deliveryZone: ['Zone A', 'Zone B', 'Zone C'][Math.floor(Math.random() * 3)],
                  prepNotes: `Floor session ${i} prep notes`,
                  customerId: `floor_${i}`,
                  staffRole: ['foh', 'boh'][Math.floor(Math.random() * 2)]
                },
                created: Date.now(),
                audit: []
              };
              fireSessions.set(sessionId, session);
            }
            
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({
                success: true,
                message: `Generated ${sessionLimit} floor sessions`,
                sessions: Array.from(fireSessions.values())
              })
            };
          }
          
          if (data.action === 'execute-command') {
            // Execute session commands
            const { sessionId, cmd, data: cmdData, actor } = data;
            const session = fireSessions.get(sessionId);
            
            if (!session) {
              return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Session not found' })
              };
            }
            
            // Update session based on command
            switch (cmd) {
              case 'SET_DELIVERY_BUFFER':
                session.timers.deliveryBuffer = cmdData.buffer;
                break;
              case 'UPDATE_DELIVERY_ZONE':
                session.meta.deliveryZone = cmdData.zone;
                break;
              case 'ADD_PREP_NOTES':
                session.meta.prepNotes = cmdData.notes;
                break;
              case 'UPDATE_STATE':
                session.state = cmdData.state;
                break;
              case 'START_PREPARATION':
                session.state = 'PREPARING';
                session.timers.startTime = Date.now();
                break;
              case 'READY_FOR_DELIVERY':
                session.state = 'READY_FOR_DELIVERY';
                break;
              case 'DELIVERED':
                session.state = 'DELIVERED';
                break;
            }
            
            session.timers.lastActivity = Date.now();
            session.audit.push({
              timestamp: Date.now(),
              action: cmd,
              actor,
              data: cmdData
            });
            
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({
                success: true,
                session,
                message: 'Command executed successfully'
              })
            };
          }
        }
        break;
        
      case 'OPTIONS':
        // Handle CORS preflight
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          }
        };
    }
    
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Endpoint not found' })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
