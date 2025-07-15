// import Echo from 'laravel-echo'
// import Pusher from 'pusher-js'
// import { defineNuxtPlugin } from "#app"

// export default defineNuxtPlugin(() => {
//   const config = useRuntimeConfig()
  
//   // Make Pusher available globally for Echo
//   window.Pusher = Pusher

//   // Environment detection
//   const isProd = process.env.NODE_ENV === 'production'

//   const authToken = "6|kmJOqntcNtFoJaVOjrxip3Zhv7tGPiUXeMzR04Z42e3d145f"
  
//   // Create Echo instance with production-ready configuration
//   const echo = new Echo({
//     broadcaster: 'pusher',
//     key: config.public.pusherKey || 'fkll4yezwmuipofehws5',
//     wsHost: config.public.pusherHost || (isProd ? config.public.pusherHost : 'localhost'),
//     wsPort: config.public.pusherPort || 6001,
//     wssPort: config.public.pusherWssPort || 6001,
//     forceTLS: isProd,
//     enabledTransports: ['ws', 'wss'],
//     cluster: config.public.pusherCluster || 'mt1',
//     encrypted: isProd,
//     disableStats: true,
    
//     // Authentication setup for private/presence channels
//     authorizer: (channel, options) => {
//       return {
//         authorize: (socketId, callback) => {
//           console.log('🔐 Authorizing channel:', channel.name, 'with socket:', socketId)
          
//           const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:8000'
          
//           if (!authToken) {
//             console.error('❌ No auth token available for channel authorization')
//             callback(new Error('Authentication required'), null)
//             return
//           }


//           // Make authorization request to your backend
//           $fetch(`${apiBaseUrl}/api/broadcasting/auth`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Bearer ${authToken}`,
//               'Content-Type': 'application/json',
//               'Accept': 'application/json',
//             },
//             body: {
//               socket_id: socketId,
//               channel_name: channel.name,
//             }
//           })
//           .then(response => {
//             console.log('✅ Channel authorization successful:', response)
//             callback(null, response)
//           })
//           .catch(error => {
//             console.error('❌ Channel authorization failed:', error)
//             console.error('Error details:', error.response || error.data || error)
//             callback(error, null)
//           })
//         }
//       }
//     },

//     // Additional configuration for better connection handling
//     activityTimeout: 30000,
//     pongTimeout: 6000,
//     unavailableTimeout: 30000,
//   })

//   // Get pusher instance
//   const pusherInstance = echo.connector.pusher


//   return {
//     provide: {
//       pusher: pusherInstance,
//       echo: echo
//     },
//   }
// })


import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { defineNuxtPlugin } from "#app"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  // Make Pusher available globally for Echo
  window.Pusher = Pusher


  const authToken = "3|Z75WukVSkJjuXvnEhNw9hJiCU9wGkugh7bJBZGKj1415122c"
  
  // Create Echo instance with production-ready configuration
  const echo = new Echo({
    broadcaster: 'pusher',
    key: config.public.pusherKey || 'b7f2c8e1a4d94f3b8c2e5a7d1f6e9b0c',
    wsHost: config.public.pusherHost || 'ws.reverb.pagesoft.xyz',
    wsPort: config.public.pusherPort || 443,
    wssPort: config.public.pusherWssPort || 443,
    enabledTransports: ['ws', 'wss'],
    cluster: config.public.pusherCluster || 'mt1',
    disableStats: true,
    
    // Authentication setup for private/presence channels
    authorizer: (channel, options) => {
      return {
        authorize: (socketId, callback) => {
          console.log('🔐 Authorizing channel:', channel.name, 'with socket:', socketId)
          
          const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:8000'
          
          if (!authToken) {
            console.error('❌ No auth token available for channel authorization')
            callback(new Error('Authentication required'), null)
            return
          }

          // Make authorization request to your backend
          $fetch(`${apiBaseUrl}/api/broadcasting/auth`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: {
              socket_id: socketId,
              channel_name: channel.name,
            }
          })
          .then(response => {
            console.log('✅ Channel authorization successful:', response)
            callback(null, response)
          })
          .catch(error => {
            console.error('❌ Channel authorization failed:', error)
            console.error('Error details:', error.response || error.data || error)
            callback(error, null)
          })
        }
      }
    },

    // Additional configuration for better connection handling
    activityTimeout: 30000,
    pongTimeout: 6000,
    unavailableTimeout: 30000,
  })

  // Get pusher instance
  const pusherInstance = echo.connector.pusher

  // Add connection event logging
  pusherInstance.connection.bind('connected', () => {
    console.log('🚀 Connected to Reverb server:', config.public.pusherHost)
    console.log('📡 Socket ID:', pusherInstance.connection.socket_id)
  })

  pusherInstance.connection.bind('error', (error) => {
    console.error('❌ Reverb connection error:', error)
  })

  return {
    provide: {
      pusher: pusherInstance,
      echo: echo
    },
  }
})