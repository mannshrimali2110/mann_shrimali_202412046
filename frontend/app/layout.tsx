import './globals.css';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'E-Commerce App',
  description: 'Basic E-commerce frontend with Next.js + Tailwind',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        <footer className="bg-white text-gray-600 text-center py-4 mt-auto shadow-inner">
          &copy; {new Date().getFullYear()} E-Commerce App. All rights reserved.
        </footer>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              style: {
                background: '#059669',
                color: '#fff',
              },
            },
            error: {
              style: {
                background: '#DC2626',
                color: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
