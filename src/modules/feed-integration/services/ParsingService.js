/**
 * Parsing Service
 *
 * Business logic for automated feed parsing and normalization
 */

const axios = require('axios');

class ParsingService {
  /**
   * Parse feed from source
   */
  async parseFeed(feedSource) {
    // Fetch feed data
    const rawData = await this.fetchFeedData(feedSource);

    // Detect format if not specified
    const format = feedSource.format || this.detectFormat(rawData);

    // Parse based on format
    let parsedData;
    switch (format.toLowerCase()) {
      case 'json':
        parsedData = this.parseJSON(rawData);
        break;
      case 'csv':
        parsedData = this.parseCSV(rawData);
        break;
      case 'xml':
        parsedData = this.parseXML(rawData);
        break;
      case 'stix':
        parsedData = this.parseSTIX(rawData);
        break;
      case 'taxii':
        parsedData = this.parseTAXII(rawData);
        break;
      case 'misp':
        parsedData = this.parseMISP(rawData);
        break;
      case 'openioc':
        parsedData = this.parseOpenIOC(rawData);
        break;
      case 'custom':
      default:
        parsedData = this.parseCustom(rawData, feedSource);
    }

    // Normalize the data
    const normalized = this.normalize(parsedData, feedSource);

    return {
      format,
      items: normalized,
      raw_data: rawData
    };
  }

