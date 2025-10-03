/**
 * IoC (Indicator of Compromise) Model
 * 
 * Represents an indicator of compromise with comprehensive tracking
 * including type, confidence, enrichment data, and lifecycle management
 */

const { v4: uuidv4 } = require('uuid');

class IoC {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.value = data.value || '';
    this.type = data.type || 'unknown'; // ip, domain, url, hash, email, filename, registry, mutex, certificate
    this.confidence = data.confidence !== undefined ? data.confidence : 50; // 0-100
    this.severity = data.severity || 'medium'; // critical, high, medium, low, info
    this.status = data.status || 'active'; // active, inactive, expired, deprecated
    this.first_seen = data.first_seen || new Date();
    this.last_seen = data.last_seen || new Date();
    this.expiration = data.expiration || null;
    this.sources = data.sources || [];
    this.tags = data.tags || [];
    this.enrichment = data.enrichment || {
      geolocation: null,
      reputation: null,
      whois: null,
      dns: null,
      malware_families: [],
      threat_actors: [],
      related_campaigns: []
    };
    this.sightings = data.sightings || [];
    this.related_threats = data.related_threats || [];
    this.related_iocs = data.related_iocs || [];
    this.false_positive = data.false_positive !== undefined ? data.false_positive : false;
    this.metadata = data.metadata || {};
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  calculateConfidence() {
    let score = this.confidence || 50;
    
    // Adjust based on source reliability
    if (this.sources.length > 0) {
      const avgSourceReliability = this.sources.reduce((sum, s) => sum + (s.reliability || 50), 0) / this.sources.length;
      score = (score * 0.6) + (avgSourceReliability * 0.4);
    }
    
    // Adjust based on age
    const ageInDays = (new Date() - new Date(this.first_seen)) / (1000 * 60 * 60 * 24);
    const ageDecay = Math.max(0, 1 - (ageInDays / 365)); // Decay over 1 year
    score = score * (0.7 + (ageDecay * 0.3));
    
    // Adjust based on sightings
    if (this.sightings.length > 0) {
      const recentSightings = this.sightings.filter(s => {
        const sightingAge = (new Date() - new Date(s.timestamp)) / (1000 * 60 * 60 * 24);
        return sightingAge < 30;
      }).length;
      const sightingBoost = Math.min(20, recentSightings * 2);
      score = Math.min(100, score + sightingBoost);
    }
    
    // Adjust based on enrichment
    if (this.enrichment.reputation && this.enrichment.reputation.score) {
      score = (score * 0.7) + (this.enrichment.reputation.score * 0.3);
    }
    
    this.confidence = Math.max(0, Math.min(100, Math.round(score)));
    return this.confidence;
  }

  /**
   * Add a sighting
   */
  addSighting(sighting) {
    this.sightings.push({
      timestamp: sighting.timestamp || new Date(),
      source: sighting.source || 'unknown',
      location: sighting.location || null,
      context: sighting.context || null
    });
    this.last_seen = new Date();
    this.updated_at = new Date();
  }

  /**
   * Update lifecycle status
   */
  updateLifecycle(status, expirationDate = null) {
    this.status = status;
    if (expirationDate) {
      this.expiration = expirationDate;
    }
    if (status === 'expired' && !this.expiration) {
      this.expiration = new Date();
    }
    this.updated_at = new Date();
  }

  /**
   * Check if IoC is expired
   */
  isExpired() {
    if (!this.expiration) {
      return false;
    }
    return new Date() > new Date(this.expiration);
  }

  /**
   * Mark as false positive
   */
  markAsFalsePositive(reason = null) {
    this.false_positive = true;
    this.status = 'inactive';
    if (reason) {
      this.metadata.false_positive_reason = reason;
    }
    this.updated_at = new Date();
  }

  /**
   * Enrich IoC data
   */
  enrichData(enrichmentData) {
    this.enrichment = {
      ...this.enrichment,
      ...enrichmentData
    };
    this.updated_at = new Date();
  }

  /**
   * Validate IoC format based on type
   */
  validate() {
    const errors = [];
    
    if (!this.value || this.value.trim() === '') {
      errors.push('IoC value is required');
    }
    
    // Type-specific validation
    switch (this.type) {
      case 'ip':
        if (!this.validateIP(this.value)) {
          errors.push('Invalid IP address format');
        }
        break;
      case 'domain':
        if (!this.validateDomain(this.value)) {
          errors.push('Invalid domain format');
        }
        break;
      case 'url':
        if (!this.validateURL(this.value)) {
          errors.push('Invalid URL format');
        }
        break;
      case 'hash':
        if (!this.validateHash(this.value)) {
          errors.push('Invalid hash format');
        }
        break;
      case 'email':
        if (!this.validateEmail(this.value)) {
          errors.push('Invalid email format');
        }
        break;
    }
    
    if (this.confidence < 0 || this.confidence > 100) {
      errors.push('Confidence must be between 0 and 100');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateIP(value) {
    // IPv4 or IPv6
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
    return ipv4Pattern.test(value) || ipv6Pattern.test(value);
  }

  validateDomain(value) {
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainPattern.test(value);
  }

  validateURL(value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  validateHash(value) {
    // MD5 (32), SHA1 (40), SHA256 (64)
    const hashPattern = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
    return hashPattern.test(value);
  }

  validateEmail(value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      value: this.value,
      type: this.type,
      confidence: this.confidence,
      severity: this.severity,
      status: this.status,
      first_seen: this.first_seen,
      last_seen: this.last_seen,
      expiration: this.expiration,
      sources: this.sources,
      tags: this.tags,
      enrichment: this.enrichment,
      sightings: this.sightings,
      related_threats: this.related_threats,
      related_iocs: this.related_iocs,
      false_positive: this.false_positive,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = IoC;
