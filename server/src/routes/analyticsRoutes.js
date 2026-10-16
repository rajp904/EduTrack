import express from 'express';
import {
  getDashboardAnalytics,
  getCoursePerformance,
  getStudentPerformance,
  getLowAttendanceReport
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);
router.get('/course-performance', getCoursePerformance);
router.get('/student-performance', getStudentPerformance);
router.get('/low-attendance', getLowAttendanceReport);

export default router;
