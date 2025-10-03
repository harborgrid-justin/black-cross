/**
 * Post-Mortem Controller
 * Handle HTTP requests for post-mortem operations
 */

const { postMortemService } = require('../services');
const {
  createPostMortemSchema,
  updatePostMortemSchema,
  addLessonSchema,
  addRecommendationSchema,
  addActionItemSchema,
  generateReportSchema
} = require('../validators/postMortemValidator');

class PostMortemController {
  /**
   * Create post-mortem
   * POST /api/v1/incidents/:id/post-mortem
   */
  async createPostMortem(req, res) {
    try {
      const { error, value } = createPostMortemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || 'system';
      const postMortem = await postMortemService.createPostMortem(
        req.params.id,
        value,
        userId
      );

      res.status(201).json({
        success: true,
        data: postMortem.toJSON()
      });
    } catch (err) {
      if (err.message === 'Incident not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get post-mortem
   * GET /api/v1/post-mortems/:id
   */
  async getPostMortem(req, res) {
    try {
      const postMortem = await postMortemService.getPostMortem(req.params.id);
      
      if (!postMortem) {
        return res.status(404).json({ error: 'Not Found', message: 'Post-mortem not found' });
      }

      res.json({
        success: true,
        data: postMortem.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get post-mortem by incident
   * GET /api/v1/incidents/:id/post-mortem
   */
  async getPostMortemByIncident(req, res) {
    try {
      const postMortem = await postMortemService.getPostMortemByIncident(req.params.id);
      
      if (!postMortem) {
        return res.status(404).json({ error: 'Not Found', message: 'Post-mortem not found' });
      }

      res.json({
        success: true,
        data: postMortem.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Update post-mortem
   * PATCH /api/v1/post-mortems/:id
   */
  async updatePostMortem(req, res) {
    try {
      const { error, value } = updatePostMortemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const postMortem = await postMortemService.updatePostMortem(req.params.id, value);

      if (!postMortem) {
        return res.status(404).json({ error: 'Not Found', message: 'Post-mortem not found' });
      }

      res.json({
        success: true,
        data: postMortem.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Add lesson learned
   * POST /api/v1/post-mortems/:id/lessons
   */
  async addLessonLearned(req, res) {
    try {
      const { error, value } = addLessonSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const postMortem = await postMortemService.addLessonLearned(req.params.id, value);

      res.json({
        success: true,
        data: postMortem.toJSON()
      });
    } catch (err) {
      if (err.message === 'Post-mortem not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Add recommendation
   * POST /api/v1/post-mortems/:id/recommendations
   */
  async addRecommendation(req, res) {
    try {
      const { error, value } = addRecommendationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const postMortem = await postMortemService.addRecommendation(req.params.id, value);

      res.json({
        success: true,
        data: postMortem.toJSON()
      });
    } catch (err) {
      if (err.message === 'Post-mortem not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Add action item
   * POST /api/v1/post-mortems/:id/action-items
   */
  async addActionItem(req, res) {
    try {
      const { error, value } = addActionItemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const postMortem = await postMortemService.addActionItem(req.params.id, value);

      res.json({
        success: true,
        data: postMortem.toJSON()
      });
    } catch (err) {
      if (err.message === 'Post-mortem not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Generate executive summary
   * GET /api/v1/post-mortems/:id/executive-summary
   */
  async generateExecutiveSummary(req, res) {
    try {
      const summary = await postMortemService.generateExecutiveSummary(req.params.id);

      res.json({
        success: true,
        data: summary
      });
    } catch (err) {
      if (err.message === 'Post-mortem not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Generate full report
   * GET /api/v1/incidents/:id/report
   */
  async generateFullReport(req, res) {
    try {
      const postMortem = await postMortemService.getPostMortemByIncident(req.params.id);
      
      if (!postMortem) {
        return res.status(404).json({ error: 'Not Found', message: 'Post-mortem not found' });
      }

      const { error, value } = generateReportSchema.validate(req.query);
      const format = value?.format || 'json';
      
      const report = await postMortemService.generateFullReport(postMortem.id, format);

      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
      } else {
        res.setHeader('Content-Type', 'text/plain');
      }
      res.setHeader('Content-Disposition', `attachment; filename=incident-report-${req.params.id}.${format}`);
      res.send(report);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Analyze trends
   * GET /api/v1/post-mortems/trends
   */
  async analyzeTrends(req, res) {
    try {
      const trends = await postMortemService.analyzeTrends(req.query);

      res.json({
        success: true,
        data: trends
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}

module.exports = new PostMortemController();
