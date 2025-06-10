'use client';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
    }
  }, [getSession, router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}