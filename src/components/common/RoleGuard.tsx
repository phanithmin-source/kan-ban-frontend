import React from "react";
import { useAuth } from "../../hooks/useAuth";

interface RoleGuardProps {
  roles: ("USER" | "MANAGER" | "ADMIN")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
