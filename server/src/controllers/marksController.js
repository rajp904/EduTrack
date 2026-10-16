import mongoose from 'mongoose';
import { Mark } from '../models/Mark.js';

// GET /api/marks
export async function getMarks(req, res, next) {
  try {
    const { studentId, courseId, assessmentName, page = 1, limit = 20 } = req.query;
    const query = {};

    if (studentId) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    }

    if (courseId) {
      query.courseId = new mongoose.Types.ObjectId(courseId);
    }

    if (assessmentName && assessmentName !== 'All') {
      query.assessmentName = assessmentName;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [marks, total] = await Promise.all([
      Mark.find(query)
        .populate('studentId', 'name registrationNumber email department semester')
        .populate('courseId', 'courseCode courseName credits')
        .sort({ assessmentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Mark.countDocuments(query)
    ]);

    // Compute percentage for each record for convenience
    const enrichedMarks = marks.map(m => ({
      ...m,
      percentage: Math.round((m.marksObtained / m.maximumMarks) * 100 * 100) / 100
    }));

    res.json({
      success: true,
      data: enrichedMarks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/marks
export async function createMark(req, res, next) {
  try {
    const { studentId, courseId, assessmentName, marksObtained, maximumMarks, assessmentDate } = req.body;

    const obtained = Number(marksObtained);
    const maximum = Number(maximumMarks);

    if (obtained < 0) {
      return res.status(400).json({ success: false, error: 'Marks obtained cannot be negative.' });
    }

    if (obtained > maximum) {
      return res.status(400).json({
        success: false,
        error: `Marks obtained (${obtained}) cannot exceed maximum marks (${maximum}).`
      });
    }

    const record = await Mark.create({
      studentId,
      courseId,
      assessmentName,
      marksObtained: obtained,
      maximumMarks: maximum,
      assessmentDate: assessmentDate ? new Date(assessmentDate) : new Date()
    });

    const populatedRecord = await Mark.findById(record._id)
      .populate('studentId', 'name registrationNumber')
      .populate('courseId', 'courseCode courseName')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Assessment marks recorded successfully',
      data: populatedRecord
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/marks/:id
export async function updateMark(req, res, next) {
  try {
    const { id } = req.params;
    const { assessmentName, marksObtained, maximumMarks, assessmentDate } = req.body;

    const currentMark = await Mark.findById(id);
    if (!currentMark) {
      return res.status(404).json({ success: false, error: 'Mark record not found' });
    }

    const newObtained = marksObtained !== undefined ? Number(marksObtained) : currentMark.marksObtained;
    const newMax = maximumMarks !== undefined ? Number(maximumMarks) : currentMark.maximumMarks;

    if (newObtained < 0) {
      return res.status(400).json({ success: false, error: 'Marks obtained cannot be negative.' });
    }

    if (newObtained > newMax) {
      return res.status(400).json({
        success: false,
        error: `Marks obtained (${newObtained}) cannot exceed maximum marks (${newMax}).`
      });
    }

    const record = await Mark.findByIdAndUpdate(
      id,
      {
        ...(assessmentName && { assessmentName }),
        marksObtained: newObtained,
        maximumMarks: newMax,
        ...(assessmentDate && { assessmentDate: new Date(assessmentDate) })
      },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name registrationNumber')
      .populate('courseId', 'courseCode courseName')
      .lean();

    res.json({
      success: true,
      message: 'Assessment marks updated successfully',
      data: record
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/marks/:id
export async function deleteMark(req, res, next) {
  try {
    const { id } = req.params;
    const record = await Mark.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Mark record not found' });
    }

    res.json({
      success: true,
      message: 'Assessment marks record deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
