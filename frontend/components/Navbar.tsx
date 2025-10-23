'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { getCurrentUser, isAuthenticated, notifyLogout, subscribeAuth } from '@/lib/auth';

interface User {
    name: string;
    role: string;
}

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);

    const userDropdownRef = useRef<HTMLDivElement>(null);
    const reportsDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial load
        const currentUser = getCurrentUser();
        if (currentUser && isAuthenticated()) {
            setUser({ name: currentUser.name || 'User', role: currentUser.role || '' });
        }

        // Subscribe to login/logout
        const unsubscribe = subscribeAuth((newUser) => {
            if (newUser) {
                setUser({ name: newUser.name || 'User', role: newUser.role || '' });
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogoutClick = () => {
        notifyLogout();
        setIsUserDropdownOpen(false);
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">E-Shop</Link>

                <div className="flex items-center space-x-4">
                    <Link href="/products" className="text-gray-800 font-medium hover:text-indigo-600 transition">Products</Link>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <>
                                    <Link href="/admin/products" className="text-gray-800 font-medium hover:text-indigo-600 transition">Admin</Link>
                                    <div className="relative" ref={reportsDropdownRef}>
                                        <button onClick={() => setIsReportsDropdownOpen(!isReportsDropdownOpen)} className="text-gray-800 font-medium hover:text-indigo-600 transition">
                                            Reports
                                        </button>
                                        {isReportsDropdownOpen && (
                                            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                                <Link href="/reports/daily-revenue" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition" onClick={() => setIsReportsDropdownOpen(false)}>Daily Revenue</Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <Link href="/cart" className="text-gray-800 font-medium hover:text-indigo-600 transition">Cart</Link>

                            <div className="relative" ref={userDropdownRef}>
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-gray-800">{user.name}</span>
                                </div>

                                {isUserDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                                            Signed in as<br /><span className="font-medium">{user.name}</span>
                                        </div>
                                        <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition">
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-800 font-medium hover:text-indigo-600 transition">Login</Link>
                            <Link href="/signup" className="bg-indigo-600 text-white px-3 py-1 rounded-2xl hover:bg-indigo-700 transition font-medium">Signup</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
