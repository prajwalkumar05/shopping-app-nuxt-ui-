// composables/useEchoMockBackend.js
// Simple mock backend that works with your existing useEcho

export const useEchoMockBackend = () => {
  const isActive = ref(false)
  
  // BroadcastChannel for cross-tab communication
  let broadcastChannel = null
  
  if (process.client) {
    broadcastChannel = new BroadcastChannel('echo-mock-backend')
    
    // Listen for notifications from other tabs
    broadcastChannel.onmessage = (event) => {
      const { type, data } = event.data
      if (type === 'notification') {
        // Directly add to any existing useEcho notifications array
        const echoInstances = window.__echoNotifications || []
        echoInstances.forEach(notifications => {
          notifications.value.unshift(data)
        })
      }
    }
  }

  // Register useEcho notifications array so mock can update it
  const registerEchoNotifications = (notifications) => {
    if (!window.__echoNotifications) {
      window.__echoNotifications = []
    }
    window.__echoNotifications.push(notifications)
    console.log('Mock: Registered Echo notifications array')
  }

  // Start the mock backend
  const startMock = () => {
    if (isActive.value) return
    
    isActive.value = true
    console.log('Mock Backend: Started')
  }

  // Stop the mock backend
  const stopMock = () => {
    if (!isActive.value) return
    
    isActive.value = false
    if (window.__echoNotifications) {
      window.__echoNotifications.length = 0
    }
    console.log('Mock Backend: Stopped')
  }

  // Send notification (simulates backend broadcasting)
  const sendNotification = (title, message, type = 'info') => {
    const notification = {
      id: Date.now() + Math.random(),
      title,
      message,
      type,
      timestamp: new Date().toISOString()
    }

    console.log('Mock Backend: Broadcasting notification:', notification)

    // Add to local Echo notifications
    if (window.__echoNotifications) {
      window.__echoNotifications.forEach(notifications => {
        notifications.value.unshift(notification)
      })
    }

    // Broadcast to other tabs
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'notification',
        data: notification
      })
    }

    return notification
  }

  // Quick notification helpers
  const sendInfoNotification = (title, message) => {
    return sendNotification(title, message, 'info')
  }

  const sendSuccessNotification = (title, message) => {
    return sendNotification(title, message, 'success')
  }

  const sendWarningNotification = (title, message) => {
    return sendNotification(title, message, 'warning')
  }

  const sendErrorNotification = (title, message) => {
    return sendNotification(title, message, 'error')
  }

  // Auto notification sender
  const startAutoNotifications = (interval = 3000) => {
    let counter = 1
    
    const intervalId = setInterval(() => {
      if (isActive.value) {
        const types = ['info', 'success', 'warning', 'error']
        const type = types[Math.floor(Math.random() * types.length)]
        
        sendNotification(
          `Auto Notification ${counter}`,
          `This is automatic notification #${counter} sent at ${new Date().toLocaleTimeString()}`,
          type
        )
        counter++
      }
    }, interval)
    
    return intervalId
  }

  const stopAutoNotifications = (intervalId) => {
    if (intervalId) {
      clearInterval(intervalId)
    }
  }

  // Cleanup
  onUnmounted(() => {
    if (broadcastChannel) {
      broadcastChannel.close()
    }
  })

  return {
    isActive: readonly(isActive),
    startMock,
    stopMock,
    registerEchoNotifications,
    sendNotification,
    sendInfoNotification,
    sendSuccessNotification,
    sendWarningNotification,
    sendErrorNotification,
    startAutoNotifications,
    stopAutoNotifications
  }
}