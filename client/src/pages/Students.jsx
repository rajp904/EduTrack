import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Mail,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api/client';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Data Science',
  'AI & Machine Learning',
  'Electronics & Comm'
];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    registrationNumber: '',
    name: '',
    email: '',
    department: 'Computer Science',
    semester: 6,
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

  const { showToast } = useToast();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStudents({
        search,
        department,
        semester,
        page: pagination.page,
        limit: pagination.limit
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, department, semester, pagination.page, pagination.limit, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenAdd = () => {
    setFormData({
      registrationNumber: `REG${Math.floor(100000 + Math.random() * 900000)}`,
      name: '',
      email: '',
      department: 'Computer Science',
      semester: 6,
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      registrationNumber: student.registrationNumber,
      name: student.name,
      email: student.email,
      department: student.department,
      semester: student.semester,
      enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await createStudent(formData);
      if (res.data.success) {
        showToast(`Student '${formData.name}' created successfully!`, 'success');
        setIsAddModalOpen(false);
        fetchStudents();
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
      const res = await updateStudent(selectedStudent._id, formData);
      if (res.data.success) {
        showToast('Student updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchStudents();
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
      const res = await deleteStudent(selectedStudent._id);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setIsDeleteModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Students Directory
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage student enrollments, unique registration records, and academic profiles
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, registration number, or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Department Filter */}
        <div className="sm:col-span-4">
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                Dept: {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div className="sm:col-span-2">
          <select
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="All">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500 animate-pulse">
          Loading students from MongoDB...
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description="We couldn't find any student records matching your current filter criteria."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setDepartment('All');
            setSemester('All');
          }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Reg Number</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Semester</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <Link
                            to={`/students/${student._id}`}
                            className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block"
                          >
                            {student.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {student.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {student.registrationNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">
                        {student.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        Sem {student.semester}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(student.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/students/${student._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Profile & Analytics"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
        subtitle="Insert a new student document into MongoDB 'students' collection"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Registration Number (Unique)</label>
            <input
              type="text"
              required
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. REG2024099"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Priyanshu Singh"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address (Unique)</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              placeholder="e.g. priyanshu@edutrack.edu"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {DEPARTMENTS.filter(d => d !== 'All').map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester (1-8)</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Enrollment Date</label>
            <input
              type="date"
              required
              value={formData.enrollmentDate}
              onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student Profile"
        subtitle={`Updating record for ${formData.registrationNumber}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Registration Number</label>
            <input
              type="text"
              required
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {DEPARTMENTS.filter(d => d !== 'All').map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Semester (1-8)</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Enrollment Date</label>
            <input
              type="date"
              required
              value={formData.enrollmentDate}
              onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cascade Confirmation Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete Student: ${selectedStudent?.name}`}
        message={`Are you sure you want to permanently delete registration ${selectedStudent?.registrationNumber}?`}
        cascadeNotice="To avoid orphaned documents in MongoDB, all associated attendance records and examination marks for this student will also be deleted simultaneously (MongoDB Cascade Clean)."
        confirmText="Confirm & Delete"
        isDeleting={isSubmitting}
      />
    </div>
  );
}
