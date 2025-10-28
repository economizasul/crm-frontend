import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const Dashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebarExpansion = () => setIsSidebarExpanded(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

  const sidebarWidth = isSidebarExpanded ? 'md:w-64' : 'md:w-20';
  const mainMargin   = isSidebarExpanded ? 'md:ml-64' : 'md:ml-20';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:block ${sidebarWidth} transition-all duration-300`}>
        <Sidebar
          isExpanded={isSidebarExpanded}
          toggleExpansion={toggleSidebarExpansion}
          toggleMobileSidebar={toggleMobileSidebar}
        />
      </aside>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <Sidebar
            isExpanded={true}
            toggleExpansion={() => {}}
            toggleMobileSidebar={toggleMobileSidebar}
          />
        </div>
      )}

      {/* Overlay mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${mainMargin}`}>
        {/* Botão hamburguer mobile */}
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-full shadow-lg md:hidden hover:bg-indigo-700"
        >
          {isMobileSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;