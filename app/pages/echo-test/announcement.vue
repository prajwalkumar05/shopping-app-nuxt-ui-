<template>
  <div class="min-h-screen bg-primary dark:bg-gray-900">
    <!-- Header -->
    <div
      class="bg-secondary dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-6xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <!-- Title -->
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-theme rounded-lg flex items-center justify-center"
            >
              <UIcon name="i-heroicons-megaphone" class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-3xl font-bold text-primary dark:text-white">
              Announcements
            </h1>
          </div>

          <!-- Status indicators -->
          <div class="flex items-center gap-4">
            <!-- Notification Status -->
            <div class="flex items-center gap-3">
              <span class="text-sm text-secondary dark:text-gray-300">{{
                notificationText
              }}</span>

              <!-- Enable Permission Button -->
              <UButton
                v-if="needsPermission"
                size="xs"
                variant="outline"
                @click="requestPermission"
                :loading="requestingPermission"
              >
                Enable Permission
              </UButton>

              <!-- Toggle Switch -->
              <div v-else-if="!isBlocked" class="flex items-center gap-2">
                <button
                  @click="toggleNotifications(!notificationsEnabled)"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300',
                  ]"
                  type="button"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200',
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1',
                    ]"
                  />
                </button>
                <span
                  class="text-xs text-gray-500 dark:text-gray-400 font-medium"
                >
                  {{ notificationsEnabled ? "On" : "Off" }}
                </span>
              </div>
            </div>

            <!-- Connection Status -->
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" :class="connectionColor"></div>
              <span class="text-sm text-secondary dark:text-gray-300">{{
                connectionStatus
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb -->
    <div class="max-w-6xl mx-auto px-6 py-4">
      <span class="text-primary dark:text-white">Announcements</span>
    </div>

    <!-- Announcements List -->
    <div class="max-w-6xl mx-auto px-6">
      <div class="bg-secondary dark:bg-gray-800 rounded-lg shadow-sm">
        <div class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="announcement in announcements"
            :key="announcement.id"
            class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="flex gap-6">
              <!-- Date -->
              <div class="w-20 text-sm text-gray-500 dark:text-gray-400">
                <div>{{ formatDate(announcement.timestamp) }}</div>
                <div class="text-xs">
                  {{ formatTime(announcement.timestamp) }}
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-primary dark:text-white">
                  {{ announcement.message }}
                </h3>
                <p
                  v-if="announcement.user?.name"
                  class="text-sm text-gray-500 dark:text-gray-400 mt-1"
                >
                  By {{ announcement.user.name }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="announcements.length === 0" class="p-12 text-center">
          <div
            class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4"
          >
            <UIcon name="i-heroicons-megaphone" class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-primary dark:text-white">
            No announcements yet
          </h3>
        </div>
      </div>

      <!-- Send Form -->
      <div
        v-if="canSendAnnouncement"
        class="mt-6 bg-secondary dark:bg-gray-800 rounded-lg shadow-sm p-6"
      >
        <div class="space-y-4">
          <div>
            <label
              class="block text-sm font-medium text-primary dark:text-white mb-2"
              >Message</label
            >
            <UTextarea
              v-model="newMessage"
              placeholder="Enter announcement message..."
              :disabled="!isConnected"
              :rows="4"
              class="w-full"
            />
          </div>
          <div class="flex justify-between items-center">
            <p v-if="!isConnected" class="text-sm text-red-600">
              ⚠️ Connecting...
            </p>
            <div class="flex gap-2 ml-auto">
              <UButton variant="ghost" @click="clearForm" :disabled="isSending">
                Cancel
              </UButton>
              <UButton
                @click="sendAnnouncement"
                :disabled="!newMessage.trim() || !isConnected || isSending"
                :loading="isSending"
                class="btn-theme-primary"
              >
                <UIcon name="i-heroicons-megaphone" class="w-4 h-4 mr-2" />
                Publish
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useReverb } from "~/composables/useReverb";
import { useSystemNotifications } from "~/composables/useSystemNotifications";

// User info
const currentUser = { id: 1, name: "Test User", role: "admin" };

// Config
const config = useRuntimeConfig();
const authToken = config.public.authToken;

// Get simple Reverb composable
const {
  subscribeToChannel,
  listenToEvent,
  unsubscribeFromChannel,
  connectionStatus,
  isConnected,
  connectionColor,
} = useReverb();

// Notifications composable
const {
  canShowNotifications,
  needsPermission,
  isBlocked,
  isDisabledByUser,
  notificationsEnabled,
  requestPermission,
  toggleNotifications,
  showAnnouncementNotification,
  initialize,
} = useSystemNotifications();

// Simple state
const announcements = ref([]);
const newMessage = ref("");
const isSending = ref(false);
const requestingPermission = ref(false);

// Computed properties
const canSendAnnouncement = computed(
  () => currentUser.role === "admin" || currentUser.role === "moderator"
);

const notificationText = computed(() => {
  if (isBlocked.value) return "Notification are Blocked";
  if (isDisabledByUser.value) return "Disabled";
  if (canShowNotifications.value) return "Enabled";
  return "Needs Permission";
});

// Cleanup function
let eventCleanup = null;

// ==========================================
// SIMPLE SETUP
// ==========================================

onMounted(() => {
  initialize(); // Initialize notifications
  setupAnnouncements();
});

onUnmounted(() => {
  cleanup();
});

const setupAnnouncements = () => {
  console.log("📢 Setting up announcements...");
  
  // 1. Subscribe to public channel
  subscribeToChannel("announcements");
  
  // 2. Listen for new announcements
  eventCleanup = listenToEvent("announcements", "MessageSent", handleAnnouncement);
  
  console.log("✅ Announcements setup complete");
};

// ==========================================
// SIMPLE ANNOUNCEMENT HANDLING
// ==========================================

const handleAnnouncement = (data) => {
  const announcement = {
    id: Date.now() + Math.random(),
    message: data.message || "No message",
    timestamp: data.timestamp || new Date().toISOString(),
    user: data.user || { id: null, name: "System" },
  };

  announcements.value.unshift(announcement);

  // Show notification if not from current user
  const isMyMessage = announcement.user.id === currentUser.id;
  if (!isMyMessage && canShowNotifications.value) {
    showAnnouncementNotification(announcement);
  }
};

const sendAnnouncement = async () => {
  if (!newMessage.value.trim() || !isConnected.value || isSending.value) {
    return;
  }

  isSending.value = true;
  
  try {
    // Get current language from i18n
    const { $i18n } = useNuxtApp();
    const currentLanguage = $i18n.locale.value;

    await $fetch("http://localhost:8000/api/sendAnnouncement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
        "Accept-Language": currentLanguage,        
        "X-User-Language": currentLanguage,        
      },
      body: { 
        message: newMessage.value.trim(),
        language: currentLanguage  // Optional: include in body too
      },
    });

    clearForm();
  } catch (error) {
    console.error("❌ Send announcement failed:", error);
  } finally {
    isSending.value = false;
  }
};

// ==========================================
// SIMPLE CLEANUP
// ==========================================

const cleanup = () => {
  // Clean up event listener
  if (eventCleanup) {
    eventCleanup();
  }
  
  // Unsubscribe from channel
  unsubscribeFromChannel("announcements");
};

// ==========================================
// SIMPLE UTILITIES
// ==========================================

const clearForm = () => {
  newMessage.value = "";
};

const formatDate = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "Invalid";
  }
};

const formatTime = (timestamp) => {
  try {
    return new Date(timestamp).getFullYear();
  } catch {
    return "Invalid";
  }
};
</script>