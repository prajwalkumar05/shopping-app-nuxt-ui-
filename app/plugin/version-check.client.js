export default defineNuxtPlugin(() => {
  const toast = useToast()
  const config = useRuntimeConfig()

  // Function to check for updates
  const checkForUpdates = async () => {
    try {
      // Get the current version from the server
      const response = await fetch('/version.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) return
      
      const { version } = await response.json()
      const currentVersion = version
      const configVersion = config.public.APP_VERSION

      console.log('currentVersion', currentVersion)
      console.log('configVersion', configVersion)
      
      // If versions don't match, show update notification
      if (currentVersion !== configVersion) {
        toast.add({
          title: 'Update Available',
          description: 'A new version is available. Please refresh the page to get the latest features and bug fixes.',
          color: 'primary',
          icon: 'ri:refresh-line',
          duration: 0,
          close: false,
          actions: [
            {
              label: 'Refresh Now',
              onClick: () => {
                // Clear cache and reload
                if ('caches' in window) {
                    caches.keys().then(function(names) {
                        for (let name of names) {
                            caches.delete(name);
                        }
                    });
                }
                window.location.reload(true);
              }
            }
          ]
        })
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }

  // Check for updates every 1 hour
  if (import.meta.client) {
    // Initial check
    checkForUpdates()
    
    // Set up periodic checks
    // setInterval(checkForUpdates, 1 * 60 * 60 * 1000)
    setInterval(checkForUpdates, 1 * 60 * 1000)

  }
}) 