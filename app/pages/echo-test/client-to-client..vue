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
            <!-- Online Users Count -->
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm text-secondary dark:text-gray-300">
                {{ onlineUsers.size }} online
              </span>
            </div>

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

    <!-- User Activity Notifications -->
    <div v-if="activityNotifications.length > 0" class="max-w-6xl mx-auto px-6 mb-4">
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <div class="space-y-1">
          <div v-for="notification in activityNotifications.slice(0, 3)" :key="notification.id" 
               class="text-sm text-blue-700 dark:text-blue-300">
            {{ notification.message }}
          </div>
          <div v-if="activityNotifications.length > 3" class="text-xs text-blue-600 dark:text-blue-400">
            +{{ activityNotifications.length - 3 }} more activities
          </div>
        </div>
      </div>
    </div>

    <!-- Typing Indicator for Announcements -->
    <div v-if="isAnyoneTyping" class="max-w-6xl mx-auto px-6 mb-4">
      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-pencil" class="w-4 h-4 text-yellow-600 animate-pulse" />
          <span class="text-sm text-yellow-700 dark:text-yellow-300">
            {{ typingText }}
          </span>
        </div>
      </div>
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
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold text-primary dark:text-white">
                    {{ announcement.message }}
                  </h3>
                  <!-- Online indicator for announcement author -->
                  <div v-if="announcement.user?.id && onlineUsers.has(announcement.user.id)" 
                       class="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
                </div>
                
                <div class="flex items-center gap-4">
                  <p v-if="announcement.user?.name" class="text-sm text-gray-500 dark:text-gray-400">
                    By {{ announcement.user.name }}
                  </p>
                  
                  <!-- Read Count -->
                  <div v-if="getAnnouncementReads(announcement.id) > 0" 
                       class="text-xs text-gray-400 flex items-center gap-1">
                    <UIcon name="i-heroicons-eye" class="w-3 h-3" />
                    {{ getAnnouncementReads(announcement.id) }} read
                  </div>
                  
                  <!-- Reactions -->
                  <div v-if="getAnnouncementReactions(announcement.id).length > 0" 
                       class="flex gap-1">
                    <span v-for="reaction in getAnnouncementReactions(announcement.id)" 
                          :key="reaction.emoji"
                          class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {{ reaction.emoji }} {{ reaction.count }}
                    </span>
                  </div>
                </div>
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
              @input="handleTyping"
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
const apiBaseUrl = config.public.apiBaseUrl || "http://localhost:8000";

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

// Component state
const announcements = ref([]);
const newMessage = ref("");
const isSending = ref(false);
const requestingPermission = ref(false);

// ==========================================
// CLIENT-TO-CLIENT STATE
// ==========================================

// Typing indicators
const typingUsers = ref(new Map());
const isAnyoneTyping = computed(() => {
  return Array.from(typingUsers.value.values()).some(user => user.id !== currentUser.id);
});


const typingText = computed(() => {
  const users = Array.from(typingUsers.value.values()).filter(user => user.id !== currentUser.id);
  const count = users.length;
  if (count === 0) return "";
  if (count === 1) return `${users[0].name} is writing an announcement...`;
  return `${count} people are writing announcements...`;
});

// Online users
const onlineUsers = ref(new Set());

// Activity notifications
const activityNotifications = ref([]);

// Announcement interactions
const announcementReads = ref(new Map()); // announcement_id -> count
const announcementReactions = ref(new Map()); // announcement_id -> [{emoji, count}]

// Typing timer
let typingTimer = null;
let isCurrentlyTyping = false;

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

// Cleanup functions
let eventCleanupFunctions = [];

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  initialize(); // Initialize notifications
  setupAnnouncements();
  setupClientToClientListeners();
});

onUnmounted(() => {
  cleanup();
});

// ==========================================
// SETUP FUNCTIONS
// ==========================================

const setupAnnouncements = () => {
  console.log("📢 Setting up announcements...");
  
  // Subscribe to public announcements channel
  subscribeToChannel("announcements");
  
  // Listen for new announcements
  const announcementCleanup = listenToEvent("announcements", "MessageSent", handleAnnouncement);
  eventCleanupFunctions.push(announcementCleanup);
  
  console.log("✅ Announcements setup complete");
};

