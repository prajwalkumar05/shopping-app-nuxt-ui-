<!-- pages/simple-test.vue (Clean Version with UButton) -->
<template>
  <div class="bg-primary transition-colors duration-300">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">Event Listener Dashboard</h1>
        <p class="text-secondary">Simple real-time backend event monitoring</p>
      </div>
      
      <!-- Connection Status -->
      <div class="bg-card border border-theme rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-4 h-4 rounded-full transition-all duration-300" 
                 :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'">
            </div>
            <h2 class="text-lg font-semibold text-primary">
              {{ isConnected ? 'Connected ✅' : 'Disconnected ❌' }}
            </h2>
            <span class="text-sm text-muted">{{ eventCount }} events received</span>
          </div>
          
          <!-- Manual Connection Buttons -->
          <div class="flex space-x-2">
            <UButton
              size="sm"
              color="primary"
              label="Connect"
              :disabled="isConnected"
              @click="handleConnect"
            />
            <UButton
              size="sm"
              color="green"
              label="Test"
              @click="handleTest"
            />
            <UButton
              size="sm"
              color="red"
              label="Disconnect"
              :disabled="!isConnected"
              @click="handleDisconnect"
            />
          </div>
        </div>
      </div>

      <!-- Live Events -->
      <div class="bg-card border border-theme rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-primary">Live Events</h2>
          <UButton
            size="sm"
            color="red"
            label="Clear"
            @click="clearEvents"
          />
        </div>
        
        <!-- Events List -->
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="event in events"
            :key="event.id"
            class="p-4 border rounded-lg transition-all duration-200 hover:shadow-md"
            :class="getEventColor(event.type)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-sm" :class="getTextColor(event.type)">
                {{ event.type.toUpperCase() }}
              </span>
              <span class="text-xs text-muted">{{ formatTime(event.timestamp) }}</span>
            </div>
            
            <!-- Event Data Display -->
            <div class="text-sm text-secondary">
              <div v-if="event.type === 'user_created'">
                <strong>👤 New User:</strong> {{ event.data.name }} ({{ event.data.email }})
              </div>
              <div v-else-if="event.type === 'order_updated'">
                <strong>📦 Order:</strong> #{{ event.data.orderId }} → {{ event.data.status }}
              </div>
              <div v-else-if="event.type === 'notification'">
                <strong>🔔 Notification:</strong> {{ event.data.message }}
              </div>
              <div v-else-if="event.type === 'connection_test'">
                <strong>🔗 Connection:</strong> {{ event.data.message }}
              </div>
              <div v-else>
                <strong>📡 Data:</strong> {{ JSON.stringify(event.data) }}
              </div>
            </div>
          </div>
          
          <!-- No Events Message -->
          <div v-if="events.length === 0" class="text-center py-8 text-muted">
            <div class="text-4xl mb-2">📡</div>
            <p>Waiting for events...</p>
            <p class="text-sm mt-1">Events should appear here when received</p>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-card border border-theme rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-2xl font-bold text-green-600">{{ userCount }}</div>
          <div class="text-sm text-green-600">Users</div>
        </div>
        <div class="bg-card border border-theme rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-2xl font-bold text-blue-600">{{ orderCount }}</div>
          <div class="text-sm text-blue-600">Orders</div>
        </div>
        <div class="bg-card border border-theme rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-2xl font-bold text-purple-600">{{ notificationCount }}</div>
          <div class="text-sm text-purple-600">Notifications</div>
        </div>
        <div class="bg-card border border-theme rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-all duration-200">
          <div class="text-2xl font-bold text-theme">{{ eventCount }}</div>
          <div class="text-sm text-theme">Total</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use the composable
const { 
  connect, 
  disconnect, 
  testConnection,
  isConnected, 
  events, 
  eventCount,
  userCount,
  orderCount,
  notificationCount,
  clearEvents 
} = useEventListener()

// Connection handlers
const handleConnect = () => {
  console.log('Connecting to backend...')
  connect('/api/test-broadcast')
}

const handleDisconnect = () => {
  console.log('Disconnecting...')
  disconnect()
}

const handleTest = async () => {
  try {
    const result = await testConnection('/api/test-broadcast')
    alert(result)
  } catch (error) {
    alert(error)
  }
}

// Helper functions for UI
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

const getEventColor = (eventType) => {
  const colors = {
    'user_created': 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
    'user_updated': 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700',
    'order_created': 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700',
    'order_updated': 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700',
    'notification': 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700',
    'connection_test': 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
  }
  return colors[eventType] || 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'
}

const getTextColor = (eventType) => {
  const colors = {
    'user_created': 'text-green-700 dark:text-green-300',
    'user_updated': 'text-blue-700 dark:text-blue-300',
    'order_created': 'text-green-700 dark:text-green-300',
    'order_updated': 'text-yellow-700 dark:text-yellow-300',
    'notification': 'text-purple-700 dark:text-purple-300',
    'connection_test': 'text-gray-700 dark:text-gray-300'
  }
  return colors[eventType] || 'text-gray-700 dark:text-gray-300'
}

// Auto-connect when component mounts
onMounted(() => {
  console.log('Page loaded, auto-connecting...')
  
  // Auto-connect after 1 second
  setTimeout(() => {
    if (!isConnected.value) {
      handleConnect()
    }
  }, 1000)
})
</script>

