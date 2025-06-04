import { getValidSession, deleteSession } from '../sessionStore.js'

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session-id');
  
  if (!sessionId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No session found'
    });
  }

  const session = getValidSession(sessionId);
  
  if (!session) {
    deleteCookie(event, 'session-id');
    throw createError({
      statusCode: 401,
      statusMessage: 'Session expired'
    });
  }

  return { 
    success: true,
    user: {
      id: session.id,
      username: session.username,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
    }
  };
});