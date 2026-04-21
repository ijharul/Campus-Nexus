import express from 'express';
import {
  analyzeResume,
  generateRoadmap,
  analyzeSkillsGap,
  analyzeCareerSwitch
} from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Enforce JWT requirements
router.use(protect);

router.post('/analyze-resume', upload.single('resume'), analyzeResume);
router.post('/career-roadmap', generateRoadmap);
router.post('/skills-gap', analyzeSkillsGap);
router.post('/career-switch', analyzeCareerSwitch);

export default router;
