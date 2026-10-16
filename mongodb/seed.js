/**
 * MongoDB Data Seeder
 * Course: CSE494 - Intelligent NoSQL Databases (CA2)
 * 
 * Populates realistic academic data for EduTrack:
 * - 25 Students
 * - 6 Courses
 * - 180+ Attendance Records (Status: Present or Absent only)
 * - 80+ Marks Records
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { resetDatabase } from './reset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack';

export async function seedDatabase() {
  console.log('Resetting database and applying schema validators/indexes...');
  await resetDatabase();

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();

    // 1. Seed Courses (6 courses)
    console.log('Seeding Courses...');
    const coursesData = [
      {
        _id: new ObjectId(),
        courseCode: 'CSE494',
        courseName: 'Intelligent NoSQL Databases',
        department: 'Computer Science',
        credits: 4,
        semester: 6,
        facultyName: 'Dr. Rajesh Sharma',
        createdAt: new Date('2024-01-10T09:00:00Z')
      },
      {
        _id: new ObjectId(),
        courseCode: 'CSE302',
        courseName: 'Operating Systems & Concurrency',
        department: 'Computer Science',
        credits: 4,
        semester: 6,
        facultyName: 'Prof. Ananya Sen',
        createdAt: new Date('2024-01-10T09:00:00Z')
      },
      {
        _id: new ObjectId(),
        courseCode: 'CSE310',
        courseName: 'Full-Stack Web Technologies',
        department: 'Information Technology',
        credits: 3,
        semester: 6,
        facultyName: 'Dr. Vikramaditya Rao',
        createdAt: new Date('2024-01-10T09:00:00Z')
      },
      {
        _id: new ObjectId(),
        courseCode: 'DS301',
        courseName: 'Big Data Analytics & Spark',
        department: 'Data Science',
        credits: 4,
        semester: 6,
        facultyName: 'Dr. Meera Nambiar',
        createdAt: new Date('2024-01-10T09:00:00Z')
      },
      {
        _id: new ObjectId(),
        courseCode: 'AIML401',
        courseName: 'Deep Learning & Neural Networks',
        department: 'AI & Machine Learning',
        credits: 4,
        semester: 6,
        facultyName: 'Prof. Siddharth Roy',
        createdAt: new Date('2024-01-10T09:00:00Z')
      },
      {
        _id: new ObjectId(),
        courseCode: 'ECE205',
        courseName: 'Embedded Microcontrollers & IoT',
        department: 'Electronics & Comm',
        credits: 3,
        semester: 4,
        facultyName: 'Dr. Kavita Verma',
        createdAt: new Date('2024-01-10T09:00:00Z')
      }
    ];

    await db.collection('courses').insertMany(coursesData);
    console.log(`Inserted ${coursesData.length} courses.`);

    // 2. Seed Students (25 students across departments)
    console.log('Seeding Students...');
    const rawStudents = [
      { reg: 'REG2024001', name: 'Aarav Mehta', email: 'aarav.mehta@edutrack.edu', dept: 'Computer Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024002', name: 'Diya Sharma', email: 'diya.sharma@edutrack.edu', dept: 'Computer Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024003', name: 'Rohan Iyer', email: 'rohan.iyer@edutrack.edu', dept: 'Computer Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024004', name: 'Ananya Verma', email: 'ananya.verma@edutrack.edu', dept: 'Information Technology', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024005', name: 'Kabir Patel', email: 'kabir.patel@edutrack.edu', dept: 'Information Technology', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024006', name: 'Pooja Hegde', email: 'pooja.hegde@edutrack.edu', dept: 'Information Technology', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024007', name: 'Arjun Das', email: 'arjun.das@edutrack.edu', dept: 'Data Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024008', name: 'Sneha Kulkarni', email: 'sneha.kulkarni@edutrack.edu', dept: 'Data Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024009', name: 'Aditya Nair', email: 'aditya.nair@edutrack.edu', dept: 'Data Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024010', name: 'Ishita Banerjee', email: 'ishita.banerjee@edutrack.edu', dept: 'AI & Machine Learning', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024011', name: 'Vikram Chauhan', email: 'vikram.chauhan@edutrack.edu', dept: 'AI & Machine Learning', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024012', name: 'Meera Pillai', email: 'meera.pillai@edutrack.edu', dept: 'AI & Machine Learning', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024013', name: 'Gautam Singhania', email: 'gautam.singhania@edutrack.edu', dept: 'Electronics & Comm', sem: 4, date: '2023-08-01' },
      { reg: 'REG2024014', name: 'Rhea Menon', email: 'rhea.menon@edutrack.edu', dept: 'Electronics & Comm', sem: 4, date: '2023-08-01' },
      { reg: 'REG2024015', name: 'Karthik Raja', email: 'karthik.raja@edutrack.edu', dept: 'Electronics & Comm', sem: 4, date: '2023-08-01' },
      { reg: 'REG2024016', name: 'Tanvi Joshi', email: 'tanvi.joshi@edutrack.edu', dept: 'Computer Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024017', name: 'Nikhil Deshmukh', email: 'nikhil.deshmukh@edutrack.edu', dept: 'Computer Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024018', name: 'Priyanka Reddy', email: 'priyanka.reddy@edutrack.edu', dept: 'Information Technology', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024019', name: 'Siddharth Bose', email: 'siddharth.bose@edutrack.edu', dept: 'Data Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024020', name: 'Bhavna Chawla', email: 'bhavna.chawla@edutrack.edu', dept: 'AI & Machine Learning', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024021', name: 'Devendra Pandey', email: 'devendra.pandey@edutrack.edu', dept: 'Computer Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024022', name: 'Swati Agarwal', email: 'swati.agarwal@edutrack.edu', dept: 'Information Technology', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024023', name: 'Harsh Vardhan', email: 'harsh.vardhan@edutrack.edu', dept: 'Data Science', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024024', name: 'Ritika Sen', email: 'ritika.sen@edutrack.edu', dept: 'AI & Machine Learning', sem: 6, date: '2022-08-01' },
      { reg: 'REG2024025', name: 'Manish Tiwari', email: 'manish.tiwari@edutrack.edu', dept: 'Electronics & Comm', sem: 4, date: '2023-08-01' }
    ];

    const studentsData = rawStudents.map(s => ({
      _id: new ObjectId(),
      registrationNumber: s.reg,
      name: s.name,
      email: s.email,
      department: s.dept,
      semester: s.sem,
      enrollmentDate: new Date(s.date),
      createdAt: new Date('2024-01-15T10:00:00Z')
    }));

    await db.collection('students').insertMany(studentsData);
    console.log(`Inserted ${studentsData.length} students.`);

    // 3. Seed Attendance Records (ONLY 'Present' or 'Absent')
    console.log('Seeding Attendance Records (Present & Absent only)...');
    const attendanceData = [];
    const dates = [
      new Date('2024-02-05T09:00:00Z'),
      new Date('2024-02-12T09:00:00Z'),
      new Date('2024-02-19T09:00:00Z'),
      new Date('2024-02-26T09:00:00Z'),
      new Date('2024-03-04T09:00:00Z'),
      new Date('2024-03-11T09:00:00Z'),
      new Date('2024-03-18T09:00:00Z'),
      new Date('2024-03-25T09:00:00Z')
    ];

    // Helper: Determine attendance patterns for students
    // Students 0-14: High attendance (85-100% Present)
    // Students 15-18: Good attendance (~75-80% Present)
    // Students 19-24: Low attendance (<75% to trigger the low-attendance query)
    const getStatusForStudent = (studentIdx, dateIdx) => {
      if (studentIdx >= 19) {
        // Low attendance students (absent on half the dates)
        return (dateIdx % 2 === 0) ? 'Absent' : 'Present';
      } else if (studentIdx >= 15) {
        // Moderate attendance (absent on 2 dates out of 8 = 75%)
        return (dateIdx === 3 || dateIdx === 6) ? 'Absent' : 'Present';
      } else {
        // High attendance (almost all Present)
        return (dateIdx === 5 && studentIdx % 4 === 0) ? 'Absent' : 'Present';
      }
    };

    const cse494Course = coursesData[0];
    const ds301Course = coursesData[3];
    const ece205Course = coursesData[5];

    // CSE494 Attendance (Computer Science, IT, AI/ML)
    const cse494Students = studentsData.filter(s => ['Computer Science', 'Information Technology', 'AI & Machine Learning'].includes(s.department));
    for (const s of cse494Students) {
      const sIdx = studentsData.findIndex(item => item._id.equals(s._id));
      for (let dIdx = 0; dIdx < dates.length; dIdx++) {
        const status = getStatusForStudent(sIdx, dIdx);
        attendanceData.push({
          _id: new ObjectId(),
          studentId: s._id,
          courseId: cse494Course._id,
          date: dates[dIdx],
          status: status,
          remarks: status === 'Present' ? 'Attended' : 'Absent',
          createdAt: dates[dIdx]
        });
      }
    }

    // DS301 Attendance (Data Science & AI/ML)
    const ds301Students = studentsData.filter(s => ['Data Science', 'AI & Machine Learning'].includes(s.department));
    for (const s of ds301Students) {
      const sIdx = studentsData.findIndex(item => item._id.equals(s._id));
      for (let dIdx = 0; dIdx < 5; dIdx++) {
        const status = getStatusForStudent(sIdx, dIdx);
        attendanceData.push({
          _id: new ObjectId(),
          studentId: s._id,
          courseId: ds301Course._id,
          date: dates[dIdx],
          status: status,
          remarks: status === 'Present' ? 'Lab attended' : 'Absent',
          createdAt: dates[dIdx]
        });
      }
    }

    // ECE205 Attendance (Electronics)
    const ece205Students = studentsData.filter(s => s.department === 'Electronics & Comm');
    for (const s of ece205Students) {
      const sIdx = studentsData.findIndex(item => item._id.equals(s._id));
      for (let dIdx = 0; dIdx < 6; dIdx++) {
        const status = getStatusForStudent(sIdx, dIdx);
        attendanceData.push({
          _id: new ObjectId(),
          studentId: s._id,
          courseId: ece205Course._id,
          date: dates[dIdx],
          status: status,
          remarks: status === 'Present' ? 'Attended' : 'Absent',
          createdAt: dates[dIdx]
        });
      }
    }

    await db.collection('attendance').insertMany(attendanceData);
    console.log(`Inserted ${attendanceData.length} attendance records.`);

    // 4. Seed Marks Records
    console.log('Seeding Assessment Marks...');
    const marksData = [];
    const assessments = [
      { name: 'Quiz 1', max: 20, date: new Date('2024-02-15T11:00:00Z') },
      { name: 'Assignment 1', max: 30, date: new Date('2024-03-01T17:00:00Z') },
      { name: 'Midterm Exam', max: 50, date: new Date('2024-03-20T10:00:00Z') },
      { name: 'Project Phase 1', max: 40, date: new Date('2024-04-05T14:00:00Z') }
    ];

    // Seed CSE494 marks
    for (const s of cse494Students) {
      const sIdx = studentsData.findIndex(item => item._id.equals(s._id));
      for (const asm of assessments) {
        let marks;
        if ([0, 1, 2, 7, 10].includes(sIdx)) {
          // Top performers (85-98%)
          marks = Math.round((0.85 + (Math.random() * 0.12)) * asm.max * 10) / 10;
        } else if ([19, 20, 24].includes(sIdx)) {
          // Lower performers (35-55%)
          marks = Math.round((0.35 + (Math.random() * 0.20)) * asm.max * 10) / 10;
        } else {
          // Average performers (60-80%)
          marks = Math.round((0.65 + (Math.random() * 0.18)) * asm.max * 10) / 10;
        }

        marks = Math.min(asm.max, Math.max(0, marks));

        marksData.push({
          _id: new ObjectId(),
          studentId: s._id,
          courseId: cse494Course._id,
          assessmentName: asm.name,
          marksObtained: marks,
          maximumMarks: asm.max,
          assessmentDate: asm.date,
          createdAt: asm.date
        });
      }
    }

    // Seed DS301 marks
    for (const s of ds301Students) {
      for (const asm of assessments.slice(0, 3)) {
        let marks = Math.round((0.65 + (Math.random() * 0.25)) * asm.max * 10) / 10;
        marks = Math.min(asm.max, Math.max(0, marks));
        marksData.push({
          _id: new ObjectId(),
          studentId: s._id,
          courseId: ds301Course._id,
          assessmentName: asm.name,
          marksObtained: marks,
          maximumMarks: asm.max,
          assessmentDate: asm.date,
          createdAt: asm.date
        });
      }
    }

    // Seed ECE205 marks
    for (const s of ece205Students) {
      for (const asm of assessments.slice(0, 2)) {
        let marks = Math.round((0.70 + (Math.random() * 0.22)) * asm.max * 10) / 10;
        marks = Math.min(asm.max, Math.max(0, marks));
        marksData.push({
          _id: new ObjectId(),
          studentId: s._id,
          courseId: ece205Course._id,
          assessmentName: asm.name,
          marksObtained: marks,
          maximumMarks: asm.max,
          assessmentDate: asm.date,
          createdAt: asm.date
        });
      }
    }

    await db.collection('marks').insertMany(marksData);
    console.log(`Inserted ${marksData.length} marks records.`);

    console.log('\nDatabase seeding finished successfully!');
    console.log(`Summary:
    - Students:   ${studentsData.length}
    - Courses:    ${coursesData.length}
    - Attendance: ${attendanceData.length} (Present / Absent only)
    - Marks:      ${marksData.length}`);

  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    await client.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
