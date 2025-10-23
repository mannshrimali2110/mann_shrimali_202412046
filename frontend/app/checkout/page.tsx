'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
};

export default function CheckoutPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            alert('Please login to checkout');
            router.push('/login');
            return;
        }
    }, [router]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        setCart(storedCart);
    }, []);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        setLoading(true);
        try {
            await apiFetch<{ status: string; data: { order: { id: string; userId: string; total: number } } }>('/orders/checkout', {
                method: 'POST',
                auth: true,
                body: JSON.stringify({
                    cart: cart.map((item) => ({ 
                        productId: item.productId, 
                        quantity: item.quantity 
                    }))
                }),
            });
            localStorage.removeItem('cart');
            setCart([]);
            setMessage('Order placed successfully!');
            setLoading(false);
        } catch (err) {
            console.error(err);
            setMessage(err instanceof Error ? err.message : 'Checkout failed');
            setLoading(false);
        }
    };

    if (cart.length === 0 && !message)
        return <div className="text-gray-500 text-center mt-10">Your cart is empty.</div>;

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Checkout</h1>

            {cart.map((item) => (
                <div
                    key={item.productId}
                    className="flex justify-between border-b border-gray-200 py-2"
                >
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}

            <div className="flex justify-between font-semibold mt-4">
                <span>Total:</span>
                <span>${cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</span>
            </div>

            {message && <p className="text-green-600 mt-4">{message}</p>}

            <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:opacity-95 transition"
            >
                {loading ? 'Processing...' : 'Place Order'}
            </button>
        </div>
    );
}
