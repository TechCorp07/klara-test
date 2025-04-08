// Header.js
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { FaBell, FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// Dynamically import the NotificationsDropdown component
const NotificationsDropdown = dynamic(() => import('@/components/layout/NotificationsDropdown'), {
  ssr: false,
  loading: () => <div className="p-4">Loading notifications...</div>,
});

export default function Header({ user }) {
  const { logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard">
                <span className="text-xl font-bold text-blue-600">Klararety Health</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="relative">
              <button
                className="p-1 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">View notifications</span>
                <FaBell className="h-6 w-6" />
              </button>
              {showNotifications && (
                <NotificationsDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>
            
            <div className="ml-3 relative" ref={userMenuRef}>
              <div>
                <button
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="sr-only">Open user menu</span>
                  {user.profile_image ? (
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={user.profile_image}
                      alt={`${user.first_name} ${user.last_name}`}
                      width={32}
                      height={32}
                    />
                  ) : (
                    <FaUserCircle className="h-8 w-8 text-gray-400" />
                  )}
                </button>
              </div>
              
              {showUserMenu && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{user.role_display || user.role}</p>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUserCircle className="mr-3 h-4 w-4 text-gray-500" />
                    Your Profile
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaCog className="mr-3 h-4 w-4 text-gray-500" />
                    Settings
                  </Link>
                  
                  <button
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={logout}
                  >
                    <FaSignOutAlt className="mr-3 h-4 w-4 text-gray-500" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
