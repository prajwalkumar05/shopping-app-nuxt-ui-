import { useNuxtApp } from "#app"
import { ref, computed } from "vue"

export const useReverb = () => {
  const { $pusher, $echo } = useNuxtApp()

  // Simple reactive state
  const connectionStatus = ref('disconnected')
  const activeChannels = new Map() // Store channels for cleanup
  
  // Computed properties
  const isConnected = computed(() => connectionStatus.value === 'connected')
  const connectionColor = computed(() => {
    const colors = {
      connected: 'bg-green-400',
      connecting: 'bg-yellow-400', 
      disconnected: 'bg-red-400'
    }
    return colors[connectionStatus.value] || 'bg-gray-400'
  })

  // ==========================================
  // CONNECTION SETUP (Auto-initializes)
  // ==========================================
  
  const initializeConnection = () => {
    if (!$pusher) return

    // Update status when connection changes
    const updateStatus = () => {
      connectionStatus.value = $pusher.connection.state
    }

    // Bind to connection events
    $pusher.connection.bind('connected', updateStatus)
    $pusher.connection.bind('disconnected', updateStatus)
    $pusher.connection.bind('connecting', updateStatus)
    $pusher.connection.bind('failed', updateStatus)

    // Set initial status
    updateStatus()
  }

  // ==========================================
  // PUBLIC CHANNELS (Simple)
  // ==========================================
  
  const subscribeToChannel = (channelName) => {
    // Clean up existing channel if any
    if (activeChannels.has(channelName)) {
      const existingChannel = activeChannels.get(channelName)
      existingChannel.unbind_all()
      $pusher.unsubscribe(channelName)
    }

    // Subscribe to channel
    const channel = $pusher.subscribe(channelName)
    activeChannels.set(channelName, channel)
    
    return channel
  }

  const listenToEvent = (channelName, eventName, callback) => {
    const channel = activeChannels.get(channelName)
    if (!channel) {
      return () => {}
    }

    // Bind event
    channel.bind(eventName, (data) => {
      callback(data)
    })

    // Return cleanup function
    return () => {
      channel.unbind(eventName, callback)
    }
  }

  // ==========================================
  // PRIVATE CHANNELS (Simple)
  // ==========================================
  
  const subscribeToPrivateChannel = (channelName) => {
    const cleanName = channelName.replace(/^private-/, '')
    const fullName = `private-${cleanName}`
    
    // Clean up existing channel if any
    if (activeChannels.has(fullName)) {
      $echo.leaveChannel(fullName)
    }

    // Subscribe to private channel
    const channel = $echo.private(cleanName)
    activeChannels.set(fullName, channel)
    
    return channel
  }

  const listenToPrivateEvent = (channelName, eventName, callback) => {
    const cleanName = channelName.replace(/^private-/, '')
    const fullName = `private-${cleanName}`
    
    // Get the pusher channel for reliability
    const pusherChannel = $pusher.channel(fullName)
    if (!pusherChannel) {
      return () => {}
    }

    // Bind event using pusher (more reliable)
    pusherChannel.bind(eventName, (data) => {
      callback(data)
    })

    // Return cleanup function
    return () => {
      pusherChannel.unbind(eventName, callback)
    }
  }

  // ==========================================
  // SUBSCRIPTION STATUS (Simple)
  // ==========================================
  
  const setupChannelSubscriptionEvents = (channelName, onSuccess, onError, isPrivate = false) => {
    const fullName = isPrivate ? `private-${channelName.replace(/^private-/, '')}` : channelName
    const pusherChannel = $pusher.channel(fullName)
    
    if (!pusherChannel) {
      return
    }

    // Listen for subscription success
    pusherChannel.bind('pusher:subscription_succeeded', (data) => {
      if (onSuccess) onSuccess(data)
    })

    // Listen for subscription error
    pusherChannel.bind('pusher:subscription_error', (error) => {
      if (onError) onError(error)
    })
  }

  // ==========================================
  // CLEANUP (Simple)
  // ==========================================
  
  const unsubscribeFromChannel = (channelName) => {
    const isPrivate = channelName.startsWith('private-')
    
    if (isPrivate) {
      // Handle private channel
      if (activeChannels.has(channelName)) {
        $echo.leaveChannel(channelName)
        activeChannels.delete(channelName)
      }
    } else {
      // Handle public channel
      if (activeChannels.has(channelName)) {
        const channel = activeChannels.get(channelName)
        channel.unbind_all()
        $pusher.unsubscribe(channelName)
        activeChannels.delete(channelName)
      }
    }
  }

  const unsubscribeFromAllChannels = () => {
    activeChannels.forEach((channel, channelName) => {
      unsubscribeFromChannel(channelName)
    })
    
    activeChannels.clear()
  }

  // ==========================================
  // UTILITY FUNCTIONS (Simple)
  // ==========================================
  
  const getConnectionState = () => {
    return $pusher?.connection?.state || 'unknown'
  }

  const getSocketId = () => {
    return $pusher?.connection?.socket_id || null
  }

  const getConnectionInfo = () => {
    return {
      state: connectionStatus.value,
      socketId: getSocketId(),
      activeChannels: Array.from(activeChannels.keys())
    }
  }

  // ==========================================
  // LEGACY COMPATIBILITY (Simple wrappers)
  // ==========================================
  
  // For backward compatibility with existing code
  const setupPrivateChannelSubscriptionEvents = (channelName, onSuccess, onError) => {
    return setupChannelSubscriptionEvents(channelName, onSuccess, onError, true)
  }

  const listenToPrivateEventViaPusher = (channelName, eventName, callback) => {
    return listenToPrivateEvent(channelName, eventName, callback)
  }

  // Auto-initialize when composable is used
  if ($pusher && connectionStatus.value === 'disconnected') {
    initializeConnection()
  }

  // ==========================================
  // RETURN EVERYTHING (Clean & Simple)
  // ==========================================
  
  return {
    // Core instances
    pusher: $pusher,
    echo: $echo,

    // Reactive state
    connectionStatus,
    isConnected,
    connectionColor,

    // Public channel methods
    subscribeToChannel,
    listenToEvent,

    // Private channel methods
    subscribeToPrivateChannel,
    listenToPrivateEvent,

    // Subscription status
    setupChannelSubscriptionEvents,

    // Cleanup methods
    unsubscribeFromChannel,
    unsubscribeFromAllChannels,

    // Utility methods
    getConnectionState,
    getSocketId,
    getConnectionInfo,

    // Legacy compatibility
    setupPrivateChannelSubscriptionEvents,
    listenToPrivateEventViaPusher,
  }
}