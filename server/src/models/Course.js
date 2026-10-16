import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Za-z]{2,5}[0-9]{3,4}$/, 'Course code must follow format like CSE494']
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      minlength: [3, 'Course name must be at least 3 characters'],
      maxlength: [120, 'Course name cannot exceed 120 characters']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [6, 'Credits cannot exceed 6']
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8']
    },
    facultyName: {
      type: String,
      required: [true, 'Faculty name is required'],
      trim: true,
      minlength: [2, 'Faculty name must be at least 2 characters']
    }
  },
  {
    timestamps: true,
    collection: 'courses'
  }
);

export const Course = mongoose.model('Course', courseSchema);
