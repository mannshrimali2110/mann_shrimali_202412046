'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type Product = {
    _id: string;
    name: string;
    price: number;
    category: string;
    sku: string;
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await apiFetch<{ data: { products: Product[] } }>('/products');
                setProducts(data.data.products);
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setErrorMsg(err.message || 'Failed to fetch products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="text-gray-500">Loading products...</div>;
    if (errorMsg) return <div className="text-red-600">{errorMsg}</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
                <div
                    key={p._id}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
                >
                    <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
                    <p className="text-gray-600">Category: {p.category}</p>
                    <p className="text-gray-700 font-medium mt-2">${p.price.toFixed(2)}</p>
                    <Link
                        href={`/products/${p._id}`}
                        className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:opacity-95 transition"
                    >
                        View Details
                    </Link>
                </div>
            ))}
        </div>
    );
}
