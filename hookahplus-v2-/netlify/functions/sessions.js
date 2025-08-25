// Netlify Function for session management
// This enables real-time data sync across Admin Control Center, Dashboard, and Sessions pages

const sessions = new Map();
let sessionCounter = 0;

// Initialize with demo data
function initializeDemoData() {
  if (sessions.size === 0) {
    // Create demo sessions
    for (let i = 1; i <= 10; i++) {
      const sessionId = `demo-${i}`;
      const session = {
        id: sessionId,
        tableId: `T-${i}`,
        state: 'PAID_CONFIRMED',
        flavor: ['Blue Mist + Mint', 'Double Apple', 'Grape + Mint'][Math.floor(Math.random() * 3)],
        amount: [3000, 5000, 7000][Math.floor(Math.random() * 3)],
        customer: `Customer ${i}`,
        payment: { status: 'completed', amount: [30, 50, 70][Math.floor(Math.random() * 3)] },
        timers: {
          deliveryBuffer: [5, 10, 15][Math.floor(Math.random() * 3)],
          lastActivity: Date.now()
        },
        meta: {
          deliveryZone: ['Zone A', 'Zone B', 'Zone C'][Math.floor(Math.random() * 3)],
          prepNotes: `Prep notes for session ${i}`,
          customerId: `cust_${i}`
        },
        created: Date.now() - (i * 60000), // Stagger creation times
        audit: []
      };
      sessions.set(sessionId, session);
    }
  }
}

// Initialize demo data on first load
initializeDemoData();

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/api/sessions')) {
          // Get all sessions
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
              success: true,
              sessions: Array.from(sessions.values()),
              count: sessions.size
            })
          };
        }
        break;
        
      case 'POST':
        if (path.includes('/api/sessions')) {
          const data = JSON.parse(body || '{}');
          
          if (data.action === 'seed') {
            // Seed demo sessions
            initializeDemoData();
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({
                success: true,
                message: 'Demo sessions seeded',
                sessions: Array.from(sessions.values())
              })
            };
          }
          
          if (data.action === 'command') {
            // Handle session commands
            const { sessionId, cmd, data: cmdData, actor } = data;
            const session = sessions.get(sessionId);
            
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
