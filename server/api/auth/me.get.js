import { getValidSession } from '../sessionStore.js'

export default defineEventHandler(async (event) => {
  
  const sessionId = getCookie(event, 'session-id');
  
  if (!sessionId) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'No session found' 
    });
  }

  // This is the key call that checks expiry!
  const session = getValidSession(sessionId);
  
  if (!session) {
    deleteCookie(event, 'session-id');
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Session expired' 
    });
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