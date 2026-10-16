import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Attendance } from '../models/Attendance.js';
import { Mark } from '../models/Mark.js';

// GET /api/students
export async function getStudents(req, res, next) {
  try {
    const { search, department, semester, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { registrationNumber: regex },
        { email: regex }
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
      Student.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Student.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: students,
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

// GET /api/students/:id
export async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).lean();

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const studentObjectId = new mongoose.Types.ObjectId(id);

    // Run parallel aggregation for this student's attendance & marks summary
    const [attendanceStats, marksStats, recentAttendance, marksList] = await Promise.all([
      // Overall attendance stats
      Attendance.aggregate([
        { $match: { studentId: studentObjectId } },
        {
          $group: {
            _id: '$studentId',
            totalClasses: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } }
          }
        },
        {
          $project: {
            totalClasses: 1,
            present: 1,
            absent: 1,
            attendancePercentage: {
              $cond: [
                { $gt: ['$totalClasses', 0] },
                { $round: [{ $multiply: [{ $divide: ['$present', '$totalClasses'] }, 100] }, 1] },
                0
              ]
            }
          }
        }
      ]),

      // Overall marks stats
      Mark.aggregate([
        { $match: { studentId: studentObjectId } },
        {
          $group: {
            _id: '$studentId',
            totalAssessments: { $sum: 1 },
            avgPercentage: {
              $avg: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
            }
          }
        },
        {
          $project: {
            totalAssessments: 1,
            avgPercentage: { $round: ['$avgPercentage', 2] }
          }
        }
      ]),

      // Recent 10 attendance records with course info
      Attendance.find({ studentId: id })
        .populate('courseId', 'courseCode courseName')
        .sort({ date: -1 })
        .limit(10)
        .lean(),

      // All marks with course info
      Mark.find({ studentId: id })
        .populate('courseId', 'courseCode courseName credits')
        .sort({ assessmentDate: -1 })
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        student,
        analytics: {
          attendance: attendanceStats[0] || {
            totalClasses: 0,
            present: 0,
            absent: 0,
            attendancePercentage: 0
          },
          marks: marksStats[0] || {
            totalAssessments: 0,
            avgPercentage: 0
          }
        },
        recentAttendance,
        marksList
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/students
export async function createStudent(req, res, next) {
  try {
    const { registrationNumber, name, email, department, semester, enrollmentDate } = req.body;

    const student = await Student.create({
      registrationNumber,
      name,
      email,
      department,
      semester: Number(semester),
      enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/students/:id
export async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { registrationNumber, name, email, department, semester, enrollmentDate } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      {
        registrationNumber,
        name,
        email,
        department,
        semester: Number(semester),
        ...(enrollmentDate && { enrollmentDate: new Date(enrollmentDate) })
      },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/students/:id (with cascade delete for attendance & marks)
export async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Cascade delete associated attendance and marks to prevent orphaned records
    const [deletedAttendance, deletedMarks] = await Promise.all([
      Attendance.deleteMany({ studentId: id }),
      Mark.deleteMany({ studentId: id }),
      Student.findByIdAndDelete(id)
    ]);

    res.json({
      success: true,
      message: `Student '${student.name}' and all associated records deleted successfully.`,
      cascadeInfo: {
        deletedAttendanceCount: deletedAttendance.deletedCount,
        deletedMarksCount: deletedMarks.deletedCount
      }
    });
  } catch (err) {
    next(err);
  }
}
