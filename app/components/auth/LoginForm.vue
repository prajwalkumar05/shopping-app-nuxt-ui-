<template>
  <UForm
    :validate="validate"
    :state="formState"
    class="space-y-4"
    @submit="handleSubmit"
  >
    <UFormField label="Username" name="username" required>
      <UInput
        v-model="formState.username"
        placeholder="Enter your username"
        class="w-full"
        icon="i-heroicons-user"
        :disabled="loading"
        autocomplete="username"
      />
    </UFormField>

    <UFormField label="Password" name="password" required>
      <UInput
        v-model="formState.password"
        type="password"
        class="w-full"
        placeholder="Enter your password"
        icon="i-heroicons-lock-closed"
        :disabled="loading"
        autocomplete="current-password"
      />
    </UFormField>

    <div class="flex items-center justify-between">
      <UCheckbox
        v-model="formState.remember_me"
        label="Remember me"
        :disabled="loading"
      />
      <UButton
        variant="link"
        class="text-secondary"
        size="sm"
        :disabled="loading"
        @click="$emit('forgot-password')"
      >
        Forgot password?
      </UButton>
    </div>

    <!-- Demo credentials info -->
    <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
      <div class="flex items-center justify-between mb-2">
        <p><strong>Demo credentials:</strong></p>
        <UButton
          size="xs"
          variant="soft"
          color="blue"
          :disabled="loading"
          @click="fillDemo"
        >
          Auto-fill
        </UButton>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <p>Username: <code class="bg-gray-200 px-1 rounded">emilys</code></p>
        <p>Password: <code class="bg-gray-200 px-1 rounded">emilyspass</code></p>
      </div>
    </div>

    <!-- Error display -->
    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      :title="error"
      :close-button="{ 
        icon: 'i-heroicons-x-mark-20-solid', 
        color: 'gray', 
        variant: 'link' 
      }"
      @close="clearError"
    />

    <!-- Loading state info -->
    <div v-if="loading" class="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
      <div class="flex items-center">
        <Icon name="i-heroicons-arrow-path" class="w-3 h-3 mr-1 animate-spin" />
        Authenticating with DummyJSON API...
      </div>
    </div>

    <!-- Submit button -->
    <UButton
      type="submit"
      block
      :loading="loading"
      :disabled="loading"
      class="btn-theme-primary"
    >
      {{ loading ? "Signing in..." : "Sign In" }}
    </UButton>
  </UForm>
</template>

<script setup>
import { reactive } from 'vue'
import { navigateTo } from '#app'

// Disable auth middleware for login page
definePageMeta({
  auth: false
})

// Define component events
const emit = defineEmits(['login-success', 'forgot-password'])

// Get enhanced auth composable (matches your current API exactly)
const { login, loading, error, clearError } = useAuthEnhanced()

// Form state (matches your current form exactly)
const formState = reactive({
  username: '',
  password: '',
  remember_me: false
})

// Form validation (matches your current validation exactly)
const validate = (state) => {
  const errors = []

  if (!state.username) {
    errors.push({ name: "username", message: "Username is required" })
  } else if (state.username.length < 3) {
    errors.push({
      name: "username",
      message: "Username must be at least 3 characters"
    })
  }

  if (!state.password) {
    errors.push({ name: "password", message: "Password is required" })
  } else if (state.password.length < 6) {
    errors.push({
      name: "password",
      message: "Password must be at least 6 characters"
    })
  }

  return errors
}

// Handle form submission (matches your current logic exactly)
const handleSubmit = async (event) => {
  try {
    clearError()

    const credentials = {
      username: event.data.username,
      password: event.data.password,
      remember_me: event.data.remember_me
    }
    
    const result = await login(credentials)
    
    if (result.success) {
      emit('login-success', result.user)
      
      // Navigate to home page
      await navigateTo('/', { replace: true })
    }
  } catch (err) {
    console.error('Login failed:', err)
    // Error is already set in the login function
  }
}

// Fill demo credentials (matches your current demo function exactly)
const fillDemo = () => {
  formState.username = 'emilys'
  formState.password = 'emilyspass'
  formState.remember_me = false
}
</script>