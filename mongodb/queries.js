/**
 * MongoDB Aggregation Pipelines Runner (5 Essential Queries)
 * Course: CSE494 - Intelligent NoSQL Databases (CA2)
 * 
 * Demonstrates the 5 required academic aggregation pipelines using MongoDB stages:
 * $match, $group, $project, $sort, $limit, $lookup, $unwind
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack';

export async function runAllAggregations() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    console.log('================================================================');
    console.log(' CSE494: 5 Essential MongoDB Aggregation Queries Demonstration');
    console.log('================================================================\n');

    // Pipeline 1: Count students by department
    console.log('--- [Pipeline 1] Count Students by Department ($group, $sort) ---');
    const pipeline1 = [
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 }
        }
      },
      {
        $sort: { totalStudents: -1 }
      }
    ];
    const res1 = await db.collection('students').aggregate(pipeline1).toArray();
    console.table(res1.map(r => ({ Department: r._id, 'Total Students': r.totalStudents })));

    // Pipeline 2: Calculate average marks for each course
    console.log('\n--- [Pipeline 2] Calculate Average Marks for Each Course ($group, $lookup, $unwind, $project) ---');
    const pipeline2 = [
      {
        $group: {
          _id: '$courseId',
          totalAssessments: { $sum: 1 },
          avgMarksObtained: { $avg: '$marksObtained' },
          avgPercentage: {
            $avg: {
              $multiply: [
                { $divide: ['$marksObtained', { $cond: [{ $gt: ['$maximumMarks', 0] }, '$maximumMarks', 1] }] },
                100
              ]
            }
          }
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
          facultyName: '$course.facultyName',
          totalAssessments: 1,
          avgPercentage: { $round: ['$avgPercentage', 2] }
        }
      },
      { $sort: { avgPercentage: -1 } }
    ];
    const res2 = await db.collection('marks').aggregate(pipeline2).toArray();
    console.table(res2);

    // Pipeline 3: Calculate each student's average marks
    console.log('\n--- [Pipeline 3] Calculate Each Student\'s Average Marks ($group, $lookup, $unwind, $project, $sort) ---');
    const pipeline3 = [
      {
        $group: {
          _id: '$studentId',
          totalAssessments: { $sum: 1 },
          avgPercentage: {
            $avg: {
              $multiply: [
                { $divide: ['$marksObtained', { $cond: [{ $gt: ['$maximumMarks', 0] }, '$maximumMarks', 1] }] },
                100
              ]
            }
          }
        }
      },
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
          registrationNumber: '$student.registrationNumber',
          name: '$student.name',
          department: '$student.department',
          totalAssessments: 1,
          averageMarksPercentage: { $round: ['$avgPercentage', 2] }
        }
      },
      { $sort: { averageMarksPercentage: -1 } }
    ];
    const res3 = await db.collection('marks').aggregate(pipeline3).toArray();
    console.table(res3.slice(0, 10)); // Display top 10 in console

    // Pipeline 4: Calculate attendance percentage for each student and identify students below 75%
    console.log('\n--- [Pipeline 4] Attendance Percentage for Each Student and Students Below 75% ---');
    const pipeline4 = [
      {
        $group: {
          _id: '$studentId',
          totalClasses: { $sum: 1 },
          presentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] }
          },
          absentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          studentId: '$_id',
          totalClasses: 1,
          presentCount: 1,
          absentCount: 1,
          attendancePercentage: {
            $cond: [
              { $gt: ['$totalClasses', 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ['$presentCount', '$totalClasses'] }, 100] },
                  2
                ]
              },
              0
            ]
          }
        }
      },
      {
        $match: {
          attendancePercentage: { $lt: 75.0 }
        }
      },
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
        $project: {
          registrationNumber: '$student.registrationNumber',
          studentName: '$student.name',
          department: '$student.department',
          totalClasses: 1,
          presentCount: 1,
          absentCount: 1,
          attendancePercentage: 1,
          alert: { $literal: 'BELOW 75% THRESHOLD' }
        }
      },
      { $sort: { attendancePercentage: 1 } }
    ];
    const res4 = await db.collection('attendance').aggregate(pipeline4).toArray();
    console.table(res4);

    // Pipeline 5: Find the top five students by average marks
    console.log('\n--- [Pipeline 5] Top Five Students by Average Marks ($group, $lookup, $sort, $limit) ---');
    const pipeline5 = [
      {
        $group: {
          _id: '$studentId',
          assessmentsCount: { $sum: 1 },
          averageMarksPercentage: {
            $avg: {
              $multiply: [
                { $divide: ['$marksObtained', { $cond: [{ $gt: ['$maximumMarks', 0] }, '$maximumMarks', 1] }] },
                100
              ]
            }
          }
        }
      },
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
          registrationNumber: '$student.registrationNumber',
          name: '$student.name',
          email: '$student.email',
          department: '$student.department',
          averageMarksPercentage: { $round: ['$averageMarksPercentage', 2] }
        }
      },
      { $sort: { averageMarksPercentage: -1 } },
      { $limit: 5 }
    ];
    const res5 = await db.collection('marks').aggregate(pipeline5).toArray();
    console.table(res5);

    console.log('\nAll 5 Essential MongoDB Aggregation Pipelines executed successfully!');

  } catch (err) {
    console.error('Error executing aggregations:', err);
    throw err;
  } finally {
    await client.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('queries.js')) {
  runAllAggregations().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
