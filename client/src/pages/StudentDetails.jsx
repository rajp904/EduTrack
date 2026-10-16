import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Calendar,
  GraduationCap,
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  BookOpen
} from 'lucide-react';
import { getStudentById, getCourses, recordAttendance, createMark } from '../api/client';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function StudentDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Action Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick attendance form
  const [attForm, setAttForm] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: ''
  });

  // Quick mark form
  const [markForm, setMarkForm] = useState({
    courseId: '',
    assessmentName: 'Quiz 1',
    marksObtained: '',
    maximumMarks: 25,
    assessmentDate: new Date().toISOString().split('T')[0]
  });

  const { showToast } = useToast();

  const fetchStudentProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [resStudent, resCourses] = await Promise.all([
        getStudentById(id),
        getCourses()
      ]);

      if (resStudent.data.success) {
        setData(resStudent.data.data);
      }
      if (resCourses.data.success) {
        setCourses(resCourses.data.data);
        if (resCourses.data.data.length > 0) {
          setAttForm((prev) => ({ ...prev, courseId: resCourses.data.data[0]._id }));
          setMarkForm((prev) => ({ ...prev, courseId: resCourses.data.data[0]._id }));
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await recordAttendance({
        studentId: id,
        courseId: attForm.courseId,
        date: attForm.date,
        status: attForm.status,
        remarks: attForm.remarks
      });
      if (res.data.success) {
        showToast('Attendance recorded successfully!', 'success');
        setIsAttendanceModalOpen(false);
        fetchStudentProfile();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMark = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await createMark({
        studentId: id,
        courseId: markForm.courseId,
        assessmentName: markForm.assessmentName,
        marksObtained: Number(markForm.marksObtained),
        maximumMarks: Number(markForm.maximumMarks),
        assessmentDate: markForm.assessmentDate
      });
      if (res.data.success) {
        showToast('Assessment marks recorded successfully!', 'success');
        setIsMarkModalOpen(false);
        fetchStudentProfile();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-slate-200 rounded-lg"></div>
        <div className="h-44 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const { student, analytics, recentAttendance, marksList } = data || {};
  const attendanceRate = analytics?.attendance?.attendancePercentage || 0;
  const avgMarks = analytics?.marks?.avgPercentage || 0;
  const isLowAttendance = attendanceRate < 75.0 && analytics?.attendance?.totalClasses > 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </Link>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 flex-shrink-0">
            {student?.name?.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {student?.name}
              </h1>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {student?.registrationNumber}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {student?.email}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-800">{student?.department}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                Semester {student?.semester}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => setIsMarkModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Marks</span>
          </button>
        </div>
      </div>

      {/* Academic Analytics Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Attendance Percentage Card */}
        <div className={`p-6 rounded-2xl border ${isLowAttendance ? 'bg-rose-50/50 border-rose-200 text-rose-900' : 'bg-white border-slate-200/80 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Rate</span>
            {isLowAttendance ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-extrabold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                CRITICAL (&lt;75%)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                GOOD STANDING
              </span>
            )}
          </div>
          <div className="text-3xl font-black tracking-tight mb-2">
            {attendanceRate}%
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {analytics?.attendance?.present} Present, {analytics?.attendance?.absent} Absent
          </p>
        </div>

        {/* Assessment Average Score */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Performance</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {avgMarks}%
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Based on {analytics?.marks?.totalAssessments || 0} evaluated assessments
          </p>
        </div>

        {/* Total Sessions Attended */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Lectures</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {analytics?.attendance?.totalClasses || 0}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Recorded in course schedules
          </p>
        </div>

        {/* Academic Standing */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Standing</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight mb-2">
            {avgMarks >= 85 ? 'Outstanding (Grade A+)' : avgMarks >= 70 ? 'Very Good (Grade A)' : avgMarks >= 50 ? 'Satisfactory (Grade B)' : 'Needs Support (Grade C/F)'}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Enrolled {new Date(student?.enrollmentDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Two Columns: Recent Attendance Records & Assessment Marks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Records */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Recent Attendance History
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                Last 10 sessions
              </span>
            </div>

            {recentAttendance && recentAttendance.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentAttendance.map((rec) => (
                  <div key={rec._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {rec.courseId?.courseCode || 'Unknown Course'}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {rec.courseId?.courseName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{new Date(rec.date).toLocaleDateString()}</span>
                        {rec.remarks && <span>• {rec.remarks}</span>}
                      </div>
                    </div>
                    <Badge variant={rec.status === 'Present' ? 'success' : 'danger'}>
                      {rec.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No attendance logged yet.</p>
            )}
          </div>
        </div>

        {/* Assessment Marks */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Assessment Performance Records
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {marksList?.length || 0} evaluated
              </span>
            </div>

            {marksList && marksList.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {marksList.map((m) => {
                  const pct = Math.round((m.marksObtained / m.maximumMarks) * 100);
                  let grade = 'F';
                  if (pct >= 90) grade = 'A+';
                  else if (pct >= 80) grade = 'A';
                  else if (pct >= 70) grade = 'B';
                  else if (pct >= 50) grade = 'C';

                  return (
                    <div key={m._id} className="py-3 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="font-bold text-slate-900 mr-2">
                            {m.assessmentName}
                          </span>
                          <span className="font-mono text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                            {m.courseId?.courseCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {m.marksObtained} / {m.maximumMarks}
                          </span>
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-700">
                            {grade}
                          </span>
                        </div>
                      </div>

                      {/* Percentage visual progress */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 flex">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No assessments recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Mark Attendance Modal */}
      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={`Record Attendance for ${student?.name}`}
        subtitle="Record student session attendance (Present or Absent)"
      >
        <form onSubmit={handleRecordAttendance} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Course</label>
            <select
              required
              value={attForm.courseId}
              onChange={(e) => setAttForm({ ...attForm, courseId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={attForm.date}
                onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={attForm.status}
                onChange={(e) => setAttForm({ ...attForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Traffic delay, regular lecture, medical note"
              value={attForm.remarks}
              onChange={(e) => setAttForm({ ...attForm, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Marks Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title={`Add Assessment Marks for ${student?.name}`}
        subtitle="Validates: 0 <= marksObtained <= maximumMarks"
      >
        <form onSubmit={handleAddMark} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Course</label>
            <select
              required
              value={markForm.courseId}
              onChange={(e) => setMarkForm({ ...markForm, courseId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assessment Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Quiz 2, Midterm Exam, Project Phase 2"
              value={markForm.assessmentName}
              onChange={(e) => setMarkForm({ ...markForm, assessmentName: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Marks Obtained</label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                placeholder="e.g. 23.5"
                value={markForm.marksObtained}
                onChange={(e) => setMarkForm({ ...markForm, marksObtained: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="e.g. 25"
                value={markForm.maximumMarks}
                onChange={(e) => setMarkForm({ ...markForm, maximumMarks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assessment Date</label>
            <input
              type="date"
              required
              value={markForm.assessmentDate}
              onChange={(e) => setMarkForm({ ...markForm, assessmentDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMarkModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
