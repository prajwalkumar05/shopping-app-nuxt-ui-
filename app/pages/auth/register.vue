<template>
  <div class="min-h-screen flex">
    <!-- Left side - Illustration -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-blue-700 items-center justify-center p-12"
    >
      <div class="text-center text-white">
        <h2 class="text-3xl font-bold mb-4">Sign up</h2>
      </div>
    </div>

    <!-- Right side - Register Form -->
    <div class="w-full lg:w-1/2 flex-center p-8">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p class="text-gray-600">Join us today and start shopping!</p>
        </div>

        <UCard class="shadow-xl">
          <template #header>
            <div class="text-center">
              <h2 class="text-xl font-semibold">Sign Up</h2>
            </div>
          </template>

          <RegisterForm @register-success="handleRegisterSuccess" />

          <template #footer>
            <div class="text-center space-y-4">
              <UDivider label="or" />

              <div class="text-sm text-gray-600">
                Already have an account?
                <UButton
                  variant="link"
                  class="text-primary"
                  size="sm"
                  @click="$router.push('/auth/login')"
                >
                  Sign in here
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
import RegisterForm from "~/components/auth/RegisterForm.vue";
import { ROUTES} from "~/config/routes";

definePageMeta({
  layout: false,
});

const toast = useToast()

const handleRegisterSuccess = () => {
  toast.add({
    title: "Account Created Successfully!",
    description: "Welcome! You can now sign in with your credentials.",
    icon: "i-heroicons-check-circle",
    color: "green",
    timeout: 4000,
  });

  navigateTo(ROUTES.auth.login);
};
</script>
