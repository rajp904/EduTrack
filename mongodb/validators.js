/**
 * MongoDB $jsonSchema Database-Level Validation Setup
 * Course: CSE494 - Intelligent NoSQL Databases (CA2)
 * 
 * Enforces strict document structure at the MongoDB database engine level.
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutrack';

export const schemas = {
  students: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['registrationNumber', 'name', 'email', 'department', 'semester'],
      properties: {
        registrationNumber: {
          bsonType: 'string',
          pattern: '^[A-Za-z0-9_-]{4,20}$',
          description: 'must be a string of 4-20 alphanumeric characters and is required'
        },
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'must be a string of at least 2 characters and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email string and is required'
        },
        department: {
          bsonType: 'string',
          minLength: 2,
          description: 'academic department name is required'
        },
        semester: {
          bsonType: 'int',
          minimum: 1,
          maximum: 8,
          description: 'must be an integer between 1 and 8 and is required'
        },
        enrollmentDate: {
          bsonType: ['date', 'string']
        },
        createdAt: {
          bsonType: ['date', 'string']
        }
      }
    }
  },

  courses: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['courseCode', 'courseName', 'department', 'credits', 'semester', 'facultyName'],
      properties: {
        courseCode: {
          bsonType: 'string',
          pattern: '^[A-Za-z]{2,5}[0-9]{3,4}$',
          description: 'must be standard course code format like CSE494 and is required'
        },
        courseName: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 120,
          description: 'course name is required'
        },
        department: {
          bsonType: 'string',
          minLength: 2,
          description: 'department offering the course is required'
        },
        credits: {
          bsonType: 'int',
          minimum: 1,
          maximum: 6,
          description: 'credits must be an integer between 1 and 6'
        },
        semester: {
          bsonType: 'int',
          minimum: 1,
          maximum: 8,
          description: 'semester must be an integer between 1 and 8'
        },
        facultyName: {
          bsonType: 'string',
          minLength: 2,
          description: 'faculty name is required'
        },
        createdAt: {
          bsonType: ['date', 'string']
        }
      }
    }
  },

  attendance: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['studentId', 'courseId', 'date', 'status'],
      properties: {
        studentId: {
          bsonType: 'objectId',
          description: 'must reference a valid student document ObjectId'
        },
        courseId: {
          bsonType: 'objectId',
          description: 'must reference a valid course document ObjectId'
        },
        date: {
          bsonType: 'date',
          description: 'must be a valid date object'
        },
        status: {
          enum: ['Present', 'Absent'],
          description: 'status must be either Present or Absent'
        },
        remarks: {
          bsonType: 'string',
          description: 'optional notes'
        },
        createdAt: {
          bsonType: ['date', 'string']
        }
      }
    }
  },

  marks: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['studentId', 'courseId', 'assessmentName', 'marksObtained', 'maximumMarks'],
      properties: {
        studentId: {
          bsonType: 'objectId',
          description: 'must reference a valid student document ObjectId'
        },
        courseId: {
          bsonType: 'objectId',
          description: 'must reference a valid course document ObjectId'
        },
        assessmentName: {
          bsonType: 'string',
          minLength: 2,
          description: 'assessment type (e.g. Quiz 1, Midterm Exam) is required'
        },
        marksObtained: {
          bsonType: ['double', 'int', 'decimal'],
          minimum: 0,
          description: 'marks achieved, must be >= 0'
        },
        maximumMarks: {
          bsonType: ['double', 'int', 'decimal'],
          minimum: 1,
          description: 'total achievable marks, must be >= 1'
        },
        assessmentDate: {
          bsonType: ['date', 'string']
        },
        createdAt: {
          bsonType: ['date', 'string']
        }
      }
    }
  }
};

export async function applyValidators() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    const db = client.db();

    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);

    for (const [collName, schemaDef] of Object.entries(schemas)) {
      if (existingNames.includes(collName)) {
        console.log(`Updating $jsonSchema validator on '${collName}'...`);
        await db.command({
          collMod: collName,
          validator: schemaDef,
          validationLevel: 'strict',
          validationAction: 'error'
        });
      } else {
        console.log(`Creating collection '${collName}' with $jsonSchema validation...`);
        await db.createCollection(collName, {
          validator: schemaDef,
          validationLevel: 'strict',
          validationAction: 'error'
        });
      }
    }

    console.log('MongoDB $jsonSchema validators applied successfully (Attendance: Present/Absent).');
  } catch (err) {
    console.error('Error applying MongoDB validators:', err);
    throw err;
  } finally {
    await client.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('validators.js')) {
  applyValidators().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
