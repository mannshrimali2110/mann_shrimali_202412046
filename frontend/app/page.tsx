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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{
        status: string;
        data: { products: Product[] };
      }>('/products');
      if (data.status !== 'success') {
        setErrorMsg('Failed to load products');
        return;
      }
      setProducts(data.data.products);
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Products</h1>

      {loading ? (
        <div className="text-gray-700 font-medium">Loading products...</div>
      ) : errorMsg ? (
        <div className="text-red-700 font-medium">{errorMsg}</div>
      ) : products.length === 0 ? (
        <div className="text-gray-700 font-medium">No products available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <Link
              key={p._id}
              href={`/products/${p._id}`}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col h-full group"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {p.name}
                  </h2>
                  <span className="inline-block mt-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {p.category}
                  </span>
                </div>

                <div className="mt-4 text-indigo-600 font-bold text-lg">
                  ${p.price.toFixed(2)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
