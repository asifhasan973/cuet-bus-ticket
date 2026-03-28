import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { HiMenuAlt2 } from 'react-icons/hi';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden p-4 border-b border-dark-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-dark-600 hover:bg-dark-100 transition-colors"
          >
            <HiMenuAlt2 className="text-xl" />
          </button>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
