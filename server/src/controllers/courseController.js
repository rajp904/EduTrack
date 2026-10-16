import mongoose from 'mongoose';
import { Course } from '../models/Course.js';
import { Attendance } from '../models/Attendance.js';
import { Mark } from '../models/Mark.js';

// GET /api/courses
export async function getCourses(req, res, next) {
  try {
    const { search, department, semester } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { courseCode: regex },
        { courseName: regex },
        { facultyName: regex }
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    const courses = await Course.find(query).sort({ courseCode: 1 }).lean();

    res.json({
      success: true,
      data: courses,
      total: courses.length
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/courses/:id
export async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    const courseObjectId = new mongoose.Types.ObjectId(id);

    // Fetch aggregate statistics for this course
    const [attendanceCount, marksStats] = await Promise.all([
      Attendance.countDocuments({ courseId: courseObjectId }),
      Mark.aggregate([
        { $match: { courseId: courseObjectId } },
        {
          $group: {
            _id: '$courseId',
            totalAssessments: { $sum: 1 },
            avgScore: { $avg: '$marksObtained' },
            avgPercentage: {
              $avg: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
            },
            highestScore: {
              $max: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
            },
            lowestScore: {
              $min: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
            }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        course,
        stats: {
          attendanceCount,
          marksStats: marksStats[0] || {
            totalAssessments: 0,
            avgPercentage: 0,
            highestScore: 0,
            lowestScore: 0
          }
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/courses
export async function createCourse(req, res, next) {
  try {
    const { courseCode, courseName, department, credits, semester, facultyName } = req.body;

    const course = await Course.create({
      courseCode: courseCode?.toUpperCase(),
      courseName,
      department,
      credits: Number(credits),
      semester: Number(semester),
      facultyName
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/courses/:id
export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const { courseCode, courseName, department, credits, semester, facultyName } = req.body;

    const course = await Course.findByIdAndUpdate(
      id,
      {
        ...(courseCode && { courseCode: courseCode.toUpperCase() }),
        courseName,
        department,
        credits: Number(credits),
        semester: Number(semester),
        facultyName
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/courses/:id (with cascade delete for attendance & marks)
export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }

    // Cascade delete associated attendance & marks
    const [deletedAttendance, deletedMarks] = await Promise.all([
      Attendance.deleteMany({ courseId: id }),
      Mark.deleteMany({ courseId: id }),
      Course.findByIdAndDelete(id)
    ]);

    res.json({
      success: true,
      message: `Course '${course.courseCode}' deleted successfully along with associated records.`,
      cascadeInfo: {
        deletedAttendanceCount: deletedAttendance.deletedCount,
        deletedMarksCount: deletedMarks.deletedCount
      }
    });
  } catch (err) {
    next(err);
  }
}
