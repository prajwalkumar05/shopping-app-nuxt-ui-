<!-- pages/firebase.vue -->
<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <!-- Header Section -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">All Users ({{ users.length }})</h1>
    </div>

    <!-- Add User Form -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔥 Add User to Firebase Database</h2>
      
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Full Name" name="name" required>
            <UInput
              v-model="newUser.name"
              placeholder="Full Name"
            />
          </UFormGroup>
          <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="newUser.email"
              placeholder="Email"
              type="email"
            />
          </UFormGroup>
        </div>
        <UFormGroup label="Company Name" name="company" required>
          <UInput
            v-model="newUser.company"
            placeholder="Company Name"
          />
        </UFormGroup>
        
        <div class="flex justify-end gap-3">
          <UButton
            color="gray"
            variant="outline"
            @click="clearForm"
          >
            Clear
          </UButton>
          <UButton
            @click="addUser"
            :loading="addingUser"
            :disabled="!isFormValid || !isConnected"
            color="orange"
          >
            <template #leading>
              <span>🔥</span>
            </template>
            {{ addingUser ? 'Saving to Firebase...' : 
               !isConnected ? 'Firebase Not Connected' :
               !isFormValid ? 'Fill All Fields' : 
               'Save to Firebase Database' }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Search and Controls -->
    <div class="flex justify-between items-center mb-4">
      <UInput
        v-model="searchQuery"
        placeholder="Search users..."
        icon="i-heroicons-magnifying-glass-20-solid"
        size="sm"
        class="w-64"
      />
      <div class="flex gap-2">
        <UButton
          @click="loadUsers"
          :loading="loadingUsers"
          variant="outline"
          size="sm"
          icon="i-heroicons-arrow-path"
        >
          Load Users
        </UButton>
        <UButton
          @click="forceRefreshUsers"
          variant="outline"
          size="sm"
          icon="i-heroicons-arrow-clockwise"
        >
          Refresh from Firebase
        </UButton>
        <UButton
          @click="clearCacheOnly"
          variant="outline"
          size="sm"
          icon="i-heroicons-trash"
        >
          Clear Indexdb
        </UButton>
        <UButton
          @click="testFirebaseConnection"
          variant="outline"
          size="sm"
          icon="i-heroicons-signal"
        >
          Test Connection
        </UButton>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="mb-4 flex items-center gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div :class="[
          'w-3 h-3 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        ]"></div>
        <span class="text-gray-700 dark:text-gray-200">{{ isConnected ? 'Firebase Connected' : 'Firebase Disconnected' }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div :class="[
          'w-3 h-3 rounded-full',
          isRealTimeActive ? 'bg-green-500' : 'bg-gray-400'
        ]"></div>
        <span class="text-gray-700 dark:text-gray-200">{{ isRealTimeActive ? 'Real-time Active' : 'Real-time Inactive' }}</span>
      </div>
      <div v-if="hasNewUsers" class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
        <span class="text-orange-600 dark:text-orange-400 font-medium">New Users Detected</span>
      </div>
    </div>

    <!-- Users Table - FIXED with correct Nuxt UI v3 syntax using row.original -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <UTable 
        :data="filteredUsers" 
        :columns="columns"
        :loading="loadingUsers"
        class="w-full"
      >
        <!-- Name Column - FIXED with row.original -->
        <template #name-cell="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar
              :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(row.original.name)}&background=random`"
              :alt="row.original.name"
              size="sm"
            />
            <div>
              <div class="font-medium text-gray-900 dark:text-white">{{ row.original.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ row.original.email }}</div>
            </div>
          </div>
        </template>

        <!-- Company Column - FIXED with row.original -->
        <template #company-cell="{ row }">
          <span class="text-sm text-gray-900 dark:text-white">
            {{ getCompanyName(row.original.company) }}
          </span>
        </template>

        <!-- Phone Column - FIXED with row.original -->
        <template #phone-cell="{ row }">
          <span class="text-sm text-gray-600 dark:text-gray-300">{{ row.original.phone || '-' }}</span>
        </template>

        <!-- Status Column - FIXED with row.original and UBadge -->
        <template #status-cell="{ row }">
          <UBadge 
            :color="row.original.isNewUser ? 'orange' : 'green'"
            variant="subtle"
          >
            {{ row.original.isNewUser ? 'New Firebase User' : 'Active' }}
          </UBadge>
        </template>

        <!-- Created Column - FIXED with row.original -->
        <template #created-cell="{ row }">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ formatTime(row.original.createdAt) }}
          </span>
        </template>

        <!-- Actions Column - FIXED with row.original -->
        <template #actions-cell="{ row }">
          <UDropdownMenu :items="getDropdownActions(row.original)">
            <UButton
              icon="i-heroicons-ellipsis-horizontal-20-solid"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Actions"
            />
          </UDropdownMenu>
        </template>
      </UTable>

      <!-- Empty State -->
      <div v-if="!filteredUsers.length && !loadingUsers" class="text-center py-12">
        <div class="text-4xl mb-4">🔥</div>
        <p class="text-gray-500 dark:text-gray-400">
          {{ users.length === 0 ? 'Click "Load Users" to fetch from Firebase' : 'No users match your search' }}
        </p>
      </div>
    </div>


    <!-- Custom Toast Notification -->
    <div v-if="showToast" class="fixed top-4 right-4 bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <span>🔥</span>
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'

// Use the Firebase composable
const { 
  getSmartUsers, 
  addNewUser, 
  addUserToCache, 
  forceRefresh, 
  clearCache, 
  setupRealTimeNotifications, 
  testConnection, 
  stats 
} = useFirebaseUsers()

// Reactive state
const users = ref([])
const usersSource = ref('none')
const isConnected = ref(false)
const isRealTimeActive = ref(false)
const hasNewUsers = ref(false)

// Form state
const newUser = ref({
  name: '',
  email: '',
  company: ''
})
const addingUser = ref(false)
const loadingUsers = ref(false)

// UI state
const searchQuery = ref('')

// Custom Toast notification
const showToast = ref(false)
const toastMessage = ref('')

// Flags to prevent duplicate notifications
const isManuallyAdding = ref(false)
const isManuallyDeleting = ref(false)
const lastToastMessage = ref('')
const toastTimeout = ref(null)

// Track processed notifications to prevent duplicates
const processedUserIds = ref(new Set())
const processedDeletions = ref(new Set())
const notificationDebounceTimeout = ref(null)

// Clipboard functionality
const { copy } = useClipboard()

// Form validation
const isFormValid = computed(() => {
  return newUser.value.name.trim() && 
         newUser.value.email.trim() && 
         newUser.value.company.trim()
})

// Table configuration for Nuxt UI v3
const columns = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'company',
    header: 'Company'
  },
  {
    accessorKey: 'phone',
    header: 'Phone'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'created',
    header: 'Created'
  },
  {
    id: 'actions',
    header: ''
  }
]

// Computed filtered users
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    getCompanyName(user.company).toLowerCase().includes(query)
  )
})

// Helper functions
const formatTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString()
}

const getCompanyName = (company) => {
  if (!company) return 'No Company'
  
  if (typeof company === 'object' && company.name) {
    return company.name
  }
  
  if (typeof company === 'string') {
    return company
  }
  
  return 'No Company'
}

// Dropdown actions for each user
const getDropdownActions = (user) => {
  return [
    [
      {
        label: 'Copy User ID',
        icon: 'i-heroicons-clipboard-document',
        onSelect: () => {
          copy(user.id.toString())
          showNotification(`User ID copied to clipboard!`)
        }
      }
    ],
    [
      {
        label: 'View Details',
        icon: 'i-heroicons-eye-20-solid',
        onSelect: () => showNotification(`Viewing details for ${user.name}`)
      },
      {
        label: 'Edit User',
        icon: 'i-heroicons-pencil-square',
        onSelect: () => showNotification(`Edit functionality for ${user.name}`)
      }
    ],
    [
      {
        label: 'Delete User',
        icon: 'i-heroicons-trash-20-solid',
        color: 'error',
        onSelect: () => showNotification(`Delete functionality for ${user.name}`)
      }
    ]
  ]
}

// Simple toast notification system with duplicate prevention
const showNotification = (message) => {
  // Clear any existing debounce timeout
  if (notificationDebounceTimeout.value) {
    clearTimeout(notificationDebounceTimeout.value)
  }
  
  // Debounce notifications to prevent rapid-fire duplicates
  notificationDebounceTimeout.value = setTimeout(() => {
    // Prevent exact duplicate messages within a short time frame
    if (message === lastToastMessage.value && showToast.value) {
      return
    }
    
    // Clear any existing toast timeout
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value)
    }
    
    lastToastMessage.value = message
    toastMessage.value = message
    showToast.value = true
    
    toastTimeout.value = setTimeout(() => {
      showToast.value = false
      lastToastMessage.value = ''
    }, 4000)
  }, 100) // 100ms debounce delay
}

const clearForm = () => {
  newUser.value = { name: '', email: '', company: '' }
}

// FIXED: Load users function - Back to your original Firebase functionality
const loadUsers = async () => {
  loadingUsers.value = true
  const previousCacheHits = stats.value.cacheHits
  
  try {
    const data = await getSmartUsers()
    users.value = data
    
    usersSource.value = stats.value.cacheHits > previousCacheHits ? 'cache' : 'firebase'
    hasNewUsers.value = false
    
    console.log('Loaded Firebase users:', users.value)
    showNotification('Users loaded successfully!')
  } catch (error) {
    console.error('Failed to load users:', error)
    showNotification('Failed to load users')
  } finally {
    loadingUsers.value = false
  }
}

// Add user function - FIXED to show user immediately
const addUser = async () => {
  if (!isFormValid.value || !isConnected.value) return
  
  addingUser.value = true
  isManuallyAdding.value = true
  
  try {
    // Add user to Firebase
    const user = await addNewUser(newUser.value.name, newUser.value.email, newUser.value.company)
    
    // IMMEDIATELY add to the UI without waiting for real-time
    users.value.unshift(user)
    
    // Also add to cache
    await addUserToCache(user)
    
    // Clear form after successful save
    newUser.value = { name: '', email: '', company: '' }
    
    showNotification(`User ${user.name} saved to Firebase!`)
    
    // Reset flag after delay to allow real-time processing
    setTimeout(() => {
      isManuallyAdding.value = false
    }, 2000)
    
  } catch (error) {
    console.error('Failed to add user:', error)
    showNotification('Failed to add user to Firebase')
    isManuallyAdding.value = false
  } finally {
    addingUser.value = false
  }
}

// Force refresh users
const forceRefreshUsers = async () => {
  try {
    const freshUsers = await forceRefresh()
    users.value = freshUsers
    usersSource.value = 'firebase'
    
    showNotification('Users refreshed from Firebase!')
  } catch (error) {
    console.error('Force refresh failed:', error)
    showNotification('Failed to refresh from Firebase')
  }
}

// Clear cache only
const clearCacheOnly = async () => {
  await clearCache()
  users.value = []
  usersSource.value = 'none'
  
  showNotification('Local cache cleared!')
}

// Test Firebase connection
const testFirebaseConnection = async () => {
  try {
    const isWorking = await testConnection()
    
    if (isWorking) {
      isConnected.value = true
      showNotification('Firebase connection successful!')
    } else {
      isConnected.value = false
      showNotification('Firebase connection failed')
    }
  } catch (error) {
    isConnected.value = false
    console.error('Firebase connection error:', error)
    showNotification('Firebase connection error')
  }
}

// Handle real-time user deletion
const handleUserDeleted = async (deletedUser) => {
  const userId = deletedUser.id
  const userName = deletedUser.name || 'Unknown'
  
  // Check if we've already processed this deletion
  if (processedDeletions.value.has(userId)) {
    console.log(`Skipping duplicate deletion notification for user: ${userName} (${userId})`)
    return
  }
  
  // Mark this user as processed
  processedDeletions.value.add(userId)
  
  // Remove from users array
  const userExists = users.value.find(user => user.id === userId)
  if (userExists) {
    users.value = users.value.filter(user => user.id !== userId)
    
    // Remove from cache
    if (process.client) {
      try {
        const request = indexedDB.open('FirebaseUsersCache', 1)
        request.onsuccess = () => {
          const db = request.result
          const transaction = db.transaction(['users'], 'readwrite')
          const store = transaction.objectStore('users')
          store.delete(userId)
        }
      } catch (error) {
        console.error('Error removing user from cache:', error)
      }
    }
    
    // Show notification only once
    showNotification(`🔥 User deleted: ${userName}`)
    
    // Clean up the processed deletion after some time
    setTimeout(() => {
      processedDeletions.value.delete(userId)
    }, 10000) // Clean up after 10 seconds
  }
}

// Handle real-time new user - FIXED to prevent duplicates from manual additions
const handleRealTimeUser = async (userData) => {
  const userId = userData.id
  const userName = userData.name
  
  // Don't show real-time notification if we just manually added a user
  if (isManuallyAdding.value) {
    console.log('Skipping real-time notification for manually added user')
    return
  }
  
  // Check if we've already processed this user addition
  if (processedUserIds.value.has(userId)) {
    console.log(`Skipping duplicate addition notification for user: ${userName} (${userId})`)
    return
  }
  
  // Check if user already exists in the array (prevent duplicates)
  const userExists = users.value.find(user => user.id === userId)
  if (userExists) {
    console.log(`User ${userName} already exists in the list, skipping addition`)
    return
  }
  
  // Mark this user as processed
  processedUserIds.value.add(userId)
  
  // Add the new user to the list
  users.value.unshift(userData)
  hasNewUsers.value = true
  
  await addUserToCache(userData)
  
  showNotification(`🔥 Real-time: ${userName} joined!`)
  
  // Clean up the processed user after some time
  setTimeout(() => {
    processedUserIds.value.delete(userId)
  }, 10000) // Clean up after 10 seconds
}

// Setup on mount
onMounted(async () => {
  try {
    const connected = await testConnection()
    isConnected.value = connected
    
    if (connected) {
      setupRealTimeNotifications(handleRealTimeUser, handleUserDeleted)
      isRealTimeActive.value = true
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error)
    isConnected.value = false
  }
  
  // Auto-load users
  setTimeout(() => {
    if (users.value.length === 0 && isConnected.value) {
      loadUsers()
    }
  }, 2000)
})



</script>

<style scoped>
/* Custom styles for animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.fixed.top-4.right-4 {
  animation: fadeIn 0.3s ease-out;
}
</style>