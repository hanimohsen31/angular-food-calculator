// the session this browser holds. the token is what every request is signed
// with, the user is what the screens read the name and the role off.
//
// the keys sit in a file of their own so the services that need them do not
// have to import each other in a circle
export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

export function storedToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function storedUser(): any {
  let stored = localStorage.getItem(USER_KEY);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    // a corrupted entry is not a session
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function storedUserId(): string {
  return storedUser()?.uid || storedUser()?.id || '';
}
