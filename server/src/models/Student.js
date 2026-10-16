import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Za-z0-9_-]{4,20}$/, 'Registration number must be 4-20 alphanumeric characters']
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please provide a valid email address']
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8']
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'students'
  }
);

export const Student = mongoose.model('Student', studentSchema);
