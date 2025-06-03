// Global API configuration
export const getApiBaseUrl = () => {
  const { apiBaseUrl } = useRuntimeConfig().public
  return apiBaseUrl
}
