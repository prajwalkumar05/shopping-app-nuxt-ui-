<template>
  <UForm
    :validate="validate"
    :state="state"
    class="space-y-2 flex flex-col gap-1"
    @submit="onSubmit"
  >
    <UFormField label="Username" name="username">
      <UInput
        v-model="state.username"
        placeholder="Enter your username"
        class="w-full"
        icon="i-heroicons-user"
      />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput
        v-model="state.password"
        type="password"
        class="w-full"
        placeholder="Enter your password"
        icon="i-heroicons-lock-closed"
      />
    </UFormField>

    <div class="flex items-center justify-between">
      <UCheckbox v-model="state.remember_me" label="Remember me" />
      <UButton
        variant="link"
        class="text-secondary"
        size="sm"
        @click="$emit('forgot-password')"
      >
        Forgot password?
      </UButton>
    </div>

    <!-- Test credentials info -->
    <div class="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
      <p><code class="bg-gray-200 px-1 rounded">emilys</code></p>
      <p><code class="bg-gray-200 px-1 rounded">emilyspass</code></p>
    </div>

    <div
      v-if="authStore.error"
      class="text-red-500 text-sm bg-red-50 p-3 rounded-md"
    >
      {{ authStore.error }}
    </div>

    <UButton
      type="submit"
      block
      :loading="authStore.loading"
      :disabled="authStore.loading"
      class="btn-theme-primary"
    >
      {{ authStore.loading ? "Logging in..." : "Login" }}
    </UButton>
  </UForm>
</template>

<script setup>
import { useAuthStore } from "~/stores/auth";
import { reactive } from "vue";

const emit = defineEmits(["login-success", "forgot-password"]);

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const state = reactive({
  username: undefined,
  password: undefined,
  remember_me: true,
});

const validate = (state) => {
  const errors = [];

  // Username validation
  if (!state.username) {
    errors.push({ name: "username", message: "Username is required" });
  } else if (state.username.length < 3) {
    errors.push({
      name: "username",
      message: "Username must be at least 3 characters",
    });
  }

  // Password validation
  if (!state.password) {
    errors.push({ name: "password", message: "Password is required" });
  } else if (state.password.length < 6) {
    errors.push({
      name: "password",
      message: "Password must be at least 6 characters",
    });
  }

  return errors;
};

const onSubmit = async (event) => {
  try {
    authStore.clearError();

    const result = await authStore.login({
      username: event.data.username,
      password: event.data.password,
      remember_me: event.data.remember_me,
    });

    if (result.success) {
      toast.add({
        title: "Login Successful",
        description: "Welcome back!",
        color: "green",
      });

      await router.push("/");
    }
  } catch (error) {
    toast.add({
      title: "Login Failed",
      description: authStore.error || "Invalid credentials. Please try again.",
      color: "red",
    });
  }
};
</script>
