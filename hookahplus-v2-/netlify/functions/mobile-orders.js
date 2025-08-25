// Netlify Function for mobile order management
// This enables mobile order timer and syncs with all dashboards

const mobileOrders = new Map();
let orderCounter = 0;

// Initialize with demo mobile orders
function initializeMobileOrders() {
  if (mobileOrders.size === 0) {
    // Create demo mobile orders
    for (let i = 1; i <= 5; i++) {
      const orderId = `mobile-${i}`;
      const order = {
        id: orderId,
        tableId: `T-${i}`,
        flavor: ['Blue Mist + Mint', 'Double Apple', 'Grape + Mint'][Math.floor(Math.random() * 3)],
        amount: [3000, 5000, 7000][Math.floor(Math.random() * 3)],
        status: ['pending', 'preparing', 'ready', 'delivered'][Math.floor(Math.random() * 4)],
        customer: `Mobile Customer ${i}`,
        created: Date.now() - (i * 30000), // Stagger creation times
        timer: 60, // 60 second timer
        deliveryZone: ['Zone A', 'Zone B', 'Zone C'][Math.floor(Math.random() * 3)],
        prepNotes: `Mobile order prep notes ${i}`
      };
      mobileOrders.set(orderId, order);
    }
  }
}

// Initialize mobile orders on first load
initializeMobileOrders();

exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/api/mobile-orders')) {
          // Get all mobile orders
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
              success: true,
              orders: Array.from(mobileOrders.values()),
              count: mobileOrders.size
            })
          };
        }
        break;
        
      case 'POST':
        if (path.includes('/api/mobile-orders')) {
          const data = JSON.parse(body || '{}');
          
          if (data.action === 'start-timer') {
            // Start mobile order timer
            const { duration = 60 } = data;
            const timerId = setInterval(() => {
              // Timer logic would go here in a real implementation
              console.log(`Mobile order timer running: ${duration}s`);
            }, 1000);
            
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({
                success: true,
                message: 'Mobile order timer started',
                duration,
                timerId
              })
            };
          }
          
          if (data.action === 'create-order') {
            // Create new mobile order
            const { tableId, flavor, amount, customer } = data;
            orderCounter++;
            const orderId = `mobile-${Date.now()}-${orderCounter}`;
            
            const newOrder = {
              id: orderId,
              tableId,
              flavor,
              amount,
              status: 'pending',
              customer,
              created: Date.now(),
              timer: 60,
              deliveryZone: 'Zone A',
              prepNotes: ''
            };
            
            mobileOrders.set(orderId, newOrder);
            
            return {
              statusCode: 201,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({
                success: true,
                order: newOrder,
                message: 'Mobile order created successfully'
              })
            };
          }
          
          if (data.action === 'update-status') {
            // Update order status
            const { orderId, status } = data;
            const order = mobileOrders.get(orderId);
            
            if (!order) {
              return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Order not found' })
              };
            }
            
            order.status = status;
            order.updated = Date.now();
            
            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({
                success: true,
                order,
                message: 'Order status updated successfully'
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
