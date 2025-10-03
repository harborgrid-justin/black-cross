/**
 * SecurityEvent Repository
 * 
 * Handles data persistence for security events
 */

const SecurityEvent = require('../models/SecurityEvent');

class SecurityEventRepository {
  constructor() {
    this.events = new Map();
    this.eventsBySource = new Map();
    this.eventsByTimestamp = [];
  }

  /**
   * Create new security event
   */
  async create(eventData) {
    const event = new SecurityEvent(eventData);
    this.events.set(event.id, event);
    
    // Index by source
    if (!this.eventsBySource.has(event.source)) {
      this.eventsBySource.set(event.source, []);
    }
    this.eventsBySource.get(event.source).push(event.id);
    
    // Index by timestamp
    this.eventsByTimestamp.push({ id: event.id, timestamp: event.timestamp });
    this.eventsByTimestamp.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return event;
  }

  /**
   * Find event by ID
   */
  async findById(id) {
    return this.events.get(id) || null;
  }

  /**
   * Find events with filters
   */
  async find(filters = {}) {
    let events = Array.from(this.events.values());

    if (filters.source) {
      events = events.filter(e => e.source === filters.source);
    }

    if (filters.severity) {
      events = events.filter(e => e.severity === filters.severity);
    }

    if (filters.event_type) {
      events = events.filter(e => e.event_type === filters.event_type);
    }

    if (filters.source_ip) {
      events = events.filter(e => e.source_ip === filters.source_ip);
    }

    if (filters.from_date) {
      events = events.filter(e => new Date(e.timestamp) >= new Date(filters.from_date));
    }

    if (filters.to_date) {
      events = events.filter(e => new Date(e.timestamp) <= new Date(filters.to_date));
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedEvents = events.slice(startIndex, endIndex);

    return {
      data: paginatedEvents,
      pagination: {
        page,
        limit,
        total: events.length,
        pages: Math.ceil(events.length / limit)
      }
    };
  }

  /**
   * Find events by source
   */
  async findBySource(source, limit = 100) {
    const eventIds = this.eventsBySource.get(source) || [];
    const events = eventIds
      .slice(0, limit)
      .map(id => this.events.get(id))
      .filter(e => e !== undefined);
    
    return events;
  }

  /**
   * Find events in time range
   */
  async findByTimeRange(startTime, endTime, filters = {}) {
    let events = this.eventsByTimestamp
      .filter(item => {
        const timestamp = new Date(item.timestamp);
        return timestamp >= new Date(startTime) && timestamp <= new Date(endTime);
      })
      .map(item => this.events.get(item.id))
      .filter(e => e !== undefined);

    // Apply additional filters
    if (filters.severity) {
      events = events.filter(e => e.severity === filters.severity);
    }

    if (filters.source) {
      events = events.filter(e => e.source === filters.source);
    }

    return events;
  }

  /**
   * Update event
   */
  async update(id, updates) {
    const event = this.events.get(id);
    if (!event) return null;

    Object.assign(event, updates);
    this.events.set(id, event);
    return event;
  }

  /**
   * Delete event
   */
  async delete(id) {
    const event = this.events.get(id);
    if (!event) return false;

    this.events.delete(id);
    
    // Remove from source index
    const sourceEvents = this.eventsBySource.get(event.source);
    if (sourceEvents) {
      const index = sourceEvents.indexOf(id);
      if (index > -1) {
        sourceEvents.splice(index, 1);
      }
    }

    // Remove from timestamp index
    const timestampIndex = this.eventsByTimestamp.findIndex(item => item.id === id);
    if (timestampIndex > -1) {
      this.eventsByTimestamp.splice(timestampIndex, 1);
    }

    return true;
  }

  /**
   * Get event count by severity
   */
  async getCountBySeverity() {
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    for (const event of this.events.values()) {
      counts[event.severity]++;
    }

    return counts;
  }

  /**
   * Clear all events (for testing)
   */
  async clear() {
    this.events.clear();
    this.eventsBySource.clear();
    this.eventsByTimestamp = [];
  }
}

module.exports = new SecurityEventRepository();
