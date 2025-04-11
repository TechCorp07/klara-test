"use client";

import "@/styles/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/context/AuthContext";
import SessionTimeout from "@/components/auth/SessionTimeout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <SessionTimeout />
        <ToastContainer position="top-right" autoClose={5000} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
