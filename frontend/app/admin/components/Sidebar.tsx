"use client";

import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  BookOpen,
  Calendar, // For Meetings icon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

interface SidebarItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  subItems?: { name: string; href: string }[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    name: 'Partnerships',
    icon: <Users className="h-4 w-4" />,
    subItems: [
      { name: 'Pending', href: '/admin/partnerships' },
      { name: 'Accepted', href: '/admin/partnerships/accepted' }
    ]
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  {
    name: 'Blog Posts',
    href: '/admin/blogs',
    icon: <BookOpen className="h-4 w-4" />
  },
  // Meetings item
  {
    name: 'Meetings',
    href: '/admin/meeting',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    name: 'Career',
    icon: <FileText className="h-4 w-4" />,
    subItems: [
      { name: 'Manage', href: '/admin/career' },
      { name: 'View Applications', href: '/admin/career/applications' },
    ]
  },
  {
    name: 'Admin Users',
    href: '/admin/users',
    icon: <Settings className="h-4 w-4" />
  },
];

export default function Sidebar({ isSidebarOpen, isMobile, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    auth.logout();
    router.replace('/admin/login');
  };

  const handleNavigation = (href: string, e?: React.MouseEvent) => {
    // e?.stopPropagation(); // Uncomment if clicks are being intercepted by parent elements
    console.log(`Navigating to: ${href}`); // Debug log
    try {
      router.push(href);
      if (isMobile) {
        onClose();
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40
          h-full w-80 sm:w-72 lg:w-64 bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          transform
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'top-14' : 'top-0'}
          lg:translate-x-0
          shadow-xl lg:shadow-none
          flex flex-col
        `}
      >
        {/* Logo - Hidden on Mobile since it's in the header */}
        <div className="h-16 hidden lg:flex items-center px-6 border-b border-gray-200 bg-white">
          <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 bg-white">
          <div className="space-y-1">
            {sidebarItems.map((item, index) => (
              item.subItems ? (
                <div key={`${item.name}-${index}`}>
                  <div className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700">
                    <span className="flex items-center justify-center w-5 text-gray-500">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="ml-8 space-y-1">
                    {item.subItems.map((sub, subIndex) => (
                      <button
                        key={`${sub.href}-${subIndex}`}
                        onClick={(e) => handleNavigation(sub.href, e)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 touch-manipulation ${pathname === sub.href ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        aria-label={`Navigate to ${sub.name}`}
                      >
                        <span>{sub.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : item.href ? (
                <button
                  key={`${item.href}-${index}`}
                  onClick={(e) => handleNavigation(item.href, e)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 touch-manipulation ${pathname === item.href ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-500 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}
                  aria-label={`Navigate to ${item.name}`}
                >
                  <span className={`flex items-center justify-center w-5 ${pathname === item.href ? 'text-blue-600' : 'text-gray-500'}`}>{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ) : null // Skip if no href and no subItems
            ))}
          </div>
        </nav>

        {/* User Info Section (Mobile) */}
        {isMobile && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@example.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <Button
            variant="ghost"
            className={`
              w-full justify-start gap-3 px-4 py-3 text-red-600 
              hover:text-red-700 hover:bg-red-50 rounded-lg
              touch-manipulation
              ${isMobile ? 'text-base' : 'text-sm'}
            `}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
