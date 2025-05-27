'use client';

import React from 'react';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Placeholder for sidebar state (collapsed/expanded)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  // Placeholder for breadcrumbs visibility
  const [showBreadcrumbs, setShowBreadcrumbs] = React.useState(false);

  return (
    <div className="flex h-screen bg-custom-background text-lg">
      {/* Collapsible Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="p-4">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="mb-4 text-custom-primary">
            {isSidebarCollapsed ? 'Expand' : 'Collapse'} {/* Placeholder toggle */}
          </button>
          {/* Placeholder for navigation items (Section 4) */}
          {!isSidebarCollapsed && (
            <ul>
              <li className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Link href="/dashboard" className="block w-full">
                  Dashboard
                </Link>
              </li>
              <li className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Link href="/templates" className="block w-full">
                  Templates
                </Link>
              </li>
              <li className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <Link href="/flows" className="block w-full">
                  Flows
                </Link>
              </li>
            </ul>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Breadcrumb Bar (initially hidden) */}
        {showBreadcrumbs && (
          <nav className="bg-gray-50 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-600">
            {/* Placeholder Breadcrumb items */}
            <span>Dashboard &gt; New Flow</span>
          </nav>
        )}

        {/* Content */}
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
} 