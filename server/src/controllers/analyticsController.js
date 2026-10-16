import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Course } from '../models/Course.js';
import { Attendance } from '../models/Attendance.js';
import { Mark } from '../models/Mark.js';

// GET /api/analytics/dashboard
export async function getDashboardAnalytics(req, res, next) {
  try {
    const [
      totalStudents,
      totalCourses,
      totalAttendance,
      avgMarksData,
      statusDistribution,
      coursePerformance,
      monthlyTrend,
      lowAttendanceSummary,
      recentStudents
    ] = await Promise.all([
      Student.countDocuments(),
      Course.countDocuments(),
      Attendance.countDocuments(),

      // Aggregation: Overall Average Marks Percentage
      Mark.aggregate([
        {
          $group: {
            _id: null,
            overallAverage: {
              $avg: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
            }
          }
        }
      ]),

      // Aggregation: Attendance Status Distribution (Present, Absent)
      Attendance.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Aggregation: Course-Wise Average Performance
      Mark.aggregate([
        {
          $group: {
            _id: '$courseId',
            avgPercentage: {
              $avg: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
            },
            totalAssessments: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: '_id',
            foreignField: '_id',
            as: 'course'
          }
        },
        { $unwind: '$course' },
        {
          $project: {
            courseCode: '$course.courseCode',
            courseName: '$course.courseName',
            avgPercentage: { $round: ['$avgPercentage', 1] },
            totalAssessments: 1
          }
        },
        { $sort: { avgPercentage: -1 } }
      ]),

      // Aggregation: Monthly Attendance Trend
      Attendance.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
            totalRecords: { $sum: 1 },
            present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
            absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: '$_id',
            totalRecords: 1,
            present: 1,
            absent: 1,
            attendanceRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$present', '$totalRecords'] },
                    100
                  ]
                },
                1
              ]
            }
          }
        }
      ]),

      // Aggregation: Low Attendance Count (< 75%)
      Attendance.aggregate([
        {
          $group: {
            _id: { studentId: '$studentId', courseId: '$courseId' },
            totalClasses: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            attendancePercentage: {
              $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100]
            }
          }
        },
        { $match: { attendancePercentage: { $lt: 75.0 } } },
        { $count: 'lowAttendanceInstances' }
      ]),

      // Recent 5 registered students
      Student.find().sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const formattedStatus = { Present: 0, Absent: 0 };
    statusDistribution.forEach(item => {
      formattedStatus[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        metrics: {
          totalStudents,
          totalCourses,
          totalAttendance,
          avgMarksPercentage: avgMarksData[0] ? Math.round(avgMarksData[0].overallAverage * 10) / 10 : 0,
          lowAttendanceCount: lowAttendanceSummary[0]?.lowAttendanceInstances || 0
        },
        attendanceStatus: formattedStatus,
        coursePerformance,
        monthlyTrend,
        recentStudents
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/course-performance
export async function getCoursePerformance(req, res, next) {
  try {
    const data = await Mark.aggregate([
      {
        $project: {
          courseId: 1,
          percentage: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
        }
      },
      {
        $group: {
          _id: '$courseId',
          totalAssessments: { $sum: 1 },
          highestPercentage: { $max: '$percentage' },
          lowestPercentage: { $min: '$percentage' },
          avgPercentage: { $avg: '$percentage' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseId: '$_id',
          courseCode: '$course.courseCode',
          courseName: '$course.courseName',
          department: '$course.department',
          credits: '$course.credits',
          facultyName: '$course.facultyName',
          totalAssessments: 1,
          highestPercentage: { $round: ['$highestPercentage', 2] },
          lowestPercentage: { $round: ['$lowestPercentage', 2] },
          avgPercentage: { $round: ['$avgPercentage', 2] }
        }
      },
      { $sort: { avgPercentage: -1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/student-performance
export async function getStudentPerformance(req, res, next) {
  try {
    // Top 5 rankers
    const topPerformers = await Mark.aggregate([
      {
        $group: {
          _id: '$studentId',
          avgPercentage: {
            $avg: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
          },
          totalAssessments: { $sum: 1 }
        }
      },
      { $match: { totalAssessments: { $gte: 1 } } },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          studentId: '$_id',
          regNo: '$student.registrationNumber',
          name: '$student.name',
          email: '$student.email',
          department: '$student.department',
          semester: '$student.semester',
          avgPercentage: { $round: ['$avgPercentage', 2] },
          totalAssessments: 1
        }
      },
      { $sort: { avgPercentage: -1 } },
      { $limit: 5 }
    ]);

    // Students needing academic support (< 50% average)
    const supportNeeded = await Mark.aggregate([
      {
        $group: {
          _id: '$studentId',
          avgPercentage: {
            $avg: { $multiply: [{ $divide: ['$marksObtained', '$maximumMarks'] }, 100] }
          },
          totalAssessments: { $sum: 1 }
        }
      },
      { $match: { avgPercentage: { $lt: 50.0 } } },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          studentId: '$_id',
          regNo: '$student.registrationNumber',
          name: '$student.name',
          email: '$student.email',
          department: '$student.department',
          avgPercentage: { $round: ['$avgPercentage', 2] },
          totalAssessments: 1
        }
      },
      { $sort: { avgPercentage: 1 } }
    ]);

    // Department Distribution
    const departmentDistribution = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        topPerformers,
        supportNeeded,
        departmentDistribution
      }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/low-attendance
export async function getLowAttendanceReport(req, res, next) {
  try {
    const data = await Attendance.aggregate([
      {
        $group: {
          _id: { studentId: '$studentId', courseId: '$courseId' },
          totalClasses: { $sum: 1 },
          presentCount: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          absentCount: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } }
        }
      },
      {
        $project: {
          studentId: '$_id.studentId',
          courseId: '$_id.courseId',
          totalClasses: 1,
          presentCount: 1,
          absentCount: 1,
          attendancePercentage: {
            $round: [{ $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] }, 2]
          }
        }
      },
      { $match: { attendancePercentage: { $lt: 75.0 } } },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          studentId: 1,
          courseId: 1,
          studentName: '$student.name',
          registrationNumber: '$student.registrationNumber',
          email: '$student.email',
          department: '$student.department',
          courseCode: '$course.courseCode',
          courseName: '$course.courseName',
          facultyName: '$course.facultyName',
          totalClasses: 1,
          presentCount: 1,
          absentCount: 1,
          attendancePercentage: 1,
          shortfallClasses: {
            $ceil: {
              $divide: [
                { $subtract: [{ $multiply: [0.75, '$totalClasses'] }, '$presentCount'] },
                0.25 // sessions to recover to 75%
              ]
            }
          }
        }
      },
      { $sort: { attendancePercentage: 1 } }
    ]);

    res.json({
      success: true,
      count: data.length,
      threshold: 75.0,
      rule: 'Present and Absent only (Attendance Rate = (Present / Total) * 100)',
      data
    });
  } catch (err) {
    next(err);
  }
}
