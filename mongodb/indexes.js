/**
 * MongoDB Essential Indexes Setup
 * Course: CSE494 - Intelligent NoSQL Databases (CA2)
 * 
 * Creates only the 4 essential indexes required by the assignment:
 * 1. Unique index on students.registrationNumber
 * 2. Unique index on students.email
 * 3. Unique index on courses.courseCode
 * 4. Compound unique index on attendance.{ studentId, courseId, date }
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack';

export async function createIndexes() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    const db = client.db();

    // 1. Students: Unique registration number & unique email
    console.log('Creating essential indexes on "students"...');
    await db.collection('students').createIndex(
      { registrationNumber: 1 },
      { unique: true, name: 'idx_unique_registrationNumber' }
    );
    await db.collection('students').createIndex(
      { email: 1 },
      { unique: true, name: 'idx_unique_email' }
    );

    // 2. Courses: Unique course code
    console.log('Creating essential index on "courses"...');
    await db.collection('courses').createIndex(
      { courseCode: 1 },
      { unique: true, name: 'idx_unique_courseCode' }
    );

    // 3. Attendance: Compound unique index on studentId, courseId, date
    console.log('Creating compound unique index on "attendance"...');
    await db.collection('attendance').createIndex(
      { studentId: 1, courseId: 1, date: 1 },
      { unique: true, name: 'idx_compound_student_course_date_unique' }
    );

    console.log('\nAll 4 essential indexes created successfully:');
    const collections = ['students', 'courses', 'attendance'];
    for (const collName of collections) {
      const idxs = await db.collection(collName).indexes();
      idxs.forEach(idx => {
        if (idx.name !== '_id_') {
          console.log(` - [${collName}] ${idx.name} : ${JSON.stringify(idx.key)} (unique: ${!!idx.unique})`);
        }
      });
    }
  } catch (err) {
    console.error('Error creating MongoDB indexes:', err);
    throw err;
  } finally {
    await client.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('indexes.js')) {
  createIndexes().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
