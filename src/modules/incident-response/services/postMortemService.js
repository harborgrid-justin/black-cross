/**
 * Post-Mortem Service
 * Post-incident analysis and reporting
 */

const { PostMortem } = require('../models');
const dataStore = require('./dataStore');
const incidentService = require('./incidentService');
const timelineService = require('./timelineService');

class PostMortemService {
  /**
   * Create post-mortem analysis
   */
  async createPostMortem(incidentId, data, userId) {
    const incident = await incidentService.getIncident(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    // Auto-populate metrics from incident data
    const metrics = await this.calculateMetrics(incident);
    const timelineSummary = await this.buildTimelineSummary(incident);

    const postMortem = new PostMortem({
      ...data,
      incident_id: incidentId,
      created_by: userId,
      metrics,
      timeline_summary: timelineSummary
    });

    return await dataStore.createPostMortem(postMortem);
  }

  /**
   * Get post-mortem by ID
   */
  async getPostMortem(id) {
    return await dataStore.getPostMortem(id);
  }

  /**
   * Get post-mortem by incident
   */
  async getPostMortemByIncident(incidentId) {
    return await dataStore.getPostMortemByIncident(incidentId);
  }

  /**
   * Update post-mortem
   */
  async updatePostMortem(id, updates) {
    return await dataStore.updatePostMortem(id, updates);
  }

  /**
   * Add lesson learned
   */
  async addLessonLearned(postMortemId, lesson) {
    const postMortem = await dataStore.getPostMortem(postMortemId);
    if (!postMortem) {
      throw new Error('Post-mortem not found');
    }

    postMortem.addLessonLearned(lesson);
    return await dataStore.updatePostMortem(postMortemId, postMortem);
  }

  /**
   * Add improvement recommendation
   */
  async addRecommendation(postMortemId, recommendation) {
    const postMortem = await dataStore.getPostMortem(postMortemId);
    if (!postMortem) {
      throw new Error('Post-mortem not found');
    }

    postMortem.addRecommendation(recommendation);
    return await dataStore.updatePostMortem(postMortemId, postMortem);
  }

  /**
   * Add action item
   */
  async addActionItem(postMortemId, item) {
    const postMortem = await dataStore.getPostMortem(postMortemId);
    if (!postMortem) {
      throw new Error('Post-mortem not found');
    }

    postMortem.addActionItem(item);
    return await dataStore.updatePostMortem(postMortemId, postMortem);
  }

  /**
   * Calculate incident metrics
   */
  async calculateMetrics(incident) {
    const timeline = await timelineService.getTimeline(incident.id);
    
    const createdEvent = timeline.find(e => e.type === 'incident_created');
    const detectedAt = createdEvent ? new Date(createdEvent.timestamp) : new Date(incident.created_at);
    
    const respondedAt = timeline.find(e => e.type === 'status_changed')?.timestamp || null;
    const containedAt = timeline.find(e => e.type === 'workflow_executed')?.timestamp || null;
    const resolvedAt = incident.resolved_at ? new Date(incident.resolved_at) : null;

    const timeToDetect = 0; // Would calculate from actual detection vs occurrence
    const timeToRespond = respondedAt ? new Date(respondedAt) - detectedAt : 0;
    const timeToContain = containedAt ? new Date(containedAt) - detectedAt : 0;
    const timeToResolve = resolvedAt ? resolvedAt - detectedAt : 0;

    return {
      time_to_detect: timeToDetect,
      time_to_respond: timeToRespond,
      time_to_contain: timeToContain,
      time_to_resolve: timeToResolve,
      total_duration: timeToResolve
    };
  }

  /**
   * Build timeline summary
   */
  async buildTimelineSummary(incident) {
    const timeline = await timelineService.getTimeline(incident.id);
    
    return {
      detected_at: incident.created_at,
      responded_at: timeline.find(e => e.type === 'status_changed')?.timestamp || null,
      contained_at: timeline.find(e => e.type === 'workflow_executed')?.timestamp || null,
      resolved_at: incident.resolved_at
    };
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(postMortemId) {
    const postMortem = await dataStore.getPostMortem(postMortemId);
    if (!postMortem) {
      throw new Error('Post-mortem not found');
    }

    const incident = await incidentService.getIncident(postMortem.incident_id);

    return {
      incident_id: incident.id,
      incident_title: incident.title,
      severity: incident.severity,
      priority: incident.priority,
      summary: postMortem.summary,
      root_cause: postMortem.root_cause,
      impact: {
        affected_users: postMortem.impact_analysis.affected_users,
        affected_systems: postMortem.impact_analysis.affected_systems.length,
        business_impact: postMortem.impact_analysis.business_impact,
        financial_impact: postMortem.impact_analysis.financial_impact
      },
      metrics: {
        time_to_resolve_hours: Math.round(postMortem.metrics.time_to_resolve / 3600000),
        overall_effectiveness: postMortem.response_effectiveness.overall_score
      },
      key_lessons: postMortem.lessons_learned.slice(0, 3),
      top_recommendations: postMortem.improvement_recommendations.slice(0, 3),
      action_items_count: postMortem.action_items.length
    };
  }

  /**
   * Generate full report
   */
  async generateFullReport(postMortemId, format = 'json') {
    const postMortem = await dataStore.getPostMortem(postMortemId);
    if (!postMortem) {
      throw new Error('Post-mortem not found');
    }

    const incident = await incidentService.getIncident(postMortem.incident_id);
    const timeline = await timelineService.getTimeline(postMortem.incident_id);

    const report = {
      metadata: {
        report_generated: new Date(),
        incident_id: incident.id,
        incident_title: incident.title
      },
      incident_overview: {
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        priority: incident.priority,
        status: incident.status,
        category: incident.category
      },
      post_mortem: postMortem.toJSON(),
      timeline: timeline,
      executive_summary: await this.generateExecutiveSummary(postMortemId)
    };

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else if (format === 'markdown') {
      return this.convertReportToMarkdown(report);
    } else if (format === 'html') {
      return this.convertReportToHTML(report);
    }

    throw new Error('Unsupported report format');
  }

  /**
   * Convert report to Markdown
   */
  convertReportToMarkdown(report) {
    let md = `# Post-Incident Report: ${report.incident_overview.title}\n\n`;
    
    md += `## Executive Summary\n\n`;
    md += `${report.post_mortem.summary}\n\n`;
    
    md += `## Incident Overview\n\n`;
    md += `- **Severity**: ${report.incident_overview.severity}\n`;
    md += `- **Priority**: ${report.incident_overview.priority}\n`;
    md += `- **Category**: ${report.incident_overview.category}\n`;
    md += `- **Status**: ${report.incident_overview.status}\n\n`;
    
    md += `## Root Cause\n\n`;
    md += `${report.post_mortem.root_cause}\n\n`;
    
    md += `## Impact Analysis\n\n`;
    const impact = report.post_mortem.impact_analysis;
    md += `- **Affected Users**: ${impact.affected_users}\n`;
    md += `- **Affected Systems**: ${impact.affected_systems.join(', ')}\n`;
    md += `- **Business Impact**: ${impact.business_impact}\n`;
    md += `- **Financial Impact**: $${impact.financial_impact}\n\n`;
    
    md += `## Metrics\n\n`;
    const metrics = report.post_mortem.metrics;
    md += `- **Time to Detect**: ${Math.round(metrics.time_to_detect / 60000)} minutes\n`;
    md += `- **Time to Respond**: ${Math.round(metrics.time_to_respond / 60000)} minutes\n`;
    md += `- **Time to Resolve**: ${Math.round(metrics.time_to_resolve / 60000)} minutes\n\n`;
    
    md += `## Lessons Learned\n\n`;
    report.post_mortem.lessons_learned.forEach((lesson, i) => {
      md += `${i + 1}. **${lesson.category}**: ${lesson.description}\n`;
    });
    md += `\n`;
    
    md += `## Recommendations\n\n`;
    report.post_mortem.improvement_recommendations.forEach((rec, i) => {
      md += `${i + 1}. **${rec.title}** (Priority: ${rec.priority})\n`;
      md += `   ${rec.description}\n\n`;
    });
    
    md += `## Action Items\n\n`;
    report.post_mortem.action_items.forEach((item, i) => {
      md += `- [ ] ${item.title} (Assigned to: ${item.assigned_to}, Due: ${item.due_date})\n`;
    });
    
    return md;
  }

  /**
   * Convert report to HTML
   */
  convertReportToHTML(report) {
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Post-Incident Report: ${report.incident_overview.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; }
    h2 { color: #34495e; margin-top: 30px; }
    .metric { display: inline-block; margin: 10px 20px; }
    .label { font-weight: bold; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Post-Incident Report: ${report.incident_overview.title}</h1>
  
  <h2>Executive Summary</h2>
  <p>${report.post_mortem.summary}</p>
  
  <h2>Root Cause</h2>
  <p>${report.post_mortem.root_cause}</p>
  
  <h2>Impact Analysis</h2>
  <div class="metric"><span class="label">Affected Users:</span> ${report.post_mortem.impact_analysis.affected_users}</div>
  <div class="metric"><span class="label">Financial Impact:</span> $${report.post_mortem.impact_analysis.financial_impact}</div>
  
  <h2>Response Metrics</h2>
  <div class="metric"><span class="label">Time to Resolve:</span> ${Math.round(report.post_mortem.metrics.time_to_resolve / 60000)} minutes</div>
  <div class="metric"><span class="label">Effectiveness Score:</span> ${report.post_mortem.response_effectiveness.overall_score}/100</div>
</body>
</html>`;
    
    return html;
  }

  /**
   * Analyze trends across multiple incidents
   */
  async analyzeTrends(filters = {}) {
    // In production, query database for incidents matching filters
    const incidents = await incidentService.listIncidents(filters);
    
    const trends = {
      total_incidents: incidents.total,
      avg_resolution_time: 0,
      common_root_causes: {},
      recurring_issues: [],
      improvement_areas: []
    };

    // Calculate average resolution time
    const resolved = incidents.incidents.filter(i => i.resolved_at);
    if (resolved.length > 0) {
      const totalTime = resolved.reduce((sum, i) => 
        sum + (new Date(i.resolved_at) - new Date(i.created_at)), 0
      );
      trends.avg_resolution_time = totalTime / resolved.length;
    }

    return trends;
  }
}

module.exports = new PostMortemService();
