import { getValidSession } from '../sessionStore.js'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session-id');
  
  if (!sessionId) {
    throw createError({ statusCode: 401, statusMessage: 'No session' });
  }

  const session = getValidSession(sessionId);
  
  if (!session) {
    // Session expired - clear cookie
    deleteCookie(event, 'session-id');
    throw createError({ statusCode: 401, statusMessage: 'Session expired' });
  }

  return {
    user: {
      id: session.id,
      username: session.username,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
    },
    isAuthenticated: true,
    rememberMe: session.rememberMe
  };
});