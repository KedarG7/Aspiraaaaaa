import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a job location'],
      trim: true,
    },
    salary: {
      type: String,
      required: [true, 'Please add a salary range or package'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify job type (e.g. Full-time, Part-time, Remote)'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    requirements: {
      type: [String],
      required: [true, 'Please add at least one requirement'],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Job', JobSchema);
