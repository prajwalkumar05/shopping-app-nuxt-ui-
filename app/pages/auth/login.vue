<template>
  <div class="min-h-screen flex">
    <!-- Left side - Illustration -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-12">
      <div class="text-center text-white">

        <h2 class="text-3xl font-bold mb-4">Welcome Back!</h2>
      </div>
    </div>

    <!-- Right side - Login Form -->
    <div class="w-full lg:w-1/2 flex-center p-8">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p class="text-gray-600">Welcome back! Please sign in to your account.</p>
        </div>

        <UCard class="shadow-xl">
          <template #header>
            <div class="text-center">
              <h2 class="text-xl font-semibold">Login to Your Account</h2>
            </div>
          </template>

          <LoginForm  />

          <template #footer>
            <div class="text-center flex items-center justify-center space-y-4">
              <UDivider label="or" />
              
              <div class="text-sm ">
                Don't have an account?
                <UButton variant="link" class="text-white" size="sm" @click="$router.push('/auth/register')">
                  Sign up here
                </UButton>
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from "~/components/auth/LoginForm.vue"

definePageMeta({
  layout: false,
})


</script>
