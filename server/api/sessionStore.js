// server/sessionStore.js
import crypto from 'crypto'

global.sessionStore = global.sessionStore || new Map();

export function createSession(userData, rememberMe = false) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const session = {
    ...userData,
    rememberMe,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  
  global.sessionStore.set(sessionId, session);
  return sessionId;
}

export function getValidSession(sessionId) {
  const session = global.sessionStore.get(sessionId);
  if (!session) {
    return null;
  }
  
  const now = Date.now();
  const lastActivity = session.lastActivity;
  const timePassed = now - lastActivity;
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  
  // If remember me is enabled, never expire
  if (session.rememberMe) {
    console.log('✅ Remember me enabled - session never expires');
    session.lastActivity = now;
    global.sessionStore.set(sessionId, session);
    return session;
  }
  
  if (timePassed > fiveMinutes) {
    global.sessionStore.delete(sessionId);
    return null;
  }
  
  // Update last activity for valid session
  session.lastActivity = now;
  global.sessionStore.set(sessionId, session);
  return session;
}

export function deleteSession(sessionId) {
  const deleted = global.sessionStore.delete(sessionId);
  return deleted;
}