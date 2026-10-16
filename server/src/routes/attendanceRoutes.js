import express from 'express';
import {
  getAttendance,
  recordAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceAnalytics
} from '../controllers/attendanceController.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.get('/analytics', getAttendanceAnalytics);

router.route('/')
  .get(getAttendance)
  .post(recordAttendance);

router.route('/:id')
  .put(validateObjectId('id'), updateAttendance)
  .delete(validateObjectId('id'), deleteAttendance);

export default router;
