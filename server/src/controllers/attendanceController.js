import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance.js';

// GET /api/attendance
// View attendance with filter by student or course
export async function getAttendance(req, res, next) {
  try {
    const { studentId, courseId, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (studentId) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    }

    if (courseId) {
      query.courseId = new mongoose.Types.ObjectId(courseId);
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      Attendance.find(query)
        .populate('studentId', 'name registrationNumber email department semester')
        .populate('courseId', 'courseCode courseName facultyName')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Attendance.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: records,
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

// POST /api/attendance
// Record attendance for a student (Status: Present or Absent)
export async function recordAttendance(req, res, next) {
  try {
    const { studentId, courseId, date, status, remarks } = req.body;

    if (!studentId || !courseId || !status) {
      return res.status(400).json({
        success: false,
        error: 'studentId, courseId, and status are required fields.'
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be either 'Present' or 'Absent'."
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();

    const record = await Attendance.create({
      studentId,
      courseId,
      date: attendanceDate,
      status,
      remarks: remarks || ''
    });

    const populatedRecord = await Attendance.findById(record._id)
      .populate('studentId', 'name registrationNumber')
      .populate('courseId', 'courseCode courseName')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: populatedRecord
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/attendance/:id
export async function updateAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks, date } = req.body;

    if (status && !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be either 'Present' or 'Absent'."
      });
    }

    const record = await Attendance.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(remarks !== undefined && { remarks }),
        ...(date && { date: new Date(date) })
      },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name registrationNumber')
      .populate('courseId', 'courseCode courseName')
      .lean();

    if (!record) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: record
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/attendance/:id
export async function deleteAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const record = await Attendance.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Attendance record not found' });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/attendance/analytics
// Calculate overall attendance percentage & distribution
export async function getAttendanceAnalytics(req, res, next) {
  try {
    const metrics = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          absentCount: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalClasses: 1,
          presentCount: 1,
          absentCount: 1,
          attendanceRate: {
            $cond: [
              { $gt: ['$totalClasses', 0] },
              { $round: [{ $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] }, 1] },
              0
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: metrics[0] || { totalClasses: 0, presentCount: 0, absentCount: 0, attendanceRate: 0 }
    });
  } catch (err) {
    next(err);
  }
}
