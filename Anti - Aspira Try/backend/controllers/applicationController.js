import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { sendMail } from '../utils/mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads', 'resumes');

fs.mkdirSync(uploadDir, { recursive: true });

export const applyForJob = async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter, experience, skills, portfolioUrl, resumeText } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    const existingApplication = await Application.findOne({ job: jobId, candidate: req.user.id });
    if (existingApplication) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({ success: false, message: 'You have already applied for this job listing' });
    }

    const resumeObj = {
      experience,
      skills,
      portfolioUrl,
      resumeText,
    };

    if (req.file) {
      const dataBuffer = fs.readFileSync(req.file.path);
      const parsed = await pdfParse(dataBuffer);
      const pageCount = parsed.numpages || (parsed && parsed.metadata && parsed.metadata['xmp:Pages']) || 0;

      if (pageCount > 1) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, message: 'Resume must be a single-page PDF' });
      }

      resumeObj.file = {
        filename: req.file.filename,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        pages: pageCount,
      };
    }

    const application = new Application({
      job: jobId,
      candidate: req.user.id,
      coverLetter,
      resume: resumeObj,
    });

    await application.save();

    res.status(201).json({ success: true, application });
  } catch (err) {
    console.error(err);

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ success: false, message: 'Server error submitting application' });
  }
};

export const getResume = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application || !application.resume || !application.resume.file || !application.resume.file.path) {
      return res.status(404).json({ success: false, message: 'Resume not found for this application' });
    }

    if (!application.job || application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume' });
    }

    const filePath = application.resume.file.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file missing on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${application.resume.file.filename}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Unable to fetch resume' });
  }
};

export const getCandidateApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate({
        path: 'job',
        select: 'title company location salary type description requirements',
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

export const getEmployerApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id });
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company location')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { status, interviewDetails } = req.body;

  try {
    const application = await Application.findById(req.params.id).populate('job').populate('candidate');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application',
      });
    }

    application.status = status;

    if (status === 'interviewing') {
      if (!interviewDetails || !interviewDetails.date || !interviewDetails.time) {
        return res.status(400).json({
          success: false,
          message: 'Interview date and time are required for scheduling',
        });
      }

      application.interviewDetails = {
        date: interviewDetails.date,
        time: interviewDetails.time,
        link: interviewDetails.link || 'https://meet.jit.si/aspira-job-interview',
        message: interviewDetails.message || 'We would love to schedule an interview with you.',
      };

      try {
        const candidateEmail = application.candidate.email;
        const subject = `Interview Invitation: ${application.job.title} at ${application.job.company}`;
        const html = `<p>Hi ${application.candidate.name},</p>
          <p>Congratulations! ${application.job.company} has invited you to interview for the <strong>${application.job.title}</strong> position.</p>
          <p><strong>Date:</strong> ${new Date(interviewDetails.date).toDateString()}<br/>
          <strong>Time:</strong> ${interviewDetails.time}<br/>
          <strong>Link:</strong> <a href="${application.interviewDetails.link}">${application.interviewDetails.link}</a></p>
          <p>${application.interviewDetails.message}</p>
          <p>Best regards,<br/>The Aspira Team</p>`;

        await sendMail({ to: candidateEmail, subject, html });
      } catch (mailErr) {
        console.error('Error sending interview email:', mailErr);
      }
    }

    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error updating application' });
  }
};
