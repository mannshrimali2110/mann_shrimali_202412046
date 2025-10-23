// /lib/api.ts
import { getToken } from './auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
    auth?: boolean; // whether to include JWT token
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (options.auth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        
        const data = await res.json().catch(() => ({ 
            status: 'error',
            message: 'Invalid JSON response from server'
        }));

        // Check if the response is not ok (status >= 400)
        if (!res.ok) {
            throw new Error(data.message || `API request failed with status ${res.status}`);
        }

        // Check if the response doesn't have the expected success status
        if (data.status === 'fail' || data.status === 'error') {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('API request failed');
    }
}
