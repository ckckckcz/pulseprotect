"use client";

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getHomePathForRole } from '@/lib/role-utils';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const role = user.role || 'user';
    const hasRequiredRole = allowedRoles.includes(role);

    if (!hasRequiredRole) {
      router.push(getHomePathForRole(role as any));
      return;
    }

    setAuthorized(true);
  }, [user, loading, router, allowedRoles]);

  if (loading || authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="ml-2 text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
