export type UserRole = 'admin' | 'user';

type StoredUser = {
  id?: string;
  role?: string;
  [key: string]: unknown;
};

export const AUTH_STATE_CHANGED_EVENT = 'schedly-auth-state-changed';

export const getStoredUser = (): StoredUser | null => {
  const userData = sessionStorage.getItem('user');

  if (!userData) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(userData);

    if (!parsedUser || typeof parsedUser !== 'object') {
      return null;
    }

    return parsedUser;
  } catch {
    return null;
  }
};

export const getStoredUserRole = (): UserRole | null => {
  const role = getStoredUser()?.role;

  if (role === 'admin' || role === 'user') {
    return role;
  }

  return null;
};

export const setStoredAuth = (user: unknown, session: unknown) => {
  sessionStorage.setItem('user', JSON.stringify(user));
  sessionStorage.setItem('session', JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
};

export const clearStoredAuth = () => {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('session');
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
};

export const subscribeToAuthChanges = (callback: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.storageArea !== sessionStorage) {
      return;
    }

    if (!event.key || event.key === 'user' || event.key === 'session') {
      callback();
    }
  };

  window.addEventListener(AUTH_STATE_CHANGED_EVENT, callback);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED_EVENT, callback);
    window.removeEventListener('storage', handleStorage);
  };
};
