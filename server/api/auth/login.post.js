import { createSession } from '../sessionStore.js'

export default defineEventHandler(async (event) => {
  const { username, password, remember_me } = await readBody(event);

  // Verify with DummyJSON
  const response = await $fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    body: { username, password, expiresInMins: 30 }
  });

  if (!response.accessToken) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }

  // Create session
  const userData = {
    id: response.id,
    username: response.username,
    email: response.email,
    firstName: response.firstName,
    lastName: response.lastName,
  };

  const sessionId = createSession(userData, remember_me);

  // Set cookie
  setCookie(event, 'session-id', sessionId, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: remember_me ? 30 * 24 * 60 * 60 : 30 * 60
  });

  return { success: true, user: userData };
});