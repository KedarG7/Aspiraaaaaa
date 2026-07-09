import Job from '../models/Job.js';

const normalizeSkills = (skills) => {
  if (Array.isArray(skills)) {
    return skills.map((skill) => skill.trim()).filter(Boolean);
  }

  return (skills || '')
    .split(/[\n,]+/)
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const normalizeRequirements = (requirements) => {
  if (Array.isArray(requirements)) {
    return requirements.map((item) => item.trim()).filter(Boolean);
  }

  return (requirements || '')
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getPagination = (page, limit) => {
  const pageNumber = Math.max(1, Number(page) || 1);
  const limitNumber = Math.min(50, Math.max(1, Number(limit) || 9));
  return { page: pageNumber, limit: limitNumber, skip: (pageNumber - 1) * limitNumber };
};

const buildJobQuery = ({ search, location, type, category, skills }) => {
  const filters = [];

  if (search) {
    filters.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (location) {
    filters.push({ location: { $regex: location, $options: 'i' } });
  }

  if (type) {
    filters.push({ type: { $regex: type, $options: 'i' } });
  }

  if (category) {
    filters.push({ category: { $regex: category, $options: 'i' } });
  }

  if (skills) {
    const skillList = skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (skillList.length) {
      filters.push({
        $or: skillList.map((skill) => ({ skills: { $elemMatch: { $regex: skill, $options: 'i' } } })),
      });
    }
  }

  return filters.length ? { $and: filters } : {};
};

export const getJobs = async (req, res) => {
  try {
    const query = buildJobQuery(req.query);
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('employer', 'name companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: jobs.length,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      jobs,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error retrieving jobs' });
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const query = { employer: req.user.id };
    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: jobs.length,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      jobs,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error fetching employer jobs' });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name companyName companyWebsite companyDescription');

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
  const { title, company, location, salary, type, category, skills, description, requirements } = req.body;

  try {
    const job = new Job({
      title,
      company,
      location,
      salary,
      type,
      category,
      skills: normalizeSkills(skills),
      description,
      requirements: normalizeRequirements(requirements),
      employer: req.user.id,
    });

    await job.save();
    res.status(201).json({ success: true, job });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error creating job listing' });
  }
};

export const updateJob = async (req, res) => {
  const { title, company, location, salary, type, category, skills, description, requirements } = req.body;

  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job listing' });
    }

    job.title = title;
    job.company = company;
    job.location = location;
    job.salary = salary;
    job.type = type;
    job.category = category;
    job.skills = normalizeSkills(skills);
    job.description = description;
    job.requirements = normalizeRequirements(requirements);

    await job.save();

    res.json({ success: true, job });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }
    res.status(500).json({ success: false, message: 'Server error updating job listing' });
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
