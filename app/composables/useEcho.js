export const useEcho = () => {
  const { $echo } = useNuxtApp()
  const notifications = ref([])
  const privateNotifications = ref([])
  const isConnected = ref(false)

  // Connection status monitoring
  const setupConnectionMonitoring = () => {
    if ($echo?.connector?.pusher) {
      $echo.connector.pusher.connection.bind('connected', () => {
        isConnected.value = true
        console.log('Echo connected successfully')
      })

      $echo.connector.pusher.connection.bind('disconnected', () => {
        isConnected.value = false
        console.log('Echo disconnected')
      })

      $echo.connector.pusher.connection.bind('error', (error) => {
        console.error('Echo connection error:', error)
      })
    }
  }

  // Listen to public channels 
  const listenToPublicChannel = (channelName, eventName, callback) => {
    if (!$echo) return

    return $echo.channel(channelName)
      .listen(eventName, callback)
      .error((error) => {
        console.error(`Error listening to ${channelName}.${eventName}:`, error)
      })
  }

  // Listen to private user notifications (single private listener)
  const listenToPrivateNotifications = (userId) => {
    if (!$echo || !userId) return
    
    const channelName = `user.${userId}`
    
    return $echo.private(channelName)
      .listen('PrivateNotificationSent', (data) => {
        privateNotifications.value.unshift(data)
        console.log('New private notification received:', data)
      })
  }

  // Leave a channel
  const leaveChannel = (channelName) => {
    if (!$echo) return
    $echo.leaveChannel(channelName)
  }

  // Listen to public notifications 
  const listenToNotifications = (channelName = 'notifications') => {
    if (!$echo) return

    return $echo.channel(channelName)
      .listen('NotificationSent', (data) => {
        notifications.value.unshift(data)
        console.log('New public notification received:', data)
      })
  }

  onMounted(() => {
    setupConnectionMonitoring()
  })

  onUnmounted(() => {
    // Clean up all listeners when component unmounts
    if ($echo?.disconnect) {
      $echo.disconnect()
    }
  })

  return {
    echo: $echo,
    notifications,
    privateNotifications,
    isConnected: readonly(isConnected),
    listenToPublicChannel,
    listenToPrivateNotifications,
    listenToNotifications,
    leaveChannel,
    setupConnectionMonitoring
  }
}