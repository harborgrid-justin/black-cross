/**
 * Timeline Controller
 * Handle HTTP requests for timeline operations
 */

const { timelineService } = require('../services');

class TimelineController {
  /**
   * Get incident timeline
   * GET /api/v1/incidents/:id/timeline
   */
  async getTimeline(req, res) {
    try {
      const events = await timelineService.getTimeline(req.params.id, req.query);

      res.json({
        success: true,
        data: events,
        count: Array.isArray(events) ? events.length : events.length || 0
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Create timeline event
   * POST /api/v1/incidents/:id/events
   */
  async createEvent(req, res) {
    try {
      const event = await timelineService.createEvent({
        incident_id: req.params.id,
        ...req.body,
        user_id: req.user?.id || null
      });

      res.status(201).json({
        success: true,
        data: event.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Add annotation to event
   * POST /api/v1/timeline-events/:id/annotations
   */
  async addAnnotation(req, res) {
    try {
      const userId = req.user?.id || null;
      const event = await timelineService.addAnnotation(
        req.params.id,
        userId,
        req.body.text
      );

      res.json({
        success: true,
        data: event.toJSON()
      });
    } catch (err) {
      if (err.message === 'Event not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Export timeline
   * GET /api/v1/incidents/:id/timeline/export
   */
  async exportTimeline(req, res) {
    try {
      const format = req.query.format || 'json';
      const data = await timelineService.exportTimeline(req.params.id, format);

      res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename=timeline-${req.params.id}.${format}`);
      res.send(data);
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get timeline statistics
   * GET /api/v1/incidents/:id/timeline/stats
   */
  async getTimelineStats(req, res) {
    try {
      const stats = await timelineService.getTimelineStats(req.params.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Search timeline events
   * GET /api/v1/incidents/:id/timeline/search
   */
  async searchEvents(req, res) {
    try {
      const query = req.query.q || '';
      const events = await timelineService.searchEvents(req.params.id, query);

      res.json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}

module.exports = new TimelineController();
