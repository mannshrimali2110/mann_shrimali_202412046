'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { isAuthenticated, getToken } from '@/lib/auth';

type Product = {
    _id: string;
    name: string;
    price: number;
    category: string;
    sku: string;
};

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await apiFetch<{ data: { product: Product } }>(`/products/${id}`);
                setProduct(data.data.product);
                setLoading(false);
            } catch (err: any) {
                console.error(err);
                setErrorMsg(err.message || 'Failed to fetch product');
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!isAuthenticated()) {
            alert('Please login to add items to your cart');
            router.push('/login');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((item: any) => item.productId === product?._id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ productId: product?._id, quantity: 1, name: product?.name, price: product?.price });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert('Added to cart');
    };

    if (loading) return <div className="text-gray-500">Loading product...</div>;
    if (errorMsg) return <div className="text-red-600">{errorMsg}</div>;
    if (!product) return <div className="text-gray-500">Product not found</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md">
            <h1 className="text-2xl font-semibold text-gray-800">{product.name}</h1>
            <p className="text-gray-600 mt-2">Category: {product.category}</p>
            <p className="text-gray-700 font-medium mt-4">${product.price.toFixed(2)}</p>
            <p className="text-gray-500 mt-2">SKU: {product.sku}</p>

            <button
                onClick={handleAddToCart}
                className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-2xl hover:opacity-95 transition"
            >
                Add to Cart
            </button>
        </div>
    );
}
