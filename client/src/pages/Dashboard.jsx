import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { getDashboardAnalytics } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getDashboardAnalytics();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200/60 rounded-2xl"></div>
          <div className="h-80 bg-slate-200/60 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { metrics, attendanceStatus, coursePerformance, monthlyTrend, recentStudents } = data || {};

  // Status pie chart data
  const statusPieData = [
    { name: 'Present', value: attendanceStatus?.Present || 0, color: '#10b981' },
    { name: 'Absent', value: attendanceStatus?.Absent || 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Academic Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CSE494 – Intelligent NoSQL Databases</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Academic Performance & Attendance Hub
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Live dashboard powered by MongoDB aggregation pipelines and Python PyMongo integration.
            Evaluates continuous assessments, student attendance weighting, and alerts.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none hidden md:block"></div>
      </div>

      {/* Primary Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={metrics?.totalStudents || 0}
          icon={Users}
          color="indigo"
          subtext="Active in academic database"
        />
        <StatCard
          title="Courses Offered"
          value={metrics?.totalCourses || 0}
          icon={BookOpen}
          color="sky"
          subtext="Across 5 engineering departments"
        />
        <StatCard
          title="Average Score"
          value={`${metrics?.avgMarksPercentage || 0}%`}
          icon={Award}
          color="emerald"
          subtext="Aggregated across all assessments"
        />
        <StatCard
          title="Low Attendance Alert"
          value={metrics?.lowAttendanceCount || 0}
          icon={AlertTriangle}
          color="rose"
          badge={{ text: '< 75% Threshold', type: 'danger' }}
          subtext="Requires academic counseling"
        />
      </div>

      {/* Charts Section: Course Performance & Attendance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course-Wise Average Performance Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Course Performance Benchmarks
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Average marks obtained as percentage computed via MongoDB aggregation ($avg)
              </p>
            </div>
            <Link
              to="/marks"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>View Marks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformance || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="courseCode" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Average Score']}
                  labelFormatter={(code) => `Course: ${code}`}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="avgPercentage" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Attendance Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              Attendance Status Ratio
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Attendance status distribution (Present & Absent only)
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} sessions`, name]}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
              <span className="block text-xs font-semibold">Present</span>
              <span className="text-lg font-extrabold">{attendanceStatus?.Present || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800">
              <span className="block text-xs font-semibold">Absent</span>
              <span className="text-lg font-extrabold">{attendanceStatus?.Absent || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Trend & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                Monthly Attendance Velocity
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Overall institutional attendance percentage trend by month ($dateToString)
              </p>
            </div>
            <Link
              to="/attendance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>Manage Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Attendance Rate']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="attendanceRate" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#attendanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recently Registered Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Students
              </h3>
              <Link
                to="/students"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentStudents && recentStudents.length > 0 ? (
                recentStudents.map((s) => (
                  <Link
                    key={s._id}
                    to={`/students/${s._id}`}
                    className="py-3 flex items-center justify-between group hover:bg-slate-50 -mx-3 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {s.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {s.registrationNumber}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Sem {s.semester}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No students registered yet.</p>
              )}
            </div>
          </div>

          <Link
            to="/analytics"
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs text-center border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Advanced Reports & Thresholds</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
