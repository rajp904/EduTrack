import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Navbar setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
