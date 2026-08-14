import mongoose from 'mongoose';

const statusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  comment: {
    type: String,
    default: '',
  },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
    },
    statusTimeline: [statusTimelineSchema],
    coverLetter: {
      type: String,
      default: '',
    },
    resumeType: {
      type: String,
      enum: ['uploaded', 'generated'],
      default: 'generated',
    },
    resumeTemplate: {
      type: String,
      enum: ['classic', 'modern', 'creative'],
      default: 'classic',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, employee: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
