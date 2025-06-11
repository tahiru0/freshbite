import type { Metadata } from 'next';

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
    <div className="admin-layout">
      {children}
    </div>
  );
}
