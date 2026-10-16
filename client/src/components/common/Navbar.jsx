import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Database, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

const PAGE_TITLES = {
  '/': { title: 'Academic Analytics Dashboard', subtitle: 'Real-time metrics, attendance trends, and performance insights' },
  '/students': { title: 'Student Management', subtitle: 'View, register, filter, and manage academic student profiles' },
  '/courses': { title: 'Course Management', subtitle: 'Curriculum courses, credits, faculty in-charge, and enrollment' },
  '/attendance': { title: 'Attendance Analytics & Tracker', subtitle: 'Record student attendance with academic late weighting (0.5 rule)' },
  '/marks': { title: 'Marks & Academic Assessments', subtitle: 'Course grades, continuous evaluation, and performance monitoring' },
  '/analytics': { title: 'Advanced MongoDB Reports', subtitle: 'Multi-stage aggregation analytics pipelines and threshold alerts' },
  '/project-info': { title: 'Database Architecture & Schema', subtitle: 'MongoDB $jsonSchema validation, compound indexes, and PyMongo scripts' }
};

export default function Navbar({ setIsSidebarOpen }) {
  const location = useLocation();
  const currentPath = location.pathname.startsWith('/students/') ? '/students' : location.pathname;
  const pageInfo = PAGE_TITLES[currentPath] || { title: 'EduTrack', subtitle: 'NoSQL Analytics System' };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {pageInfo.title}
          </h2>
          <p className="hidden sm:block text-xs text-slate-500 font-medium">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* MongoDB Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-sm">
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>MongoDB Local: 27017</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        </div>

        {/* Python PyMongo Integration Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
          <Terminal className="w-3.5 h-3.5 text-slate-600" />
          <span>PyMongo 4.19</span>
        </div>

        {/* Validation Engine Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>$jsonSchema Active</span>
        </div>
      </div>
    </header>
  );
}
