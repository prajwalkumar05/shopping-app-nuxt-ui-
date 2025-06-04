import { deleteSession } from '../sessionStore.js'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session-id');
  
  if (sessionId) {
    deleteSession(sessionId);
    deleteCookie(event, 'session-id');
  }

  return { success: true };
});