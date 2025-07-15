<template>
  <div class="simple-listener">
    <!-- Connection Status -->
    <div v-if="isConnected" class="status connected">
      ✅ Connected! Received {{ messageCount }} messages
    </div>
    <div v-else class="status disconnected">
      ❌ Not connected to backend
    </div>
    
    <!-- Last Message Display -->
    <div v-if="lastMessage" class="last-message">
      <strong>Last message:</strong> {{ lastMessage.type }}
      <br>
      <small>{{ JSON.stringify(lastMessage.data) }}</small>
    </div>
    
    <!-- Manual Connection Button -->
    <div class="controls">
      <button @click="manualConnect" class="connect-btn">
        🔄 Manual Connect
      </button>
      <button @click="testConnection" class="test-btn">
        🧪 Test Connection
      </button>
    </div>
  </div>
</template>

<script setup>
const { connect, isConnected, lastMessage, messageCount } = useEventListener()

// Manual connect function
const manualConnect = () => {
  console.log('🔄 MANUAL CONNECT triggered')
  connect('/api/test-broadcast')
}

// Test connection function
const testConnection = () => {
  console.log('🧪 TESTING connection manually...')
  
  const testConnection = new EventSource('/api/test-broadcast')
  
  testConnection.onopen = () => {
    console.log('✅ MANUAL TEST: Connection opened!')
    alert('✅ Manual test: Connection works!')
  }
  
  testConnection.onmessage = (event) => {
    console.log('📡 MANUAL TEST: Received data:', event.data)
    alert('📡 Manual test: Data received!')
    testConnection.close() // Close test connection
  }
  
  testConnection.onerror = (error) => {
    console.error('❌ MANUAL TEST: Failed:', error)
    alert('❌ Manual test: Connection failed!')
  }
}

// Watch for changes
watch(isConnected, (newValue) => {
  console.log('🔄 Connection status changed to:', newValue)
})

watch(messageCount, (newValue) => {
  console.log('📊 Message count changed to:', newValue)
})
</script>

<style scoped>
.simple-listener {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 300px;
}

.status {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 10px;
}

.connected {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.disconnected {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.last-message {
  font-size: 12px;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
  word-break: break-all;
}

.controls {
  display: flex;
  gap: 5px;
  flex-direction: column;
}

.connect-btn, .test-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.connect-btn {
  background: #007bff;
  color: white;
}

.test-btn {
  background: #28a745;
  color: white;
}

.connect-btn:hover, .test-btn:hover {
  opacity: 0.8;
}
</style>