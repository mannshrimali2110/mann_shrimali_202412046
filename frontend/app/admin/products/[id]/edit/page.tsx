'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function AdminEditProductPage() {
    const { id } = useParams();
    const [form, setForm] = useState({ name: '', category: '', price: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await apiFetch<{ data: { product: any } }>(`/products/${id}`, { auth: true });
                setForm({ name: data.data.product.name, category: data.data.product.category, price: data.data.product.price.toString() });
                setLoading(false);
            } catch (err: any) {
                setErrorMsg(err.message || 'Failed to load product');
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');

        try {
            await apiFetch(`/products/${id}`, {
                method: 'PUT',
                auth: true,
                body: JSON.stringify({ name: form.name, category: form.category, price: parseFloat(form.price) }),
            });
            router.push('/admin/products');
        } catch (err: any) {
            setErrorMsg(err.message || 'Update failed');
            setSaving(false);
        }
    };

    if (loading) return <div className="text-gray-500">Loading product...</div>;

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Product</h1>
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
                    disabled={saving}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:opacity-95 transition"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
