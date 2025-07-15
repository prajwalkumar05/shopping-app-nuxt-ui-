// plugins/backendMimic.client.js
export default defineNuxtPlugin(() => {
  if (process.server) return

  const backendMimic = {
    // Send a test notification to public channel
    sendTestNotification(message = 'Test notification') {
      const data = {
        id: Date.now(),
        message: message,
        timestamp: new Date().toISOString(),
        type: 'test'
      }
      
      this.broadcast('notifications', 'NotificationSent', data)
    },
    
    // Send a private notification to a specific user
    sendPrivateNotification(userId, message = 'Private notification') {
      const data = {
        id: Date.now(),
        message: message,
        timestamp: new Date().toISOString(),
        type: 'private',
        userId: userId
      }
      
      this.broadcastPrivate(`user.${userId}`, 'PrivateNotificationSent', data)
    },
    
    // Send any custom event to public channel
    sendCustomEvent(channel, event, data) {
      this.broadcast(channel, event, data)
    },
    
    // Broadcast to public channel listeners
    broadcast(channelName, eventName, data) {
      const { $echo } = useNuxtApp()
      
      //Find listeners for this specific channel and event
      if ($echo?.channels?.[channelName]?.listeners?.[eventName]) {

        // Get the arr off callback functions
        const listeners = $echo.channels[channelName].listeners[eventName]
        
        console.log(`Sending ${eventName} to public ${channelName}:`, data)

        // Call each callback function with the notification data
        listeners.forEach(listener => {
          try {
            listener(data)
          } catch (error) {
            console.error('Error in public listener:', error)
          }
        })
      } else {
        console.log(`No listeners for public ${channelName}.${eventName}`)
      }
    },
    
    // Broadcast to private channel listeners
    broadcastPrivate(channelName, eventName, data) {
      const { $echo } = useNuxtApp()
      const privateChannelName = `private-${channelName}`
      
      if ($echo?.privateChannels?.[privateChannelName]?.listeners?.[eventName]) {
        const listeners = $echo.privateChannels[privateChannelName].listeners[eventName]
        
        console.log(`Sending ${eventName} to private ${channelName}:`, data)
        
        listeners.forEach(listener => {
          try {
            listener(data)
          } catch (error) {
            console.error('Error in private listener:', error)
          }
        })
      } else {
        console.log(`No listeners for private ${channelName}.${eventName}`)
      }
    }
  }
  
  // Make available globally
  if (typeof window !== 'undefined') {
    window.backendMimic = backendMimic
    console.log('Backend Mimic ready!')
  }
  
  return {
    provide: { backendMimic }
  }
})