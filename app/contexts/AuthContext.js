"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { auth, isAuthenticated } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState(null);
  const router = useRouter();

  // Fetch current user if already authenticated
  const {
    data: currentUser,
    isLoading: isUserLoading,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => auth.getMe(),
    enabled: isAuthenticated(),
    retry: false,
    onSuccess: (data) => setUser(data),
    onError: () => {
      auth.logout();
      setUser(null);
    },
  });

  useEffect(() => {
    setLoading(isAuthenticated() ? isUserLoading : false);
  }, [isUserLoading]);

  // ----------------- Auth helpers -----------------
  const login = async (credentials) => {
    const res = await auth.login(credentials);

    if (res.two_factor_required) {
      setRequiresTwoFactor(true);
      setTwoFactorToken(res.token);
      return { requires2FA: true };
    }

    setUser(res.user);
    setRequiresTwoFactor(false);
    setTwoFactorToken(null);
    return { success: true, user: res.user };
  };

  const verify2FA = async (code) => {
    const res = await auth.verify2FA(twoFactorToken, code);
    setUser(res.user);
    setRequiresTwoFactor(false);
    setTwoFactorToken(null);
    return { success: true, user: res.user };
  };

  const register = async (data) => ({ success: true, user: await auth.register(data) });

  const handleLogout = async () => {
    await auth.logout();
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (data) => {
    const updated = await auth.updateMe(data);
    setUser(updated);
    toast.success("Profile updated successfully");
    return updated;
  };

  // 2FA helpers
  const setupTwoFactor = () => auth.setup2FA();
  const confirmTwoFactor = async (code) => {
    await auth.confirm2FA(code);
    setUser({ ...user, two_factor_enabled: true });
    toast.success("Two‑factor authentication enabled");
  };
  const disableTwoFactor = async (code) => {
    await auth.disable2FA(code);
    setUser({ ...user, two_factor_enabled: false });
    toast.success("Two‑factor authentication disabled");
  };

  // consent helper
  const updateConsent = async (type, consented) => {
    await auth.updateConsent(type, consented);
    setUser((u) => ({ ...u, [`${type.toLowerCase()}_consent`]: consented }));
    toast.success("Consent settings updated");
  };

  const value = {
    user,
    loading,
    requiresTwoFactor,
    isAuthenticated: !!user,
    login,
    verify2FA,
    register,
    logout: handleLogout,
    updateProfile,
    setup2FA: setupTwoFactor,
    confirm2FA: confirmTwoFactor,
    disable2FA,
    updateConsent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
