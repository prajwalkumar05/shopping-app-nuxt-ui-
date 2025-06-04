import { createSession } from '../sessionStore.js'

export default defineEventHandler(async (event) => {
  try {
    const { username, password, remember_me } = await readBody(event);

    console.log('Login attempt:', { username, remember_me });

    // Verify with DummyJSON
    const response = await $fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      body: { username, password, expiresInMins: 5 }
    });

    console.log('DummyJSON response:', { success: !!response.accessToken, id: response.id });

    if (!response.accessToken) {
      throw createError({ 
        statusCode: 401, 
        statusMessage: 'Invalid credentials' 
      });
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

    setCookie(event, 'session-id', sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: remember_me ? 30 * 24 * 60 * 60 : 5 * 60 
    });


    return { 
      success: true, 
      user: userData 
    };

  } catch (error) {

    throw createError({ 
      statusCode: error.statusCode || 401, 
      statusMessage: error.statusMessage || error.message || 'Login failed' 
    });
  }
});