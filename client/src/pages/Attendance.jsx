import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Plus,
  Filter,
  Search,
  Download,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  Layers,
  Info
} from 'lucide-react';
import {
  getAttendance,
  recordAttendance,
  updateAttendance,
  deleteAttendance,
  getCourses,
  getStudents
} from '../api/client';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: ''
  });

  const { showToast } = useToast();

  // Load auxiliary data: courses and students
  useEffect(() => {
    async function loadAux() {
      try {
        const [cRes, sRes] = await Promise.all([
          getCourses(),
          getStudents({ limit: 100 })
        ]);
        if (cRes.data.success) setCourses(cRes.data.data);
        if (sRes.data.success) setStudents(sRes.data.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadAux();
  }, []);

  const fetchAttendanceList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAttendance({
        courseId: courseFilter || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res.data.success) {
        setRecords(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [courseFilter, statusFilter, startDate, endDate, pagination.page, pagination.limit, showToast]);

  useEffect(() => {
    fetchAttendanceList();
  }, [fetchAttendanceList]);

  const handleOpenAdd = () => {
    setFormData({
      studentId: students[0]?._id || '',
      courseId: courses[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      remarks: 'Regular lecture'
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (rec) => {
    setSelectedRecord(rec);
    setFormData({
      studentId: rec.studentId?._id || '',
      courseId: rec.courseId?._id || '',
      date: rec.date ? new Date(rec.date).toISOString().split('T')[0] : '',
      status: rec.status,
      remarks: rec.remarks || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (rec) => {
    setSelectedRecord(rec);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await recordAttendance(formData);
      if (res.data.success) {
        showToast('Attendance recorded successfully!', 'success');
        setIsAddOpen(false);
        fetchAttendanceList();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await updateAttendance(selectedRecord._id, {
        status: formData.status,
        remarks: formData.remarks,
        date: formData.date
      });
      if (res.data.success) {
        showToast('Attendance updated successfully!', 'success');
        setIsEditOpen(false);
        fetchAttendanceList();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsSubmitting(true);
      const res = await deleteAttendance(selectedRecord._id);
      if (res.data.success) {
        showToast('Attendance record deleted.', 'success');
        setIsDeleteOpen(false);
        fetchAttendanceList();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (records.length === 0) {
      showToast('No records to export.', 'info');
      return;
    }

    const headers = ['Date', 'Registration Number', 'Student Name', 'Course Code', 'Course Name', 'Status', 'Remarks'];
    const rows = records.map((r) => [
      new Date(r.date).toLocaleDateString(),
      r.studentId?.registrationNumber || 'N/A',
      `"${r.studentId?.name || 'N/A'}"`,
      r.courseId?.courseCode || 'N/A',
      `"${r.courseId?.courseName || 'N/A'}"`,
      r.status,
      `"${r.remarks || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edutrack_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance CSV report downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Attendance Tracking & Analytics
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Log class sessions with compound unique indexing and consistent academic percentage formulas
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Attendance</span>
          </button>
        </div>
      </div>

      {/* Academic Policy Notice Box */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-900 shadow-sm">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">CSE494 Academic Policy Definition:</span> Attendance percentage is mathematically computed via MongoDB aggregation stages using:{' '}
          <code className="font-mono bg-white/80 px-2 py-0.5 rounded text-indigo-800 border border-indigo-200 text-[11px]">
            ((Present Sessions ÷ Total Sessions) × 100)
          </code>. Valid statuses are Present and Absent only. Attendance under 75% triggers an academic warning.
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Course Filter */}
        <div className="sm:col-span-4">
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          >
            <option value="">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="sm:col-span-2">
          <input
            type="date"
            placeholder="From Date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* End Date */}
        <div className="sm:col-span-2">
          <input
            type="date"
            placeholder="To Date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Reset Filters */}
        <div className="sm:col-span-1 flex items-center">
          <button
            onClick={() => {
              setCourseFilter('');
              setStatusFilter('All');
              setStartDate('');
              setEndDate('');
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
            title="Reset Filters"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 animate-pulse">
          Fetching attendance records from MongoDB...
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title="No Attendance Records Found"
          description="Try broadening your date range or clearing status filters."
          actionText="Clear Filters"
          onAction={() => {
            setCourseFilter('');
            setStatusFilter('All');
            setStartDate('');
            setEndDate('');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Session Date</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                      {new Date(rec.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {rec.studentId?.name || 'Deleted Student'}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {rec.studentId?.registrationNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {rec.courseId?.courseCode || 'N/A'}
                      </div>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {rec.courseId?.courseName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={rec.status === 'Present' ? 'success' : 'danger'}>
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {rec.remarks || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Attendance"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(rec)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalRecords={pagination.total}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* Record Attendance Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Student Attendance"
        subtitle="Compound Unique Index prevents duplicate attendance on same date"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Student</label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.registrationNumber}) - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Course</label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
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
              <label className="block font-bold text-slate-700 mb-1">Session Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
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
              placeholder="e.g. Approved medical leave, lab session, 15m delay"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60"
            >
              {isSubmitting ? 'Recording...' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Attendance Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update Attendance Record"
        subtitle={`Session for ${selectedRecord?.studentId?.name}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this specific attendance session entry?"
        confirmText="Delete Record"
        isDeleting={isSubmitting}
      />
    </div>
  );
}
