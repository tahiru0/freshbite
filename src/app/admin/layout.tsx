import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import "../globals.css";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Admin Panel - Fresh Bite',
  description: 'Admin dashboard for food delivery management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-100`}
      >
        <div className="min-h-screen flex">
          {/* Admin Sidebar */}
          <aside className="w-64 bg-white shadow-lg">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-800">FreshBite Admin</h1>
            </div>
            <nav className="mt-6">
              <div className="px-6 py-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quản lý</h2>
              </div>
              <a href="/admin/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                📊 Dashboard
              </a>
              <a href="/admin/users" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                👥 Users
              </a>
              <a href="/admin/products" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                🍽️ Products
              </a>
              <a href="/admin/categories" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                📂 Categories
              </a>
              <a href="/admin/combos" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                📦 Combos
              </a>
              <a href="/admin/orders" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                📋 Orders
              </a>
              <div className="border-t border-gray-200 mt-6 pt-6">
                <Link href="/" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  ← Back to Website
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <header className="bg-white shadow-sm border-b">
              <div className="px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
              </div>
            </header>
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </body>
    </html>
  );
}
