export default defineNuxtPlugin(() => {
  const { showAnnouncementNotification, initialize } = useSystemNotifications();

  // Initialize notifications
  initialize();

  // Create global notification handler
  const handleAnnouncement = (data) => {
    const announcement = {
      message: data.message || "No message",
      user: data.user || { name: "System" },
    };
    
    showAnnouncementNotification(announcement);
  };

  // Provide global notification methods
  return {
    provide: {
      notifications: {
        handleAnnouncement,
      }
    }
  };
});