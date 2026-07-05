import Job from '../models/Job.js';

const buildJobQuery = ({ search, location, type }) => {
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (type) {
    query.type = { $regex: type, $options: 'i' };
  }

  return query;
};

export const getJobs = async (req, res) => {
  try {
    const query = buildJobQuery(req.query);
    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving jobs' });
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error fetching employer jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    res.json({ success: true, job });
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    res.status(500).json({ success: false, message: 'Server error retrieving job details' });
  }
};

export const createJob = async (req, res) => {
  const { title, company, location, salary, type, description, requirements } = req.body;

  try {
    const job = new Job({
      title,
      company,
      location,
      salary,
      type,
      description,
      requirements,
      employer: req.user.id,
    });

    await job.save();
    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error creating job listing' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job listing',
      });
    }

    await job.deleteOne();

    res.json({ success: true, message: 'Job listing deleted successfully' });
  } catch (err) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    res.status(500).json({ success: false, message: 'Server error deleting job listing' });
  }
};
