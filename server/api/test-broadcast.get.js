export default defineEventHandler(async (event) => {
  console.log('Test backend endpoint called')
  
  // Set headers for Server-Sent Events
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')

  const stream = new ReadableStream({
    start(controller) {
      console.log('Frontend connected to test broadcasts')

      // Send immediate test message
      const welcomeMessage = {
        type: 'connection_test',
        data: { message: 'Test backend is working!', timestamp: new Date().toISOString() }
      }
      
      const welcomeEvent = `data: ${JSON.stringify(welcomeMessage)}\n\n`
      controller.enqueue(new TextEncoder().encode(welcomeEvent))
      console.log('Sent welcome message')

      // Send test broadcasts every 5 seconds
      const interval = setInterval(() => {
        const broadcasts = [
          {
            type: 'user_created',
            data: { 
              id: Math.floor(Math.random() * 1000), 
              name: `Test User ${Math.floor(Math.random() * 100)}`, 
              email: `user${Math.floor(Math.random() * 100)}@test.com` 
            }
          },
          {
            type: 'order_updated', 
            data: { 
              orderId: Math.floor(Math.random() * 1000), 
              status: 'shipped', 
              customer: 'Test Customer' 
            }
          },
          {
            type: 'notification',
            data: { 
              message: 'Test notification message', 
              level: 'info',
              timestamp: new Date().toISOString()
            }
          }
        ]

        const broadcast = broadcasts[Math.floor(Math.random() * broadcasts.length)]
        const message = `data: ${JSON.stringify(broadcast)}\n\n`
        controller.enqueue(new TextEncoder().encode(message))
        
        console.log('Sent test broadcast:', broadcast.type)
      }, 5000)

      // Cleanup when frontend disconnects
      event.node.req.on('close', () => {
        clearInterval(interval)
        console.log('Frontend disconnected from test backend')
      })
      
      event.node.req.on('error', (err) => {
        console.error('Backend error:', err)
        clearInterval(interval)
      })
    }
  })

  return stream
})