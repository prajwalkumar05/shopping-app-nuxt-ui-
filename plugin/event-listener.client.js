export default defineNuxtPlugin(() => {
  const { connect } = useEventListener()
  
  // Auto-connect to your backend when app starts
  const backendUrl = 'http://localhost:3000/api/test-broadcast'
  console.log("hello")
  
  connect(backendUrl)
})