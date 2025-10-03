/**
 * Timeline Service
 * Incident timeline visualization and event tracking
 */

const { TimelineEvent } = require('../models');
const dataStore = require('./dataStore');

class TimelineService {
  /**
   * Create timeline event
   */
  async createEvent(data) {
    const event = new TimelineEvent(data);
    return await dataStore.createTimelineEvent(event);
  }

  /**
   * Get timeline for incident
   */
  async getTimeline(incidentId, filters = {}) {
    let events = await dataStore.listTimelineEventsByIncident(incidentId);

    // Apply filters
    if (filters.type) {
      events = events.filter(e => e.type === filters.type);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      events = events.filter(e => new Date(e.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      events = events.filter(e => new Date(e.timestamp) <= endDate);
    }

    if (filters.userId) {
      events = events.filter(e => e.user_id === filters.userId);
    }

    // Apply view mode transformation
    if (filters.viewMode === 'grouped') {
      return this.groupEventsByDate(events);
    } else if (filters.viewMode === 'graph') {
      return this.transformToGraphData(events);
    }

    return events;
  }

  /**
   * Add annotation to event
   */
  async addAnnotation(eventId, userId, text) {
    const event = await dataStore.getTimelineEvent(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    event.addAnnotation(userId, text);
    
    // In a real implementation, this would update the database
    return event;
  }

  /**
   * Group events by date
   */
  groupEventsByDate(events) {
    const grouped = {};

    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });

    return Object.entries(grouped).map(([date, events]) => ({
      date,
      count: events.length,
      events
    }));
  }

  /**
   * Transform to graph data format
   */
  transformToGraphData(events) {
    const nodes = events.map(event => ({
      id: event.id,
      label: event.title,
      type: event.type,
      timestamp: event.timestamp
    }));

    const edges = [];
    for (let i = 0; i < events.length - 1; i++) {
      edges.push({
        source: events[i].id,
        target: events[i + 1].id,
        type: 'temporal'
      });
    }

    return { nodes, edges };
  }

  /**
   * Export timeline data
   */
  async exportTimeline(incidentId, format = 'json') {
    const events = await this.getTimeline(incidentId);

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(events);
    } else if (format === 'markdown') {
      return this.convertToMarkdown(events);
    }

    throw new Error('Unsupported export format');
  }

  /**
   * Convert events to CSV format
   */
  convertToCSV(events) {
    const headers = ['ID', 'Type', 'Title', 'Description', 'Timestamp', 'User ID'];
    const rows = events.map(e => [
      e.id,
      e.type,
      e.title,
      e.description,
      e.timestamp,
      e.user_id || ''
    ]);

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  /**
   * Convert events to Markdown format
   */
  convertToMarkdown(events) {
    let markdown = '# Incident Timeline\n\n';

    events.forEach(event => {
      markdown += `## ${event.title}\n`;
      markdown += `- **Type**: ${event.type}\n`;
      markdown += `- **Timestamp**: ${event.timestamp}\n`;
      markdown += `- **Description**: ${event.description}\n`;
      if (event.user_id) {
        markdown += `- **User**: ${event.user_id}\n`;
      }
      markdown += '\n';
    });

    return markdown;
  }

  /**
   * Get timeline statistics
   */
  async getTimelineStats(incidentId) {
    const events = await dataStore.listTimelineEventsByIncident(incidentId);

    const typeDistribution = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const duration = lastEvent && firstEvent 
      ? new Date(lastEvent.timestamp) - new Date(firstEvent.timestamp)
      : 0;

    return {
      total_events: events.length,
      type_distribution: typeDistribution,
      first_event: firstEvent ? firstEvent.timestamp : null,
      last_event: lastEvent ? lastEvent.timestamp : null,
      duration_ms: duration,
      unique_users: new Set(events.map(e => e.user_id).filter(Boolean)).size
    };
  }

  /**
   * Search timeline events
   */
  async searchEvents(incidentId, query) {
    const events = await dataStore.listTimelineEventsByIncident(incidentId);
    const lowerQuery = query.toLowerCase();

    return events.filter(event => 
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.type.toLowerCase().includes(lowerQuery)
    );
  }
}

module.exports = new TimelineService();
