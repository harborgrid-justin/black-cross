/**
 * Workflow Controller
 * Handle HTTP requests for workflow operations
 */

const { workflowService } = require('../services');
const {
  createWorkflowSchema,
  executeWorkflowSchema
} = require('../validators/workflowValidator');

class WorkflowController {
  /**
   * Create workflow
   * POST /api/v1/workflows
   */
  async createWorkflow(req, res) {
    try {
      const { error, value } = createWorkflowSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const workflow = await workflowService.createWorkflow(value);
      
      res.status(201).json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get workflow
   * GET /api/v1/workflows/:id
   */
  async getWorkflow(req, res) {
    try {
      const workflow = await workflowService.getWorkflow(req.params.id);
      
      if (!workflow) {
        return res.status(404).json({ error: 'Not Found', message: 'Workflow not found' });
      }

      res.json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Execute workflow
   * POST /api/v1/incidents/:id/execute-workflow
   */
  async executeWorkflow(req, res) {
    try {
      const { error, value } = executeWorkflowSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || null;
      const workflow = await workflowService.executeWorkflow(
        req.params.id,
        value.workflow_id,
        userId
      );

      res.json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (err) {
      if (err.message === 'Workflow not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Pause workflow
   * POST /api/v1/workflows/:id/pause
   */
  async pauseWorkflow(req, res) {
    try {
      const workflow = await workflowService.pauseWorkflow(req.params.id);

      res.json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (err) {
      if (err.message === 'Workflow not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Resume workflow
   * POST /api/v1/workflows/:id/resume
   */
  async resumeWorkflow(req, res) {
    try {
      const workflow = await workflowService.resumeWorkflow(req.params.id);

      res.json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('not paused')) {
        return res.status(400).json({ error: 'Bad Request', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Cancel workflow
   * POST /api/v1/workflows/:id/cancel
   */
  async cancelWorkflow(req, res) {
    try {
      const workflow = await workflowService.cancelWorkflow(req.params.id);

      res.json({
        success: true,
        data: workflow.toJSON()
      });
    } catch (err) {
      if (err.message === 'Workflow not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * List workflow templates
   * GET /api/v1/workflows/templates
   */
  async listTemplates(req, res) {
    try {
      const templates = await workflowService.listTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}

module.exports = new WorkflowController();
