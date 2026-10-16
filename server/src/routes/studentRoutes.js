import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .get(validateObjectId('id'), getStudentById)
  .put(validateObjectId('id'), updateStudent)
  .delete(validateObjectId('id'), deleteStudent);

export default router;
