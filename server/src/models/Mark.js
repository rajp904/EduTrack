import mongoose from 'mongoose';

const markSchema = new mongoose.Schema(
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
    assessmentName: {
      type: String,
      required: [true, 'Assessment name is required'],
      trim: true,
      minlength: [2, 'Assessment name must be at least 2 characters']
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks obtained cannot be negative'],
      validate: {
        validator: function (val) {
          return val <= this.maximumMarks;
        },
        message: 'Marks obtained ({VALUE}) cannot exceed maximum marks'
      }
    },
    maximumMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
      min: [1, 'Maximum marks must be at least 1']
    },
    assessmentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'marks'
  }
);

export const Mark = mongoose.model('Mark', markSchema);
