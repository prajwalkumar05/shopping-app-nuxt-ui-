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
  if (!session) return null;
  
  // If remember me is enabled, never expire
  if (session.rememberMe) {
    session.lastActivity = Date.now(); 
    global.sessionStore.set(sessionId, session);
    return session;
  }
  
  // Check if 30 minuts passed
  const thirtyMinutes = 30 * 60 * 1000;
  if (Date.now() - session.lastActivity > thirtyMinutes) {
    global.sessionStore.delete(sessionId); // Delete expired session
    return null;
  }
  
  // Update last activity
  session.lastActivity = Date.now();
  global.sessionStore.set(sessionId, session);
  return session;
}

export function deleteSession(sessionId) {
  return global.sessionStore.delete(sessionId);
}