const setupClientToClientListeners = () => {
    subscribeToChannel("user-activity");
  
  // ==========================================
  // 1. TYPING LISTENERS
  // ==========================================
  
  const typingStartCleanup = listenToEvent("announcements", "UserStartedTyping", (data) => {
    console.log("⌨️ User started typing announcement:", data.user.name);
    if (data.user.id !== currentUser.id) {
      typingUsers.value.set(data.user.id, data.user);
      // Auto-remove after 5 seconds
      setTimeout(() => typingUsers.value.delete(data.user.id), 5000);
    }
  });
  
  const typingStopCleanup = listenToEvent("announcements", "UserStoppedTyping", (data) => {
    console.log("⌨️ User stopped typing announcement:", data.user.name);
    typingUsers.value.delete(data.user.id);
  });
  
  // ==========================================
  // 2. USER ACTIVITY LISTENERS
  // ==========================================
  
  const userOnlineCleanup = listenToEvent("user-activity", "UserOnline", (data) => {
    console.log("🟢 User came online:", data.user.name);
    onlineUsers.value.add(data.user.id);
    
    if (data.user.id !== currentUser.id) {
      addActivityNotification(`${data.user.name} came online`);
    }
  });
  
  const userOfflineCleanup = listenToEvent("user-activity", "UserOffline", (data) => {
    console.log("🔴 User went offline:", data.user.name);
    onlineUsers.value.delete(data.user.id);
    
    if (data.user.id !== currentUser.id) {
      addActivityNotification(`${data.user.name} went offline`);
    }
  });
  
  // ==========================================
  // 3. ANNOUNCEMENT INTERACTION LISTENERS
  // ==========================================
  
  const announcementReadCleanup = listenToEvent("announcements", "AnnouncementRead", (data) => {
    console.log("👁️ Announcement read:", data.announcementId);
    const currentCount = announcementReads.value.get(data.announcementId) || 0;
    announcementReads.value.set(data.announcementId, currentCount + 1);
  });
  
  const announcementReactedCleanup = listenToEvent("announcements", "AnnouncementReacted", (data) => {
    console.log("😊 Announcement reacted:", data.announcementId, data.reaction);
    
    const reactions = announcementReactions.value.get(data.announcementId) || [];
    const existingReaction = reactions.find(r => r.emoji === data.reaction);
    
    if (existingReaction) {
      existingReaction.count++;
    } else {
      reactions.push({ emoji: data.reaction, count: 1 });
    }
    
    announcementReactions.value.set(data.announcementId, reactions);
    
    if (data.user.id !== currentUser.id) {
      addActivityNotification(`${data.user.name} reacted ${data.reaction} to an announcement`);
    }
  });
  
  // Store all cleanup functions
  eventCleanupFunctions.push(
    typingStartCleanup,
    typingStopCleanup,
    userOnlineCleanup,
    userOfflineCleanup,
    announcementReadCleanup,
    announcementReactedCleanup
  );
  
  console.log("✅ Client-to-client listeners setup complete");
};

// ==========================================
// EVENT HANDLERS
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
    addActivityNotification(`New announcement from ${announcement.user.name}`);
  }
};

const addActivityNotification = (message) => {
  const notification = {
    id: Date.now() + Math.random(),
    message,
    timestamp: new Date()
  };
  
  activityNotifications.value.unshift(notification);
  
  // Keep only last 10 notifications
  if (activityNotifications.value.length > 10) {
    activityNotifications.value = activityNotifications.value.slice(0, 10);
  }
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    const index = activityNotifications.value.findIndex(n => n.id === notification.id);
    if (index > -1) {
      activityNotifications.value.splice(index, 1);
    }
  }, 10000);
};

// ==========================================
// TYPING FUNCTIONALITY
// ==========================================

const sendTypingStart = async () => {
  if (isCurrentlyTyping) return;
  isCurrentlyTyping = true;
  
  try {
    await $fetch(`${apiBaseUrl}/api/typing/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: { channel: "announcements" }
    });
  } catch (error) {
    console.error("❌ Error sending typing start:", error);
    isCurrentlyTyping = false;
  }
};

const sendTypingStop = async () => {
  if (!isCurrentlyTyping) return;
  isCurrentlyTyping = false;
  
  try {
    await $fetch(`${apiBaseUrl}/api/typing/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: { channel: "announcements" }
    });
  } catch (error) {
    console.error("❌ Error sending typing stop:", error);
  }
};

const handleTyping = () => {
  if (!isConnected.value) return;
  
  if (newMessage.value.trim()) {
    sendTypingStart();
  }
  
  if (typingTimer) clearTimeout(typingTimer);
  typingTimer = setTimeout(() => sendTypingStop(), 3000);
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getAnnouncementReads = (announcementId) => {
  return announcementReads.value.get(announcementId) || 0;
};

const getAnnouncementReactions = (announcementId) => {
  return announcementReactions.value.get(announcementId) || [];
};

// ==========================================
// ANNOUNCEMENT FUNCTIONS
// ==========================================

const sendAnnouncement = async () => {
  if (!newMessage.value.trim() || !isConnected.value || isSending.value) {
    return;
  }

  isSending.value = true;
  
  try {
    await $fetch(`${apiBaseUrl}/api/sendAnnouncement`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: { message: newMessage.value.trim() },
    });

    clearForm();
  } catch (error) {
    console.error("❌ Send announcement failed:", error);
  } finally {
    isSending.value = false;
  }
};

const clearForm = () => {
  newMessage.value = "";
  if (typingTimer) {
    clearTimeout(typingTimer);
    sendTypingStop();
  }
};

// ==========================================
// CLEANUP
// ==========================================

const cleanup = () => {
  // Clear typing timer
  if (typingTimer) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }
  
  // Clean up event listeners
  eventCleanupFunctions.forEach(cleanupFn => {
    try {
      cleanupFn();
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    }
  });
  eventCleanupFunctions = [];
  
  // Unsubscribe from channels
  unsubscribeFromChannel("announcements");
  unsubscribeFromChannel("user-activity");
  
  // Reset state
  typingUsers.value.clear();
  onlineUsers.value.clear();
  activityNotifications.value = [];
  announcementReads.value.clear();
  announcementReactions.value.clear();
  isCurrentlyTyping = false;
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

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