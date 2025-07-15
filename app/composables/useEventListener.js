// composables/useEventListener.js
export const useEventListener = () => {
  const connection = ref(null);
  const isConnected = ref(false);
  const events = ref([]);
  const eventCount = ref(0);

  // Connect to backend
  const connect = (backendUrl) => {
    // Close existing connection
    if (connection.value) {
      connection.value.close();
    }

    try {
      // Create connection to backend
      connection.value = new EventSource(backendUrl);

      // When connected
      connection.value.onopen = () => {
        isConnected.value = true;
        console.log("Connected to backend broadcasts");
      };

      // When we receive data from backend
      connection.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data);

          // even to our reactive events array
          addEventToList(data);

          handleBackendBroadcast(data);
        } catch (error) {
          console.error("Error parsing broadcast data:", error);
        }
      };

      // When connection fails
      connection.value.onerror = () => {
        isConnected.value = false;
        console.log("Connection to backend failed");
      };
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  // Add event
  const addEventToList = (data) => {
    const newEvent = {
      id: Date.now() + Math.random(),
      type: data.type,
      data: data.data,
      timestamp: new Date(),
    };

    // Add to beginning of array
    events.value.unshift(newEvent);

    // Keep only last 50 events t
    if (events.value.length > 50) {
      events.value = events.value.slice(0, 50);
    }

    // Update counter
    eventCount.value++;
  };

  // Clear all events
  const clearEvents = () => {
    events.value = [];
    eventCount.value = 0;
  };

  // Disconnect
  const disconnect = () => {
    if (connection.value) {
      connection.value.close();
      connection.value = null;
      isConnected.value = false;
    }
  };

  // This function gets called when backend sends data
  const handleBackendBroadcast = (data) => {
    console.log("Processing broadcast:", data);

    //    Call different functions based on broadcast type
    if (data.type === "user_created") {
      onUserCreated(data.data);
    } else if (data.type === "order_updated") {
      onOrderUpdated(data.data);
    } else if (data.type === "notification") {
      onNotification(data.data);
    } else {
      // Handle any other broadcast
      onGenericBroadcast(data);
    }
  };

  const onUserCreated = (userData) => {
    console.log("New user created:", userData);
  };

  const onOrderUpdated = (orderData) => {
    console.log("Order updated:", orderData);
  };

  const onNotification = (notificationData) => {
    console.log("New notification:", notificationData);
  };

  const onGenericBroadcast = (data) => {
    console.log("Generic broadcast:", data);
  };

  // Test connection function
  const testConnection = (backendUrl) => {
    return new Promise((resolve, reject) => {
      const testConnection = new EventSource(backendUrl);

      testConnection.onopen = () => {
        testConnection.close();
        resolve("Backend is working!");
      };

      testConnection.onerror = () => {
        testConnection.close();
        reject("Backend connection failed!");
      };

      testConnection.onmessage = () => {
        testConnection.close();
        resolve("Received test data!");
      };

      // Timeout after 5 seconds
      setTimeout(() => {
        testConnection.close();
        reject("Connection timeout!");
      }, 5000);
    });
  };

  // Cleanup when component unmounts
  onUnmounted(() => {
    disconnect();
  });

  // Computed values
  const userCount = computed(
    () => events.value.filter((e) => e.type.includes("user")).length
  );

  const orderCount = computed(
    () => events.value.filter((e) => e.type.includes("order")).length
  );

  const notificationCount = computed(
    () => events.value.filter((e) => e.type.includes("notification")).length
  );

  return {
    // Connection methods
    connect,
    disconnect,
    testConnection,

    // Reactive state
    isConnected: readonly(isConnected),
    events: readonly(events),
    eventCount: readonly(eventCount),

    // Computed counters
    userCount: readonly(userCount),
    orderCount: readonly(orderCount),
    notificationCount: readonly(notificationCount),

    // Utility methods
    clearEvents,
  };
};
