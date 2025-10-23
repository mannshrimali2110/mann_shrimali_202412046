'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
};

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            alert('Please login to view your cart');
            router.push('/login');
            return;
        }

        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);
    }, [router]);

    const updateQuantity = (id: string, quantity: number) => {
        const updated = cart.map((item) =>
            item.productId === id ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
    };

    const removeItem = (id: string) => {
        const updated = cart.filter((item) => item.productId !== id);
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (cart.length === 0)
        return <div className="text-gray-500 text-center mt-10">Your cart is empty.</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">My Cart</h1>
            <div className="space-y-4">
                {cart.map((item) => (
                    <div
                        key={item.productId}
                        className="flex justify-between items-center border-b border-gray-200 pb-4"
                    >
                        <div>
                            <h2 className="text-gray-800 font-medium">{item.name}</h2>
                            <p className="text-gray-600">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                value={item.quantity}
                                min={1}
                                onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                                className="w-16 p-1 border rounded"
                            />
                            <button
                                onClick={() => removeItem(item.productId)}
                                className="text-red-600 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <p className="text-lg font-semibold">Subtotal: ${subtotal.toFixed(2)}</p>
                <button
                    onClick={() => router.push('/checkout')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:opacity-95 transition"
                >
                    Checkout
                </button>
            </div>
        </div>
    );
}
