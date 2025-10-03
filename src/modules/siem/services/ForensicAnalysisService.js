/**
 * Forensic Analysis Service
 * 
 * Handles forensic investigations and analysis
 */

const { forensicSessionRepository, securityEventRepository, alertRepository } = require('../repositories');

class ForensicAnalysisService {
  /**
   * Create forensic session
   */
  async createSession(sessionData) {
    return await forensicSessionRepository.create(sessionData);
  }

  /**
   * Get forensic session
   */
  async getSession(id) {
    return await forensicSessionRepository.findById(id);
  }

  /**
   * Get all sessions
   */
  async getSessions(filters = {}) {
    return await forensicSessionRepository.findAll(filters);
  }

  /**
   * Get sessions by investigator
   */
  async getSessionsByInvestigator(investigator) {
    return await forensicSessionRepository.findByInvestigator(investigator);
  }

  /**
   * Search events for forensic analysis
   */
  async searchEvents(sessionId, query) {
    const session = await forensicSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Forensic session not found');
    }

    // Parse query and search events
    const results = await this.executeForensicQuery(query);

    // Add query to session
    session.addQuery(query, results);
    await forensicSessionRepository.update(sessionId, session);

    return results;
  }

  /**
   * Execute forensic query
   */
  async executeForensicQuery(query) {
    const filters = this.parseQuery(query);
    const events = await securityEventRepository.find(filters);

    return events.data.map(e => e.toJSON());
  }

  /**
   * Parse forensic query
   */
  parseQuery(query) {
    const filters = {};

    // Simple query parser
    const terms = query.toLowerCase().split(/\s+and\s+/);

    terms.forEach(term => {
      if (term.includes('source:')) {
        filters.source = term.split(':')[1].trim();
      } else if (term.includes('severity:')) {
        filters.severity = term.split(':')[1].trim();
      } else if (term.includes('ip:')) {
        filters.source_ip = term.split(':')[1].trim();
      } else if (term.includes('type:')) {
        filters.event_type = term.split(':')[1].trim();
      }
    });

    return filters;
  }

  /**
   * Add finding to session
   */
  async addFinding(sessionId, finding) {
    const session = await forensicSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Forensic session not found');
    }

    session.addFinding(finding);
    return await forensicSessionRepository.update(sessionId, session);
  }

  /**
   * Add evidence to session
   */
  async addEvidence(sessionId, evidence, collector) {
    const session = await forensicSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Forensic session not found');
    }

    session.addEvidence(evidence, collector);
    return await forensicSessionRepository.update(sessionId, session);
  }

  /**
   * Build timeline for session
   */
  async buildTimeline(sessionId, eventIds) {
    const session = await forensicSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Forensic session not found');
    }

    // Get events and build timeline
    const events = [];
    for (const eventId of eventIds) {
      const event = await securityEventRepository.findById(eventId);
      if (event) {
        events.push(event);
      }
    }

    // Sort by timestamp
    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Add to timeline
    events.forEach(event => {
      session.addTimelineEvent({
        event_id: event.id,
        timestamp: event.timestamp,
        event_type: event.event_type,
        source: event.source,
        severity: event.severity,
        description: `${event.action} from ${event.source_ip || 'unknown'}`
      });
    });

    return await forensicSessionRepository.update(sessionId, session);
  }

  /**
   * Reconstruct event sequence
   */
  async reconstructSequence(sessionId, filters) {
    const session = await forensicSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Forensic session not found');
    }

    // Get events within time range
    const events = await securityEventRepository.find(filters);

    // Analyze patterns
    const sequence = {
      total_events: events.data.length,
      time_span: this.calculateTimeSpan(events.data),
      patterns: this.identifyPatterns(events.data),
      suspicious_activities: this.identifySuspiciousActivities(events.data),
      involved_ips: this.extractInvolvedIPs(events.data),
      event_chain: events.data.map(e => ({
        timestamp: e.timestamp,
        event_type: e.event_type,
        source: e.source,
        source_ip: e.source_ip,
        destination_ip: e.destination_ip,
        severity: e.severity
      }))
    };

    return sequence;
  }

  /**
   * Calculate time span of events
   */
  calculateTimeSpan(events) {
    if (events.length === 0) return { duration: 0, start: null, end: null };

    const timestamps = events.map(e => new Date(e.timestamp));
    const start = new Date(Math.min(...timestamps));
    const end = new Date(Math.max(...timestamps));
    const duration = (end - start) / 1000; // seconds

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      duration_seconds: duration
    };
  }

  /**
   * Identify patterns in events
   */
  identifyPatterns(events) {
    const patterns = [];

    // Identify repeated event types
    const eventTypes = {};
    events.forEach(e => {
      eventTypes[e.event_type] = (eventTypes[e.event_type] || 0) + 1;
    });

    Object.entries(eventTypes).forEach(([type, count]) => {
      if (count > 3) {
        patterns.push({
          type: 'repeated_event',
          event_type: type,
          count: count
        });
      }
    });

    // Identify sequential events from same source
    const sourceSequences = {};
    events.forEach(e => {
      if (!sourceSequences[e.source_ip]) {
        sourceSequences[e.source_ip] = [];
      }
      sourceSequences[e.source_ip].push(e);
    });

    Object.entries(sourceSequences).forEach(([ip, ipEvents]) => {
      if (ipEvents.length > 5) {
        patterns.push({
          type: 'sequential_activity',
          source_ip: ip,
          event_count: ipEvents.length
        });
      }
    });

    return patterns;
  }

  /**
   * Identify suspicious activities
   */
  identifySuspiciousActivities(events) {
    const suspicious = [];

    // High severity events
    const criticalEvents = events.filter(e => e.severity === 'critical' || e.severity === 'high');
    if (criticalEvents.length > 0) {
      suspicious.push({
        type: 'high_severity_events',
        count: criticalEvents.length,
        events: criticalEvents.map(e => e.id)
      });
    }

    // Failed authentication attempts
    const failedAuth = events.filter(e => 
      e.event_type.includes('auth') && e.outcome === 'failure'
    );
    if (failedAuth.length > 3) {
      suspicious.push({
        type: 'multiple_failed_authentications',
        count: failedAuth.length,
        events: failedAuth.map(e => e.id)
      });
    }

    return suspicious;
  }

  /**
   * Extract involved IP addresses
   */
  extractInvolvedIPs(events) {
    const ips = new Set();
    
    events.forEach(e => {
      if (e.source_ip) ips.add(e.source_ip);
      if (e.destination_ip) ips.add(e.destination_ip);
    });

    return Array.from(ips);
  }

  /**
   * Complete forensic session
   */
  async completeSession(sessionId) {
    const session = await forensicSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Forensic session not found');
    }

    session.complete();
    return await forensicSessionRepository.update(sessionId, session);
  }

  /**
   * Export forensic report
   */
  async exportReport(sessionId, format = 'json') {
    const session = await forensicSessionRepository.findById(sessionId);
    if (!session) {
      throw new Error('Forensic session not found');
    }

    const report = {
      session: session.toJSON(),
      summary: {
        total_queries: session.queries.length,
        total_findings: session.findings.length,
        total_evidence: session.evidence.length,
        timeline_events: session.timeline.length
      },
      generated_at: new Date()
    };

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    // Add other formats as needed
    return report;
  }
}

module.exports = new ForensicAnalysisService();
