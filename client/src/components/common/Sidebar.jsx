import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  BarChart3,
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Students', path: '/students', icon: Users },
  { name: 'Courses', path: '/courses', icon: BookOpen },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Marks & Grades', path: '/marks', icon: GraduationCap },
  { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
  { name: 'Database & Architecture', path: '/project-info', icon: Database },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            EduTrack <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">v1.0</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Analytics & Performance</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Academic Management
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Academic Course Badge */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center gap-2 mb-1.5">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">CSE494 Project</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Intelligent NoSQL Databases with MongoDB & PyMongo Driver.
        </p>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between bg-slate-950/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[11px]">edutrack-db</span>
        </div>
        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">PyMongo Ready</span>
      </div>
    </aside>
  );
}
