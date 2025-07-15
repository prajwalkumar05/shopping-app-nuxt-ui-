// composables/useSystemNotifications.js
import { ref, computed } from "vue";

export const useSystemNotifications = () => {
  // State
  const notificationPermission = ref("default");
  const notificationsEnabled = ref(true);

  const isBrowser = typeof window !== "undefined";

  // Storage utilities
  const setStorage = (key, value) => {
    if (!isBrowser) return;
    localStorage.setItem(key, value);
  };

  const getStorage = (key) => {
    if (!isBrowser) return null;
    return localStorage.getItem(key);
  };

  // Initialize browser values
  if (isBrowser && "Notification" in window) {
    notificationPermission.value = Notification.permission;

    // Load saved preference
    const savedPreference = getStorage("notifications-enabled");
    if (savedPreference !== null) {
      notificationsEnabled.value = savedPreference === "true";
    }
  }

  // Computed properties
  const canShowNotifications = computed(() => {
    return (
      notificationPermission.value === "granted" && notificationsEnabled.value
    );
  });

  const needsPermission = computed(() => {
    return notificationPermission.value === "default";
  });

  const isBlocked = computed(() => {
    return notificationPermission.value === "denied";
  });

  const isDisabledByUser = computed(() => {
    return (
      notificationPermission.value === "granted" && !notificationsEnabled.value
    );
  });

  // Methods
  const requestPermission = async () => {
    if (!isBrowser) return false;

    try {
      const permission = await Notification.requestPermission();
      notificationPermission.value = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Permission request failed:", error);
      return false;
    }
  };

  const toggleNotifications = (enabled) => {
    if (!isBrowser) return;

    notificationsEnabled.value = enabled;
    setStorage("notifications-enabled", enabled.toString());
  };

  const isPageHidden = () => {
    return (
      isBrowser && (document.hidden || document.visibilityState === "hidden")
    );
  };

    const showAnnouncementNotification = (announcement) => {
    // Only show if page is hidden and notifications are enabled
    if (!isPageHidden() || !notificationsEnabled.value) {
      return null;
    }

    // if (!isPageHidden() || !notificationsEnabled.value &&  e.user.id !== currentUserId) {
    //   return null;
    // }

    const title = `New Announcement`;

    return showNotification({
      title,
      message: announcement.message,
      onClick: () => {
        console.log("Announcement notification clicked");
      },
    });
  };

  const showNotification = ({ title, message, onClick }) => {
    if (!canShowNotifications.value) return null;

    try {
      const notification = new Notification(title, {
        body: message,
        icon: "/favicon.ico",
      });

      notification.onclick = () => {
        if (window.focus) window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      return notification;
    } catch (error) {
      console.error("Failed to show notification:", error);
      return null;
    }
  };



  const initialize = async () => {
    if (!isBrowser) return false;

    // current browser notification permission status
    notificationPermission.value = Notification.permission;

    // returns true only when permission === 'granted'/
    return canShowNotifications.value;
  };

  return {
    // State
    canShowNotifications,
    needsPermission,
    isBlocked,
    notificationsEnabled,
    isDisabledByUser,

    // Methods
    requestPermission,
    toggleNotifications,
    showAnnouncementNotification,
    initialize,
  };
};
