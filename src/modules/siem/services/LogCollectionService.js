/**
 * Log Collection Service
 * 
 * Handles log collection and ingestion from various sources
 */

const { securityEventRepository, logSourceRepository } = require('../repositories');
const SecurityEvent = require('../models/SecurityEvent');

class LogCollectionService {
  /**
   * Ingest log event
   */
  async ingestLog(logData) {
    // Validate log data
    if (!logData.source) {
      throw new Error('Log source is required');
    }

    // Find or create log source
    let logSource = await this.findOrCreateSource(logData.source, logData.source_type);

    // Parse and normalize the log
    const normalizedEvent = await this.normalizeLog(logData, logSource);

    // Create security event
    const event = await securityEventRepository.create(normalizedEvent);

    // Update source statistics
    logSource.recordEvent();
    await logSourceRepository.update(logSource.id, logSource);

    return event;
  }

  /**
   * Batch ingest logs
   */
  async ingestBatch(logs) {
    const results = {
      success: [],
      failed: []
    };

    for (const log of logs) {
      try {
        const event = await this.ingestLog(log);
        results.success.push(event);
      } catch (error) {
        results.failed.push({
          log,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Find or create log source
   */
  async findOrCreateSource(sourceName, sourceType = 'generic') {
    const sources = await logSourceRepository.findAll();
    let source = sources.find(s => s.name === sourceName);

    if (!source) {
      source = await logSourceRepository.create({
        name: sourceName,
        source_type: sourceType,
        status: 'active'
      });
    }

    return source;
  }

  /**
   * Normalize log data
   */
  async normalizeLog(logData, logSource) {
    const normalized = {
      source: logData.source,
      source_type: logSource.source_type,
      timestamp: logData.timestamp || new Date(),
      raw_log: JSON.stringify(logData),
      normalized_fields: {}
    };

    // Parse based on log format
    switch (logSource.source_type) {
      case 'syslog':
        return this.parseSyslog(logData, normalized);
      case 'cef':
        return this.parseCEF(logData, normalized);
      case 'json':
        return this.parseJSON(logData, normalized);
      default:
        return this.parseGeneric(logData, normalized);
    }
  }

  /**
   * Parse syslog format
   */
  parseSyslog(logData, normalized) {
    // Simple syslog parsing
    normalized.event_type = logData.event_type || 'system_event';
    
    // If severity is already in standard format, use it directly
    if (['critical', 'high', 'medium', 'low', 'info'].includes(logData.severity)) {
      normalized.severity = logData.severity;
    } else {
      normalized.severity = this.mapSyslogSeverity(logData.severity || logData.priority);
    }
    
    normalized.source_ip = logData.host || logData.source_ip;
    normalized.destination_ip = logData.destination_ip;
    normalized.user = logData.user;
    normalized.action = logData.action || logData.message;
    normalized.outcome = logData.outcome;
    
    return normalized;
  }

  /**
   * Parse CEF format
   */
  parseCEF(logData, normalized) {
    // CEF (Common Event Format) parsing
    normalized.event_type = logData.name || logData.event_type;
    normalized.severity = this.mapCEFSeverity(logData.severity);
    normalized.source_ip = logData.src || logData.source_ip;
    normalized.destination_ip = logData.dst || logData.destination_ip;
    normalized.source_port = logData.spt || logData.source_port;
    normalized.destination_port = logData.dpt || logData.destination_port;
    normalized.protocol = logData.proto || logData.protocol;
    normalized.user = logData.suser || logData.duser || logData.user;
    normalized.action = logData.act || logData.action;
    normalized.outcome = logData.outcome;

    return normalized;
  }

  /**
   * Parse JSON format
   */
  parseJSON(logData, normalized) {
    // Direct JSON mapping
    Object.assign(normalized, {
      event_type: logData.event_type || 'json_event',
      severity: logData.severity || 'info',
      source_ip: logData.source_ip,
      destination_ip: logData.destination_ip,
      source_port: logData.source_port,
      destination_port: logData.destination_port,
      protocol: logData.protocol,
      user: logData.user,
      action: logData.action,
      outcome: logData.outcome,
      normalized_fields: logData.fields || {}
    });

    return normalized;
  }

  /**
   * Parse generic format
   */
  parseGeneric(logData, normalized) {
    normalized.event_type = 'generic_event';
    normalized.severity = logData.severity || 'info';
    normalized.normalized_fields = logData;

    return normalized;
  }

  /**
   * Map syslog severity to standard severity
   */
  mapSyslogSeverity(priority) {
    if (!priority) return 'info';
    
    const numPriority = typeof priority === 'string' ? parseInt(priority) : priority;
    
    if (numPriority <= 2) return 'critical';
    if (numPriority <= 3) return 'high';
    if (numPriority <= 4) return 'medium';
    if (numPriority <= 6) return 'low';
    return 'info';
  }

  /**
   * Map CEF severity to standard severity
   */
  mapCEFSeverity(severity) {
    if (!severity) return 'info';
    
    const numSeverity = typeof severity === 'string' ? parseInt(severity) : severity;
    
    if (numSeverity >= 8) return 'critical';
    if (numSeverity >= 6) return 'high';
    if (numSeverity >= 4) return 'medium';
    if (numSeverity >= 2) return 'low';
    return 'info';
  }

  /**
   * Get ingestion statistics
   */
  async getStatistics(timeRange = '24h') {
    const sources = await logSourceRepository.findAll();
    
    return {
      total_sources: sources.length,
      active_sources: sources.filter(s => s.status === 'active').length,
      total_events: sources.reduce((sum, s) => sum + s.event_count, 0),
      total_errors: sources.reduce((sum, s) => sum + s.error_count, 0),
      sources: sources.map(s => ({
        name: s.name,
        type: s.source_type,
        status: s.status,
        event_count: s.event_count,
        error_count: s.error_count,
        last_event: s.last_event_time
      }))
    };
  }
}

module.exports = new LogCollectionService();
