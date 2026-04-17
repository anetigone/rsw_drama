import { Router } from 'express';
import { questionnaireController } from '../controllers/questionnaire.controller';

const router = Router();

/**
 * @route   POST /api/questionnaire/analyze
 * @desc    分析问卷结果（非流式）
 * @access  Public
 */
router.post('/analyze', questionnaireController.analyze.bind(questionnaireController));

/**
 * @route   POST /api/questionnaire/analyze/stream
 * @desc    分析问卷结果（流式）
 * @access  Public
 */
router.post('/analyze/stream', questionnaireController.analyzeStream.bind(questionnaireController));

export default router;
