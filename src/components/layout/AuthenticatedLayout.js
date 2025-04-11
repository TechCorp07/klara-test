"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function AuthenticatedLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));

    if (!isAuthenticated && !isPublicRoute) router.push("/login");

    if (isAuthenticated && isPublicRoute) {
      // role‑based landing page
      const base = user?.role === "admin" || user?.role === "superadmin"
        ? "/admin/dashboard"
        : user?.role === "compliance"
        ? "/compliance/dashboard"
        : "/dashboard";
      router.push(base);
    }
  }, [loading, isAuthenticated, pathname, router, user]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (publicRoutes.some((r) => pathname.startsWith(r))) return children;

  return isAuthenticated ? children : null;
}
