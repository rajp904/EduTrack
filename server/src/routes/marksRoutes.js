import express from 'express';
import {
  getMarks,
  createMark,
  updateMark,
  deleteMark
} from '../controllers/marksController.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = express.Router();

router.route('/')
  .get(getMarks)
  .post(createMark);

router.route('/:id')
  .put(validateObjectId('id'), updateMark)
  .delete(validateObjectId('id'), deleteMark);

export default router;
