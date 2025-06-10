'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, User, MessageSquare, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/agent', label: 'Agent', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`hidden md:flex flex-col fixed inset-y-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Sidebar Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800 border-r border-gray-700">
        {/* Collapse Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 z-10 h-6 w-6 bg-gray-700 hover:bg-gray-600 rounded-full border border-gray-600 flex items-center justify-center transition-all hover:scale-110"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-300" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-300" />
          )}
        </button>

        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo/Brand */}
          <div className="flex items-center px-4 mb-8">
            {!collapsed && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Auri
              </h1>
            )}
            {collapsed && (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mx-auto">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="mt-2 flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg mx-2 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-purple-400' : 'text-gray-400'}`} />
                  {!collapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer/Sign Out */}
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          
          <Button 
            onClick={logout} 
            variant="ghost" 
            className={`w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700/50 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Sign out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}