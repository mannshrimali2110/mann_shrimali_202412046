'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken, notifyLogin } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const loginPromise = toast.promise(
            apiFetch<{
                status: string;
                token: string;
                data: { user: { id: string; name: string; email: string; role: string } };
            }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            }),
            {
                loading: 'Logging in...',
                success: 'Welcome back!',
                error: (err) => err instanceof Error ? err.message : 'Login failed. Please try again.',
            }
        );

        try {
            const data = await loginPromise;
            setToken(data.token);

            // Use reactive notifyLogin instead of setUser
            notifyLogin(data.data.user);

            // Redirect after login
            router.push(redirectUrl);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Login</h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                    <label className="block text-gray-700 text-sm mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-sm hover:opacity-95 transition"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
                Don’t have an account?{' '}
                <a href="/signup" className="text-indigo-600 hover:underline">
                    Sign up
                </a>
            </p>
        </div>
    );
}
