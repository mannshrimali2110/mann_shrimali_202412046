// /app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setToken, setUser } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect') || '/';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const signupPromise = toast.promise(
            apiFetch<{
                status: string;
                token: string;
                data: { user: { id: string; name: string; email: string; role: string } };
            }>('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            }),
            {
                loading: 'Creating your account...',
                success: 'Account created successfully!',
                error: (err) => err instanceof Error ? err.message : 'Registration failed. Please try again.',
            }
        );

        try {
            const data = await signupPromise;
            setToken(data.token);
            setUser(data.data.user);
            router.push(redirectUrl);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800 text-center">Sign Up</h1>

            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div>
                    <label className="block text-gray-700 text-sm mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

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
                        minLength={6}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-sm hover:opacity-95 transition"
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
                Already have an account?{' '}
                <a href="/login" className="text-indigo-600 hover:underline">
                    Login
                </a>
            </p>
        </div>
    );
}
