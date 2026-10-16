import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  getMarks,
  createMark,
  updateMark,
  deleteMark,
  getCourses,
  getStudents
} from '../api/client';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

const ASSESSMENTS = [
  'All',
  'Quiz 1',
  'Assignment 1',
  'Midterm Exam',
  'Project Phase 1',
  'Final Exam'
];

export default function Marks() {
  const [marks, setMarks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState('');
  const [assessmentFilter, setAssessmentFilter] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMark, setSelectedMark] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    assessmentName: 'Quiz 1',
    marksObtained: '',
    maximumMarks: 25,
    assessmentDate: new Date().toISOString().split('T')[0]
  });

  const { showToast } = useToast();

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

  const fetchMarksList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMarks({
        courseId: courseFilter || undefined,
        assessmentName: assessmentFilter !== 'All' ? assessmentFilter : undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res.data.success) {
        setMarks(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [courseFilter, assessmentFilter, pagination.page, pagination.limit, showToast]);

  useEffect(() => {
    fetchMarksList();
  }, [fetchMarksList]);

  const handleOpenAdd = () => {
    setFormData({
      studentId: students[0]?._id || '',
      courseId: courses[0]?._id || '',
      assessmentName: 'Quiz 1',
      marksObtained: '',
      maximumMarks: 25,
      assessmentDate: new Date().toISOString().split('T')[0]
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (m) => {
    setSelectedMark(m);
    setFormData({
      studentId: m.studentId?._id || '',
      courseId: m.courseId?._id || '',
      assessmentName: m.assessmentName,
      marksObtained: m.marksObtained,
      maximumMarks: m.maximumMarks,
      assessmentDate: m.assessmentDate ? new Date(m.assessmentDate).toISOString().split('T')[0] : ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (m) => {
    setSelectedMark(m);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const obtained = Number(formData.marksObtained);
    const maximum = Number(formData.maximumMarks);

    if (obtained > maximum) {
      showToast(`Marks obtained (${obtained}) cannot exceed maximum marks (${maximum})!`, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createMark({
        studentId: formData.studentId,
        courseId: formData.courseId,
        assessmentName: formData.assessmentName,
        marksObtained: obtained,
        maximumMarks: maximum,
        assessmentDate: formData.assessmentDate
      });
      if (res.data.success) {
        showToast('Assessment marks created successfully!', 'success');
        setIsAddOpen(false);
        fetchMarksList();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    const obtained = Number(formData.marksObtained);
    const maximum = Number(formData.maximumMarks);

    if (obtained > maximum) {
      showToast(`Marks obtained (${obtained}) cannot exceed maximum marks (${maximum})!`, 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateMark(selectedMark._id, {
        assessmentName: formData.assessmentName,
        marksObtained: obtained,
        maximumMarks: maximum,
        assessmentDate: formData.assessmentDate
      });
      if (res.data.success) {
        showToast('Marks updated successfully!', 'success');
        setIsEditOpen(false);
        fetchMarksList();
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
      const res = await deleteMark(selectedMark._id);
      if (res.data.success) {
        showToast('Assessment marks record deleted.', 'success');
        setIsDeleteOpen(false);
        fetchMarksList();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (marks.length === 0) {
      showToast('No records to export.', 'info');
      return;
    }

    const headers = ['Assessment Date', 'Registration Number', 'Student Name', 'Course Code', 'Assessment', 'Marks Obtained', 'Maximum Marks', 'Percentage %', 'Grade'];
    const rows = marks.map((m) => {
      const pct = Math.round((m.marksObtained / m.maximumMarks) * 100);
      let grade = 'F';
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B';
      else if (pct >= 50) grade = 'C';

      return [
        new Date(m.assessmentDate).toLocaleDateString(),
        m.studentId?.registrationNumber || 'N/A',
        `"${m.studentId?.name || 'N/A'}"`,
        m.courseId?.courseCode || 'N/A',
        `"${m.assessmentName}"`,
        m.marksObtained,
        m.maximumMarks,
        `${pct}%`,
        grade
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `edutrack_marks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Marks CSV report exported successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Marks & Performance Evaluation
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Log continuous evaluations, validate bounds (0 ≤ Marks ≤ Max), and calculate academic rankings
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
            <span>Add Assessment Marks</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="sm:col-span-6">
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

        <div className="sm:col-span-5">
          <select
            value={assessmentFilter}
            onChange={(e) => {
              setAssessmentFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          >
            {ASSESSMENTS.map((asm) => (
              <option key={asm} value={asm}>
                Assessment: {asm}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1">
          <button
            onClick={() => {
              setCourseFilter('');
              setAssessmentFilter('All');
            }}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Marks Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 animate-pulse">
          Loading marks records...
        </div>
      ) : marks.length === 0 ? (
        <EmptyState
          title="No Marks Records Found"
          description="Try selecting a different course or assessment category."
          actionText="Clear Filters"
          onAction={() => {
            setCourseFilter('');
            setAssessmentFilter('All');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Assessment</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Performance Bar</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marks.map((m) => {
                  const pct = Math.round((m.marksObtained / m.maximumMarks) * 100);
                  let grade = 'F';
                  let gradeBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                  if (pct >= 90) { grade = 'A+'; gradeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200'; }
                  else if (pct >= 80) { grade = 'A'; gradeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200'; }
                  else if (pct >= 70) { grade = 'B'; gradeBadge = 'bg-sky-50 text-sky-700 border-sky-200'; }
                  else if (pct >= 50) { grade = 'C'; gradeBadge = 'bg-amber-50 text-amber-700 border-amber-200'; }

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {m.studentId?.name || 'Deleted Student'}
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {m.studentId?.registrationNumber || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                          {m.courseId?.courseCode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {m.assessmentName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {m.marksObtained}
                        </span>
                        <span className="text-slate-400 font-medium ml-1">
                          / {m.maximumMarks}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-extrabold text-[11px] px-2 py-0.5 rounded-md border ${gradeBadge}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Edit Marks"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Add Marks Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Assessment Marks"
        subtitle="Enforces database constraint: marksObtained ≤ maximumMarks and ≥ 0"
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assessment Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Quiz 1, Midterm Exam, Project Phase 1"
              value={formData.assessmentName}
              onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
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
                placeholder="e.g. 21.5"
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
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
                value={formData.maximumMarks}
                onChange={(e) => setFormData({ ...formData, maximumMarks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assessment Date</label>
            <input
              type="date"
              required
              value={formData.assessmentDate}
              onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
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
              {isSubmitting ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Marks Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Update Assessment Marks"
        subtitle={`Updating ${selectedMark?.assessmentName}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assessment Name</label>
            <input
              type="text"
              required
              value={formData.assessmentName}
              onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
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
                value={formData.marksObtained}
                onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
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
                value={formData.maximumMarks}
                onChange={(e) => setFormData({ ...formData, maximumMarks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assessment Date</label>
            <input
              type="date"
              required
              value={formData.assessmentDate}
              onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
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
              {isSubmitting ? 'Updating...' : 'Update Marks'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Assessment Marks"
        message="Are you sure you want to permanently delete this assessment record?"
        confirmText="Delete Marks"
        isDeleting={isSubmitting}
      />
    </div>
  );
}
