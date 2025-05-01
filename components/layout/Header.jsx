"use client";

import { useAuth } from "@/contexts/AuthContext";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <Image 
                  src="/images/klararety-logo.png" 
                  alt="Klararety Logo" 
                  width={150} 
                  height={40} 
                  className="h-10 w-auto"
                  priority
                />
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/medical-records" className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Medical Records
              </Link>
              <Link href="/appointments" className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Appointments
              </Link>
              <Link href="/messages" className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Messages
              </Link>
              <Link href="/community" className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Community
              </Link>
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Notification Bell */}
            {user && (
              <div className="ml-3 relative">
                <NotificationCenter />
              </div>
            )}
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    {user && user.first_name && user.last_name ? (
                      <span className="text-primary-700">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </span>
                    ) : (
                      <svg className="h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
              
              {/* Dropdown menu */}
              <div
                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabIndex="-1"
              >
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                  Your Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/dashboard" className="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Dashboard
          </Link>
          <Link href="/medical-records" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Medical Records
          </Link>
          <Link href="/appointments" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Appointments
          </Link>
          <Link href="/messages" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Messages
          </Link>
          <Link href="/community" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-primary-300 hover:text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Community
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                {user && user.first_name && user.last_name ? (
                  <span className="text-primary-700">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </span>
                ) : (
                  <svg className="h-6 w-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{user ? `${user.first_name} ${user.last_name}` : 'User'}</div>
              <div className="text-sm font-medium text-gray-500">{user ? user.email : ''}</div>
            </div>
            <div className="ml-auto flex items-center">
              {/* Mobile notification icon */}
              {user && (
                <div className="mr-3">
                  <NotificationCenter />
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <Link href="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-primary-700 hover:bg-gray-100">
              Your Profile
            </Link>
            <Link href="/settings" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-primary-700 hover:bg-gray-100">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-primary-700 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
