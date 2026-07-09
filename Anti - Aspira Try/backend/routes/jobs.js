import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { validateFields } from '../middleware/validation.js';
import { getJobs, getEmployerJobs, getJobById, createJob, updateJob, deleteJob } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/employer/me', protect, authorize('employer'), getEmployerJobs);
router.get('/:id', getJobById);
router.post(
  '/',
  [
    protect,
    authorize('employer'),
    body('title', 'Job title is required').notEmpty().trim(),
    body('company', 'Company name is required').notEmpty().trim(),
    body('location', 'Location is required').notEmpty().trim(),
    body('salary', 'Salary range is required').notEmpty().trim(),
    body('type', 'Job type is required').notEmpty().trim(),
    body('description', 'Description is required').notEmpty(),
    body('requirements', 'At least one requirement is required').isArray({ min: 1 }),
    validateFields,
  ],
  createJob
);
router.put(
  '/:id',
  [
    protect,
    authorize('employer'),
    body('title', 'Job title is required').notEmpty().trim(),
    body('company', 'Company name is required').notEmpty().trim(),
    body('location', 'Location is required').notEmpty().trim(),
    body('salary', 'Salary range is required').notEmpty().trim(),
    body('type', 'Job type is required').notEmpty().trim(),
    body('description', 'Description is required').notEmpty(),
    body('requirements', 'At least one requirement is required').isArray({ min: 1 }),
    validateFields,
  ],
  updateJob
);
router.delete('/:id', protect, authorize('employer'), deleteJob);

export default router;
