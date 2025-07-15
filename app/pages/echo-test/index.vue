<template>
  <div class="min-h-screen bg-primary">
    <!-- Header -->
    <div class="bg-theme text-white p-4">
      <div class="max-w-4xl mx-auto flex-between">
        <div>
          <h1 class="text-xl font-bold">Chat</h1>
          <p class="text-sm opacity-75">{{ currentUser.name }}</p>
        </div>
        <div class="flex-center gap-2">
          <div class="w-3 h-3 rounded-full" :class="connectionColor"></div>
          <span class="text-sm capitalize">{{ connectionStatus }}</span>
        </div>
      </div>
    </div>

    <!-- Chat Container -->
    <div class="max-w-4xl mx-auto p-4">
      <div class="bg-secondary rounded-lg shadow-lg">
        <!-- Messages Container -->
        <div ref="messagesContainer" class="h-96 overflow-y-auto p-4 space-y-3">
          <!-- Message Items -->
          <div v-for="message in messages" :key="message.id" class="flex-start gap-3 p-3 bg-primary rounded-lg">
            <div class="w-10 h-10 bg-theme rounded-full flex-center text-white font-bold text-sm">
              {{ getInitials(message.user?.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex-center gap-2 mb-1">
                <span class="font-medium text-primary">{{
                  message.user?.name || "Unknown User"
                }}</span>
                <span class="text-xs text-secondary">{{
                  formatTime(message.timestamp)
                }}</span>
                <span v-if="message.user?.id === currentUser.id"
                  class="text-xs bg-theme text-white px-2 py-1 rounded">You</span>
              </div>
              <p class="text-primary break-words">{{ message.message }}</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="messages.length === 0" class="text-center py-8">
            <div class="text-secondary mb-4">
              <UIcon name="i-heroicons-chat-bubble-left-right" class="w-16 h-16 mx-auto" />
            </div>
            <p class="text-lg text-secondary mb-2">No messages yet</p>
            <p class="text-sm text-secondary">Start a conversation</p>
          </div>
        </div>

        <!-- Message Input -->
        <div class="p-4 border-t">
          <div class="flex gap-2">
            <UInput v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type your message..." class="flex-1"
              :disabled="!isConnected" />
            <UButton @click="sendMessage" :disabled="!newMessage.trim() || !isConnected || isSending"
              :loading="isSending" color="primary">
              <UIcon name="i-heroicons-paper-airplane" />
            </UButton>
          </div>
          
          <p v-if="!isConnected" class="text-sm text-red-600 mt-2">
            ⚠️ Connecting...
          </p>
          <p v-if="!isSubscribed && isConnected" class="text-sm text-orange-600 mt-2">
            ⚠️ Subscribing to private channel...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useReverb } from "~/composables/useReverb";

// Current user
const currentUser = {
  id: 1,
  name: "Test User",
};

// Config
const config = useRuntimeConfig();
const authToken = "3|Z75WukVSkJjuXvnEhNw9hJiCU9wGkugh7bJBZGKj1415122c";
const apiBaseUrl = config.public.apiBaseUrl || "http://localhost:8000";

// Get simple Reverb composable
const {
  subscribeToPrivateChannel,
  listenToPrivateEvent,
  setupChannelSubscriptionEvents,
  unsubscribeFromChannel,
  connectionStatus,
  isConnected,
  connectionColor,
} = useReverb();

// Simple state
const messages = ref([]);
const newMessage = ref("");
const isSubscribed = ref(false);
const isSending = ref(false);
const messagesContainer = ref(null);

// Cleanup function
let eventCleanup = null;

// ==========================================
// SIMPLE SETUP
// ==========================================

onMounted(() => {
  setupChat();
});

onUnmounted(() => {
  cleanup();
});

const setupChat = () => {
  console.log("🔐 Setting up chat...");
  
  // 1. Subscribe to private channel
  subscribeToPrivateChannel("chat");
  
  // 2. Setup subscription status tracking
  setupChannelSubscriptionEvents(
    "chat",
    () => isSubscribed.value = true,   // ✅ Success
    () => isSubscribed.value = false,  // ❌ Error
    true // isPrivate
  );
  
  // 3. Listen for messages
  eventCleanup = listenToPrivateEvent("chat", "MessageSent", handleMessage);
  
  console.log("✅ Chat setup complete");
};

// ==========================================
// SIMPLE MESSAGE HANDLING
// ==========================================

const handleMessage = (data) => {
  const message = {
    id: Date.now() + Math.random(),
    message: data.message || data.text || "No message content",
    user: data.user || { id: null, name: "Unknown User" },
    timestamp: data.timestamp || data.created_at || new Date().toISOString(),
  };

  messages.value.push(message);
  
  // Auto-scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !isConnected.value || isSending.value) {
    return;
  }

  isSending.value = true;
  const messageText = newMessage.value.trim();

  console.log()

  try {
    await $fetch(`${apiBaseUrl}/api/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: {
        message: messageText,
      },
    });

    newMessage.value = "";
  } catch (error) {
    console.error("❌ Send message error:", error);
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
  unsubscribeFromChannel("private-chat");
  
  // Reset state
  isSubscribed.value = false;
};

// ==========================================
// SIMPLE UTILITIES
// ==========================================

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (timestamp) => {
  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch {
    return "Invalid time";
  }
};
</script>