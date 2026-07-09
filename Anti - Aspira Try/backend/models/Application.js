import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      required: [true, 'Please add a cover letter'],
    },
    resume: {
      experience: {
        type: String,
        required: [true, 'Please add details of your professional experience'],
      },
      skills: {
        type: String,
        required: [true, 'Please outline your skills'],
      },
      portfolioUrl: {
        type: String,
        trim: true,
      },
      resumeText: {
        type: String,
      },
      file: {
        filename: String,
        path: String,
        mimeType: String,
        size: Number,
        pages: Number,
      },
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interviewing', 'accepted', 'rejected'],
      default: 'applied',
    },
    interviewDetails: {
      date: Date,
      time: String,
      link: String,
      message: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Application', ApplicationSchema);
