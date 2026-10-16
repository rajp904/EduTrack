import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Award,
  Layers,
  GraduationCap,
  Users
} from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api/client';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Technology',
  'Data Science',
  'AI & Machine Learning',
  'Electronics & Comm'
];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: 'Computer Science',
    credits: 4,
    semester: 6,
    facultyName: ''
  });

  const { showToast } = useToast();

  const fetchCoursesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCourses({ search, department });
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, department, showToast]);

  useEffect(() => {
    fetchCoursesList();
  }, [fetchCoursesList]);

  const handleOpenAdd = () => {
    setFormData({
      courseCode: '',
      courseName: '',
      department: 'Computer Science',
      credits: 4,
      semester: 6,
      facultyName: ''
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c) => {
    setSelectedCourse(c);
    setFormData({
      courseCode: c.courseCode,
      courseName: c.courseName,
      department: c.department,
      credits: c.credits,
      semester: c.semester,
      facultyName: c.facultyName
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (c) => {
    setSelectedCourse(c);
    setIsDeleteOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await createCourse(formData);
      if (res.data.success) {
        showToast(`Course '${formData.courseCode}' created successfully!`, 'success');
        setIsAddOpen(false);
        fetchCoursesList();
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
      const res = await updateCourse(selectedCourse._id, formData);
      if (res.data.success) {
        showToast(`Course '${formData.courseCode}' updated successfully!`, 'success');
        setIsEditOpen(false);
        fetchCoursesList();
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
      const res = await deleteCourse(selectedCourse._id);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setIsDeleteOpen(false);
        fetchCoursesList();
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
            Curriculum & Courses
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage course codes, credit weightings, semester distributions, and faculty coordinators
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course code, title, or faculty in-charge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                Dept: {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-slate-200/60 rounded-2xl"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No Courses Found"
          description="No courses matched your search criteria. Try modifying your filters."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setDepartment('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm card-hover flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {course.courseCode}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(course)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(course)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
                  {course.courseName}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  {course.department}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Faculty Lead:</span>
                  <span className="font-bold text-slate-800">{course.facultyName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Academic Load:</span>
                  <span className="font-semibold text-slate-700">
                    {course.credits} Credits • Sem {course.semester}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Course Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Academic Course"
        subtitle="Registers course code with unique index in MongoDB 'courses' collection"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Course Code (Unique)</label>
            <input
              type="text"
              required
              placeholder="e.g. CSE494, DS301, AIML401"
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Intelligent NoSQL Databases"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
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
              <label className="block font-bold text-slate-700 mb-1">Credits (1-6)</label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Semester (1-8)</label>
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
            <div>
              <label className="block font-bold text-slate-700 mb-1">Faculty In-Charge</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.facultyName}
                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Course Details"
        subtitle={`Updating ${formData.courseCode}`}
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Course Code</label>
            <input
              type="text"
              required
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Course Title</label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
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
              <label className="block font-bold text-slate-700 mb-1">Credits (1-6)</label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Semester</label>
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
            <div>
              <label className="block font-bold text-slate-700 mb-1">Faculty In-Charge</label>
              <input
                type="text"
                required
                value={formData.facultyName}
                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
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
              {isSubmitting ? 'Updating...' : 'Update Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete Course: ${selectedCourse?.courseCode}`}
        message={`Are you sure you want to permanently delete '${selectedCourse?.courseName}'?`}
        cascadeNotice="Cascading delete will remove all attendance entries and student assessment marks tied to this course code to maintain referential integrity."
        confirmText="Confirm & Delete"
        isDeleting={isSubmitting}
      />
    </div>
  );
}
