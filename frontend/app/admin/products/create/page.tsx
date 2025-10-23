'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function AdminCreateProductPage() {
    const [form, setForm] = useState({ name: '', category: '', price: '', sku: '' });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            await apiFetch('/products', {
                method: 'POST',
                auth: true,
                body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
            });
            router.push('/admin/products');
        } catch (err: any) {
            setErrorMsg(err.message || 'Creation failed');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Add Product</h1>
            {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Product Name"
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Category"
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="SKU"
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    step="0.01"
                    className="w-full p-2 border rounded"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:opacity-95 transition"
                >
                    {loading ? 'Creating...' : 'Create Product'}
                </button>
            </form>
        </div>
    );
}
