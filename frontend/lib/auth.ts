// /lib/auth.ts
// Lightweight auth utilities for client-side usage
// - token stored in localStorage under "token"
// - user stored in localStorage under "user" (optional, from backend response)
// Keep functions small and testable.

export type UserPayload = {
    id?: string;
    name?: string;
    email?: string;
    role?: 'customer' | 'admin' | string;
    exp?: number;
    iat?: number;
    [k: string]: any;
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/**
 * Save token to localStorage
 */
export const setToken = (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Read token from localStorage
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove token + user from localStorage (logout)
 */
export const removeToken = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

/**
 * Save the user object returned from backend (optional convenience)
 */
export const setUser = (user: object | null) => {
    if (typeof window === 'undefined') return;
    if (!user) {
        localStorage.removeItem(USER_KEY);
        return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Read saved user object (if any)
 */
export const getSavedUser = <T = any>(): T | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
};

/**
 * Decode JWT payload safely (client-only).
 * Returns null if token missing or invalid.
 */
export const decodeToken = (token?: string): UserPayload | null => {
    if (!token) token = getToken() || undefined;
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        // payload is middle part
        const payload = parts[1];
        // atob for base64 decode (URL-safe base64 needs replacement)
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        // pad with '='
        const pad = base64.length % 4;
        const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
        const json = decodeURIComponent(
            Array.prototype.map
                .call(atob(padded), (c: string) => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(json) as UserPayload;
    } catch (err) {
        console.warn('Failed to decode token', err);
        return null;
    }
};

/**
 * Returns the current user payload reading from token (preferred) or saved user.
 */
export const getCurrentUser = (): UserPayload | null => {
    const decoded = decodeToken();
    if (decoded) return decoded;
    // fallback to saved user object
    return getSavedUser<UserPayload>();
};

/**
 * Returns boolean if user is authenticated and token not expired.
 */
export const isAuthenticated = (): boolean => {
    const payload = decodeToken();
    if (!payload) return false;
    if (payload.exp && typeof payload.exp === 'number') {
        // exp is in seconds since epoch
        const nowSec = Math.floor(Date.now() / 1000);
        return payload.exp > nowSec;
    }
    return true;
};

/**
 * Returns the role from token/user if available.
 */
export const getUserRole = (): string | null => {
    const user = getCurrentUser();
    return user && user.role ? user.role : null;
};

/**
 * Helper to create Authorization header object
 */
export const authHeader = (): { Authorization?: string } => {
    const token = getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};


// Call this whenever user logs in
export const emitLogin = (user: UserPayload) => {
    if (typeof window === 'undefined') return;
    setUser(user);
    window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
};

// Call this whenever user logs out
export const emitLogout = () => {
    if (typeof window === 'undefined') return;
    removeToken();
    window.dispatchEvent(new CustomEvent('auth:logout'));
};

// /lib/auth.ts (add at the end)
type AuthListener = (user: UserPayload | null) => void;

const listeners: AuthListener[] = [];

export const subscribeAuth = (listener: AuthListener) => {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
};

// Call this after login
export const notifyLogin = (user: UserPayload) => {
    setUser(user);
    listeners.forEach((fn) => fn(user));
};

// Call this after logout
export const notifyLogout = () => {
    removeToken();
    listeners.forEach((fn) => fn(null));
};
