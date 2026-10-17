import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle errors uniformly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.messages?.join(', ') ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Students API
export const getStudents = (params) => api.get('/students', { params });
export const getStudentById = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Courses API
export const getCourses = (params) => api.get('/courses', { params });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses', data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Attendance API
export const getAttendance = (params) => api.get('/attendance', { params });
export const recordAttendance = (data) => api.post('/attendance', data);
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const deleteAttendance = (id) => api.delete(`/attendance/${id}`);
export const getAttendanceAnalytics = (params) => api.get('/attendance/analytics', { params });

// Marks API
export const getMarks = (params) => api.get('/marks', { params });
export const createMark = (data) => api.post('/marks', data);
export const updateMark = (id, data) => api.put(`/marks/${id}`, data);
export const deleteMark = (id) => api.delete(`/marks/${id}`);

// Analytics API
export const getDashboardAnalytics = () => api.get('/analytics/dashboard');
export const getCoursePerformance = () => api.get('/analytics/course-performance');
export const getStudentPerformance = () => api.get('/analytics/student-performance');
export const getLowAttendanceReport = () => api.get('/analytics/low-attendance');

export default api;
