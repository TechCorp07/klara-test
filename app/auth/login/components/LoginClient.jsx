"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import Image from "next/image";
import Link from "next/link";

/**
 * Client component for login page that handles authentication
 */
export default function LoginClient() {
  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth context and router
  const { login, verify2FA, requiresTwoFactor } = useAuth();
  const router = useRouter();

  /**
   * Handle form submission for both regular login and 2FA verification
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (requiresTwoFactor) {
        // Handle 2FA verification
        const result = await verify2FA(twoFactorCode);
        if (result.success) {
          toast.success("Login successful");

          // Check if there's a redirect URL in the query params
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get("from") || "/dashboard";
          router.push(redirectTo);
        }
      } else {
        // Handle regular login
        const result = await login({ username, password });

        if (result.requires2FA) {
          toast.info("Please enter your two-factor authentication code");
        } else if (result.success) {
          toast.success("Login successful");

          // Check if there's a redirect URL in the query params
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get("from") || "/dashboard";
          router.push(redirectTo);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="flex flex-col items-center">
          <Image
            src="/images/klararety-logo.png"
            alt="Klararety Logo"
            width={250}
            height={70}
            className="auth-form-logo"
            priority
          />
          <h2 className="auth-form-title">{requiresTwoFactor ? "Enter Two-Factor Code" : "Sign in to your account"}</h2>
          {!requiresTwoFactor && <p className="auth-form-subtitle">Knowledge • Learning • Advocacy</p>}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="space-y-4">
            {!requiresTwoFactor ? (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Email address"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Two-Factor Code
                </label>
                <input
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter 6-digit code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                />
              </div>
            )}
          </div>

          {!requiresTwoFactor && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot your password?
                </Link>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>{requiresTwoFactor ? "Verify Code" : "Sign in"}</>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}