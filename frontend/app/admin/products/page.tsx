'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Product = {
    _id: string;
    name: string;
    price: number;
    category: string;
    sku: string;
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const router = useRouter();

    const fetchProducts = async () => {
        try {
            const data = await apiFetch<{ data: { products: Product[] } }>('/products', { auth: true });
            setProducts(data.data.products);
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Failed to fetch products');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await apiFetch(`/products/${id}`, { method: 'DELETE', auth: true });
            setProducts(products.filter((p) => p._id !== id));
        } catch (err: any) {
            alert(err.message || 'Delete failed');
        }
    };

    if (loading) return <div className="text-gray-700 font-medium">Loading products...</div>;
    if (errorMsg) return <div className="text-red-700 font-medium">{errorMsg}</div>;

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Admin Products</h1>
                <Link
                    href="/admin/products/create"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:opacity-95 transition"
                >
                    Add Product
                </Link>
            </div>

            <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-800 font-semibold">Name</th>
                        <th className="px-4 py-2 text-left text-gray-800 font-semibold">Category</th>
                        <th className="px-4 py-2 text-left text-gray-800 font-semibold">Price</th>
                        <th className="px-4 py-2 text-left text-gray-800 font-semibold">SKU</th>
                        <th className="px-4 py-2 text-left text-gray-800 font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p._id} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-900 font-medium">{p.name}</td>
                            <td className="px-4 py-2 text-gray-900 font-medium">{p.category}</td>
                            <td className="px-4 py-2 text-gray-900 font-medium">${p.price.toFixed(2)}</td>
                            <td className="px-4 py-2 text-gray-900 font-medium">{p.sku}</td>
                            <td className="px-4 py-2 space-x-2">
                                <Link
                                    href={`/admin/products/${p._id}/edit`}
                                    className="text-indigo-600 hover:underline font-medium"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(p._id)}
                                    className="text-red-600 hover:underline font-medium"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