  /**
   * Fetch feed data from source
   */
  async fetchFeedData(feedSource) {
    const config = {
      method: 'GET',
      url: feedSource.url,
      timeout: 30000
    };

    // Add authentication if configured
    if (feedSource.authentication) {
      switch (feedSource.authentication.type) {
        case 'api_key':
          config.headers = {
            Authorization: `Bearer ${feedSource.authentication.credentials.api_key}`
          };
          break;
        case 'basic':
          config.auth = {
            username: feedSource.authentication.credentials.username,
            password: feedSource.authentication.credentials.password
          };
          break;
      }
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch feed: ${error.message}`);
    }
  }

  /**
   * Detect feed format
   */
  detectFormat(data) {
    if (typeof data === 'string') {
      if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
        return 'json';
      } if (data.includes('<?xml')) {
        return 'xml';
      }
      return 'csv';
    } if (typeof data === 'object') {
      return 'json';
    }
    return 'custom';
  }

  /**
   * Parse JSON format
   */
  parseJSON(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // Handle different JSON structures
    if (Array.isArray(data)) {
      return data;
    } if (data.items || data.indicators || data.threats) {
      return data.items || data.indicators || data.threats;
    } if (data.data) {
      return Array.isArray(data.data) ? data.data : [data.data];
    }

    return [data];
  }

  /**
   * Parse CSV format
   */
  parseCSV(data) {
    const lines = data.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const item = {};
      headers.forEach((header, index) => {
        item[header] = values[index];
      });
      items.push(item);
    }

    return items;
  }

  /**
   * Parse XML format
   */
  parseXML(data) {
    // Simplified XML parsing - in production use a proper XML parser
    const items = [];
    const itemMatches = data.match(/<item[^>]*>(.*?)<\/item>/gs);

    if (itemMatches) {
      itemMatches.forEach((match) => {
        const item = {};
        const fieldMatches = match.match(/<(\w+)>([^<]+)<\/\1>/g);

        if (fieldMatches) {
          fieldMatches.forEach((field) => {
            const [, key, value] = field.match(/<(\w+)>([^<]+)<\/\1>/);
            item[key] = value;
          });
        }

        items.push(item);
      });
    }

    return items;
  }

  /**
   * Parse STIX format
   */
  parseSTIX(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    // Handle STIX 2.x format
    if (data.objects) {
      return data.objects.map((obj) => ({
        external_id: obj.id,
        type: obj.type,
        value: obj.pattern || obj.name,
        title: obj.name,
        description: obj.description,
        created: obj.created,
        modified: obj.modified,
        labels: obj.labels,
        confidence: obj.confidence
      }));
    }

    return [];
  }

  /**
   * Parse TAXII format
   */
  parseTAXII(data) {
    // TAXII typically contains STIX objects
    return this.parseSTIX(data);
  }

  /**
   * Parse MISP format
   */
  parseMISP(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    const items = [];

    if (data.Event) {
      const event = data.Event;
      if (event.Attribute) {
        event.Attribute.forEach((attr) => {
          items.push({
            external_id: attr.uuid,
            type: 'indicator',
            indicator_type: attr.type,
            value: attr.value,
            title: attr.comment || attr.type,
            category: attr.category,
            to_ids: attr.to_ids
          });
        });
      }
    }

    return items;
  }

  /**
   * Parse OpenIOC format
   */
  parseOpenIOC(data) {
    // Simplified OpenIOC parsing
    const items = [];
    const indicatorMatches = data.match(/<IndicatorItem[^>]*>(.*?)<\/IndicatorItem>/gs);

    if (indicatorMatches) {
      indicatorMatches.forEach((match) => {
        const contextMatch = match.match(/<Context[^>]*search="([^"]+)"/);
        const contentMatch = match.match(/<Content[^>]*>([^<]+)<\/Content>/);

        if (contextMatch && contentMatch) {
          items.push({
            type: 'indicator',
            indicator_type: contextMatch[1],
            value: contentMatch[1]
          });
        }
      });
    }

    return items;
  }

  /**
   * Parse custom format
   */
  parseCustom(data) {
    // For custom formats, try to extract basic structure
    if (typeof data === 'object') {
      return this.parseJSON(data);
    }

    return [];
  }

  /**
   * Normalize parsed data
   */
  normalize(items, feedSource) {
    return items.map((item) => this.normalizeItem(item, feedSource));
  }

  /**
   * Normalize a single item
   */
  normalizeItem(item, feedSource) {
    const normalized = {
      feed_source_id: feedSource.id,
      external_id: item.id || item.uuid || item.external_id || null,
      type: this.normalizeType(item.type || 'indicator'),
      indicator_type: this.normalizeIndicatorType(item.indicator_type || item.type),
      value: item.value || item.indicator || item.pattern || '',
      title: item.title || item.name || item.value || '',
      description: item.description || item.comment || '',
      severity: this.normalizeSeverity(item.severity || item.threat_level || 'medium'),
      confidence: this.normalizeConfidence(item.confidence || item.score || 50),
      tags: this.normalizeTags(item.tags || item.labels || []),
      categories: this.normalizeCategories(item.categories || item.category || []),
      tlp: this.normalizeTLP(item.tlp || 'amber'),
      raw_data: item
    };

    return normalized;
  }

  /**
   * Normalize type field
   */
  normalizeType(type) {
    const typeMap = {
      indicator: 'indicator',
      'threat-actor': 'actor',
      malware: 'malware',
      campaign: 'campaign',
      'attack-pattern': 'threat'
    };
    return typeMap[type.toLowerCase()] || 'indicator';
  }

  /**
   * Normalize indicator type
   */
  normalizeIndicatorType(type) {
    if (!type) return null;

    const typeMap = {
      ipv4: 'ip',
      'ipv4-addr': 'ip',
      domain: 'domain',
      'domain-name': 'domain',
      url: 'url',
      md5: 'hash',
      sha1: 'hash',
      sha256: 'hash',
      email: 'email',
      'email-addr': 'email'
    };

    return typeMap[type.toLowerCase()] || type.toLowerCase();
  }

  /**
   * Normalize severity
   */
  normalizeSeverity(severity) {
    const severityMap = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
      info: 'info',
      informational: 'info'
    };

    if (typeof severity === 'number') {
      if (severity >= 9) return 'critical';
      if (severity >= 7) return 'high';
      if (severity >= 5) return 'medium';
      if (severity >= 3) return 'low';
      return 'info';
    }

    return severityMap[severity.toLowerCase()] || 'medium';
  }

  /**
   * Normalize confidence score
   */
  normalizeConfidence(confidence) {
    if (typeof confidence === 'string') {
      const confMap = {
        high: 85,
        medium: 50,
        low: 25
      };
      return confMap[confidence.toLowerCase()] || 50;
    }

    // Ensure confidence is between 0-100
    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Normalize tags
   */
  normalizeTags(tags) {
    if (typeof tags === 'string') {
      return tags.split(',').map((t) => t.trim());
    }
    return Array.isArray(tags) ? tags : [];
  }

  /**
   * Normalize categories
   */
  normalizeCategories(categories) {
    if (typeof categories === 'string') {
      return [categories];
    }
    return Array.isArray(categories) ? categories : [];
  }

  /**
   * Normalize TLP (Traffic Light Protocol)
   */
  normalizeTLP(tlp) {
    const tlpMap = {
      white: 'white',
      green: 'green',
      amber: 'amber',
      red: 'red',
      'tlp:white': 'white',
      'tlp:green': 'green',
      'tlp:amber': 'amber',
      'tlp:red': 'red'
    };
    return tlpMap[tlp.toLowerCase()] || 'amber';
  }

  /**
   * Get supported schemas
   */
  getSupportedSchemas() {
    return {
      formats: ['json', 'csv', 'xml', 'stix', 'taxii', 'misp', 'openioc', 'custom'],
      json_schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          value: { type: 'string' },
          severity: { type: 'string' },
          confidence: { type: 'number' }
        }
      },
      csv_schema: {
        required_columns: ['value', 'type'],
        optional_columns: ['severity', 'confidence', 'description']
      }
    };
  }

  /**
   * Validate parsed data
   */
  validateParsedData(items) {
    const errors = [];

    items.forEach((item, index) => {
      if (!item.value) {
        errors.push({ index, error: 'Missing required field: value' });
      }
      if (!item.type) {
        errors.push({ index, error: 'Missing required field: type' });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new ParsingService();
