import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID reference is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID reference is required']
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required']
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent'],
        message: 'Status must be either Present or Absent'
      }
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'attendance'
  }
);

// Compound unique index prevents marking attendance for the same student, course, and date twice
attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
