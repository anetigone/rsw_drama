import { Request, Response } from 'express';
import { questionnaireService } from '../services/questionnaire.service';

/**
 * 问卷分析控制器
 */
export class QuestionnaireController {
  /**
   * 分析问卷结果（非流式）
   */
  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { answer, questionnaireType } = req.body;

      // 验证参数
      if (!answer || !questionnaireType) {
        res.status(400).json({
          success: false,
          error: '缺少必要参数：answer 或 questionnaireType'
        });
        return;
      }

      // 调用服务
      const result = await questionnaireService.analyze({
        answer,
        questionnaireType
      });

      if (result.success) {
        res.json({
          success: true,
          analysis: result.analysis
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('问卷分析控制器错误:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误'
      });
    }
  }

  /**
   * 分析问卷结果（流式）
   */
  async analyzeStream(req: Request, res: Response): Promise<void> {
    try {
      const { answer, questionnaireType } = req.body;

      // 验证参数
      if (!answer || !questionnaireType) {
        res.status(400).json({
          success: false,
          error: '缺少必要参数：answer 或 questionnaireType'
        });
        return;
      }

      // 设置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // 调用流式服务
      await questionnaireService.analyzeStream({
        answer,
        questionnaireType
      }, (chunk) => {
        // 发送 SSE 格式的数据
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      });

      // 发送完成信号
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('问卷流式分析控制器错误:', error);
      // 发送错误信息
      res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : '服务器内部错误' })}\n\n`);
      res.end();
    }
  }
}

export const questionnaireController = new QuestionnaireController();
