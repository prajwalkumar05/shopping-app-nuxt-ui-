<template>
  <UForm :validate="validate" :state="state" class="space-y-4 w-full flex flex-col flex-1" @submit="onSubmit">
    <UFormField label="Full Name" name="name">
      <UInput
        v-model="state.name"
        class="w-full"
        placeholder="Enter your full name"
        icon="i-heroicons-user"
      />
    </UFormField>

    <UFormField label="Username" name="username">
      <UInput
        class="w-full"
        v-model="state.username"
        placeholder="Choose a username"
        icon="i-heroicons-at-symbol"
      />
    </UFormField>

    <UFormField label="Email" name="email">
      <UInput
        v-model="state.email"
        class="w-full"
        type="email"
        placeholder="Enter your email"
        icon="i-heroicons-envelope"
      />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput
        v-model="state.password"
        class="w-full"
        type="password"
        placeholder="Create a password"
        icon="i-heroicons-lock-closed"
      />
    </UFormField>

    <UFormField label="Confirm Password" name="confirmPassword">
      <UInput
        v-model="state.confirmPassword"
        type="password"
        class="w-full"
        placeholder="Confirm your password"
        icon="i-heroicons-lock-closed"
      />
    </UFormField>

    <UFormField name="agree">
      <UCheckbox v-model="state.agree" required>
        <template #label>
          I agree to the 
          <UButton variant="link" size="sm" class="p-0 h-auto text-white">
            Terms and Conditions
          </UButton>
        </template>
      </UCheckbox>
    </UFormField>

    <div v-if="authStore.error" class="text-red-500 text-sm">
      {{ authStore.error }}
    </div>

    <UButton
      type="submit"
      block
      :loading="loading"
      class="btn-theme-primary e"
    >
      Create Account
    </UButton>
  </UForm>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth"
import { reactive, ref } from 'vue'

const emit = defineEmits(["register-success"])

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)

const state = reactive({
  name: undefined,
  username: undefined,
  email: undefined,
  password: undefined,
  confirmPassword: undefined,
  agree: false,
})

const validate = (state) => {
  const errors = []
  
  // Name validation
  if (!state.name) {
    errors.push({ name: 'name', message: 'Full name is required' })
  } else if (state.name.length < 2) {
    errors.push({ name: 'name', message: 'Name must be at least 2 characters' })
  }
  
  // Username validation
  if (!state.username) {
    errors.push({ name: 'username', message: 'Username is required' })
  } else if (state.username.length < 3) {
    errors.push({ name: 'username', message: 'Username must be at least 3 characters' })
  } else if (!/^[a-zA-Z0-9_]+$/.test(state.username)) {
    errors.push({ name: 'username', message: 'Username can only contain letters, numbers, and underscores' })
  }
  
  // Email validation
  if (!state.email) {
    errors.push({ name: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    errors.push({ name: 'email', message: 'Invalid email address' })
  }
  
  // Password validation
  if (!state.password) {
    errors.push({ name: 'password', message: 'Password is required' })
  } else if (state.password.length < 8) {
    errors.push({ name: 'password', message: 'Password must be at least 8 characters' })
  }
  
  // Confirm Password validation
  if (!state.confirmPassword) {
    errors.push({ name: 'confirmPassword', message: 'Please confirm your password' })
  } else if (state.password && state.confirmPassword && state.password !== state.confirmPassword) {
    errors.push({ name: 'confirmPassword', message: "Passwords don't match" })
  }
  
  // Terms agreement validation
  if (!state.agree) {
    errors.push({ name: 'agree', message: 'You must agree to the terms and conditions' })
  }
  
  return errors
}

const onSubmit = async (event) => {
  loading.value = true
  
  setTimeout(() => {
    emit("register-success")
    loading.value = false
  }, 2000)
}
</script>