import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Award,
  Download,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  getCoursePerformance,
  getStudentPerformance,
  getLowAttendanceReport
} from '../api/client';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('low-attendance'); // 'low-attendance', 'course-perf', 'leaderboard', 'department'
  const [courseData, setCourseData] = useState([]);
  const [studentPerfData, setStudentPerfData] = useState({ topPerformers: [], supportNeeded: [], departmentDistribution: [] });
  const [lowAttendanceData, setLowAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    async function loadAllAnalytics() {
      try {
        setLoading(true);
        const [cRes, sRes, lRes] = await Promise.all([
          getCoursePerformance(),
          getStudentPerformance(),
          getLowAttendanceReport()
        ]);

        if (cRes.data.success) setCourseData(cRes.data.data);
        if (sRes.data.success) setStudentPerfData(sRes.data.data);
        if (lRes.data.success) setLowAttendanceData(lRes.data.data);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAllAnalytics();
  }, [showToast]);

  const handleExportLowAttendanceCSV = () => {
    if (lowAttendanceData.length === 0) {
      showToast('No low attendance records to export.', 'info');
      return;
    }

    const headers = ['Reg No', 'Student Name', 'Email', 'Department', 'Course Code', 'Course Name', 'Total Classes', 'Present', 'Absent', 'Attendance %', 'Status'];
    const rows = lowAttendanceData.map((item) => [
      item.registrationNumber,
      `"${item.studentName}"`,
      item.email,
      item.department,
      item.courseCode,
      `"${item.courseName}"`,
      item.totalClasses,
      item.presentCount,
      item.absentCount,
      `${item.attendancePercentage}%`,
      'CRITICAL: Below 75%'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edutrack_low_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Low Attendance CSV Report downloaded!', 'success');
  };

  const DEPT_COLORS = ['#4f46e5', '#0284c7', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MongoDB Aggregation Engine</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-1">
            Academic Analytics & Decision Reports
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Real-time pipeline results aggregating attendance percentages, identifying at-risk students,
            and benchmarking course-wise performance.
          </p>
        </div>

        {activeTab === 'low-attendance' && (
          <button
            onClick={handleExportLowAttendanceCSV}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Low Attendance List</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('low-attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'low-attendance'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Low Attendance Warning (&lt; 75%)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-200 text-rose-800 font-extrabold">
            {lowAttendanceData.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('course-perf')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'course-perf'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Course Benchmarks</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Academic Leaderboard & At-Risk</span>
        </button>

        <button
          onClick={() => setActiveTab('department')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'department'
              ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-sky-600" />
          <span>Department Distribution</span>
        </button>
      </div>

      {/* Tab 1: Low Attendance Alert Report */}
      {activeTab === 'low-attendance' && (
        <div className="space-y-4">
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-900">
            <span className="font-bold">Academic Notice:</span> The following students currently possess an attendance rate strictly below the mandatory <span className="font-black text-rose-700">75.0% threshold</span>.
            Students below this threshold are not eligible to sit for the final semester examinations without official condonation.
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Course</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4 text-center">Attended / Total</th>
                    <th className="py-3.5 px-4 text-center">Attendance %</th>
                    <th className="py-3.5 px-4 text-right">Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowAttendanceData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.studentName}</div>
                        <span className="font-mono text-[11px] text-slate-400">{item.registrationNumber} • {item.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] mr-1.5">
                          {item.courseCode}
                        </span>
                        <span className="font-medium text-slate-700">{item.courseName}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.department}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium">
                        <span className="font-bold text-slate-900">{item.presentCount} Present</span>
                        <span className="text-slate-400"> / {item.totalClasses} classes</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg font-black text-xs bg-rose-100 text-rose-700 border border-rose-200">
                          {item.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          Condonation Required
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Course Benchmarks */}
      {activeTab === 'course-perf' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courseData.map((c) => (
              <div key={c.courseId} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {c.courseCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{c.courseName}</h3>
                    <p className="text-[11px] text-slate-400">{c.department}</p>
                  </div>
                  <span className="text-xl font-black text-indigo-600">{c.avgPercentage}%</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <span className="block text-[10px] uppercase font-bold text-emerald-600">Highest Score</span>
                    <span className="font-extrabold text-sm">{c.highestPercentage}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-800">
                    <span className="block text-[10px] uppercase font-bold text-rose-600">Lowest Score</span>
                    <span className="font-extrabold text-sm">{c.lowestPercentage}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Evaluations: {c.totalAssessments} records</span>
                  <span>Faculty: {c.facultyName}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Course Comparison Chart (Avg vs Max vs Min)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="courseCode" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, name]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="avgPercentage" name="Average %" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="highestPercentage" name="Highest %" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lowestPercentage" name="Lowest %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Leaderboard & Academic Support */}
      {activeTab === 'leaderboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Performers */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              Top 5 Academic Performers (Overall)
            </h3>
            <div className="divide-y divide-slate-100">
              {studentPerfData.topPerformers.map((s, idx) => (
                <div key={s.studentId} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center ${
                      idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{s.name}</h4>
                      <p className="font-mono text-[11px] text-slate-400">{s.regNo} • {s.department}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                    {s.avgPercentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Students Needing Support */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Students Requiring Academic Support (&lt; 50%)
            </h3>
            {studentPerfData.supportNeeded.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No students currently below 50% average score.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {studentPerfData.supportNeeded.map((s) => (
                  <div key={s.studentId} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900">{s.name}</h4>
                      <p className="font-mono text-[11px] text-slate-400">{s.regNo} • {s.department}</p>
                    </div>
                    <span className="font-black text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {s.avgPercentage}% (At-Risk)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Department Distribution */}
      {activeTab === 'department' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Student Distribution by Department ($group stage)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentPerfData.departmentDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [`${val} students`, 'Enrollment Count']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Total Students" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
