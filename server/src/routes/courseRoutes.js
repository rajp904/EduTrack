import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(createCourse);

router.route('/:id')
  .get(validateObjectId('id'), getCourseById)
  .put(validateObjectId('id'), updateCourse)
  .delete(validateObjectId('id'), deleteCourse);

export default router;
