/**
 * Multi-Format IoC Support Service
 * 
 * Sub-feature 7.2: Multi-Format IoC Support
 * Handles various IoC types and format conversions
 */

class FormatService {
  /**
   * Get supported IoC types
   */
  getSupportedTypes() {
    return {
      types: [
        {
          type: 'ip',
          description: 'IP address (IPv4 or IPv6)',
          examples: ['192.168.1.1', '2001:0db8:85a3:0000:0000:8a2e:0370:7334']
        },
        {
          type: 'domain',
          description: 'Domain name',
          examples: ['example.com', 'malicious.evil.com']
        },
        {
          type: 'url',
          description: 'Full URL',
          examples: ['http://example.com/malware', 'https://phishing.site/login']
        },
        {
          type: 'hash',
          description: 'File hash (MD5, SHA1, SHA256)',
          examples: [
            '5d41402abc4b2a76b9719d911017c592',
            'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d',
            '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae'
          ]
        },
        {
          type: 'email',
          description: 'Email address',
          examples: ['attacker@evil.com', 'phishing@scam.net']
        },
        {
          type: 'filename',
          description: 'Malicious filename',
          examples: ['malware.exe', 'trojan.dll']
        },
        {
          type: 'registry',
          description: 'Windows registry key',
          examples: ['HKLM\\Software\\Malware\\Key']
        },
        {
          type: 'mutex',
          description: 'Mutex name',
          examples: ['Global\\MalwareMutex']
        },
        {
          type: 'certificate',
          description: 'SSL/TLS certificate thumbprint',
          examples: ['1234567890abcdef1234567890abcdef12345678']
        }
      ]
    };
  }

  /**
   * Auto-detect IoC type from value
   */
  detectType(value) {
    // IP address
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) {
      return 'ip';
    }
    if (/^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/.test(value)) {
      return 'ip';
    }

    // Hash
    if (/^[a-fA-F0-9]{32}$/.test(value)) {
      return 'hash'; // MD5
    }
    if (/^[a-fA-F0-9]{40}$/.test(value)) {
      return 'hash'; // SHA1
    }
    if (/^[a-fA-F0-9]{64}$/.test(value)) {
      return 'hash'; // SHA256
    }

    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'email';
    }

    // URL
    if (/^https?:\/\/.+/.test(value)) {
      return 'url';
    }

    // Domain
    if (/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(value)) {
      return 'domain';
    }

    // Filename
    if (/\.(exe|dll|bat|ps1|vbs|js|jar|apk|elf|so)$/i.test(value)) {
      return 'filename';
    }

    // Registry key
    if (/^HKLM|HKCU|HKCR|HKU|HKCC/.test(value)) {
      return 'registry';
    }

    // Mutex
    if (/^(Global|Local)\\/.test(value)) {
      return 'mutex';
    }

    return 'unknown';
  }

  /**
   * Convert IoC format
   */
  async convertFormat(iocs, targetFormat) {
    switch (targetFormat.toLowerCase()) {
      case 'json':
        return this.toJSON(iocs);
      case 'csv':
        return this.toCSV(iocs);
      case 'stix':
        return this.toSTIX(iocs);
      case 'openioc':
        return this.toOpenIOC(iocs);
      case 'plain':
        return this.toPlain(iocs);
      default:
        throw new Error(`Unsupported format: ${targetFormat}`);
    }
  }

  /**
   * Convert to JSON format
   */
  toJSON(iocs) {
    return {
      format: 'json',
      version: '1.0',
      iocs: Array.isArray(iocs) ? iocs : [iocs]
    };
  }

  /**
   * Convert to CSV format
   */
  toCSV(iocs) {
    const iocsArray = Array.isArray(iocs) ? iocs : [iocs];
    const headers = ['id', 'value', 'type', 'confidence', 'severity', 'status', 'first_seen', 'last_seen'];
    
    let csv = headers.join(',') + '\n';
    
    iocsArray.forEach(ioc => {
      const row = headers.map(header => {
        const value = ioc[header] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csv += row.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Convert to STIX format (simplified)
   */
  toSTIX(iocs) {
    const iocsArray = Array.isArray(iocs) ? iocs : [iocs];
    
    return {
      type: 'bundle',
      id: `bundle--${Date.now()}`,
      spec_version: '2.1',
      objects: iocsArray.map(ioc => ({
        type: 'indicator',
        id: `indicator--${ioc.id}`,
        created: ioc.created_at,
        modified: ioc.updated_at,
        name: `IoC: ${ioc.value}`,
        description: ioc.metadata?.description || `${ioc.type} indicator`,
        pattern: this.toSTIXPattern(ioc),
        pattern_type: 'stix',
        valid_from: ioc.first_seen,
        valid_until: ioc.expiration,
        labels: ioc.tags,
        confidence: ioc.confidence
      }))
    };
  }

  /**
   * Convert IoC to STIX pattern
   */
  toSTIXPattern(ioc) {
    switch (ioc.type) {
      case 'ip':
        return `[ipv4-addr:value = '${ioc.value}']`;
      case 'domain':
        return `[domain-name:value = '${ioc.value}']`;
      case 'url':
        return `[url:value = '${ioc.value}']`;
      case 'hash':
        const hashType = ioc.value.length === 32 ? 'MD5' : ioc.value.length === 40 ? 'SHA-1' : 'SHA-256';
        return `[file:hashes.${hashType} = '${ioc.value}']`;
      case 'email':
        return `[email-addr:value = '${ioc.value}']`;
      default:
        return `[x-custom:value = '${ioc.value}']`;
    }
  }

  /**
   * Convert to OpenIOC format (simplified)
   */
  toOpenIOC(iocs) {
    const iocsArray = Array.isArray(iocs) ? iocs : [iocs];
    
    return {
      ioc: {
        xmlns: 'http://schemas.mandiant.com/2010/ioc',
        id: `ioc-${Date.now()}`,
        version: '1.0',
        indicators: iocsArray.map(ioc => ({
          id: ioc.id,
          indicator: {
            operator: 'OR',
            IndicatorItem: {
              condition: 'is',
              Context: {
                document: ioc.type,
                search: ioc.type
              },
              Content: {
                type: ioc.type,
                value: ioc.value
              }
            }
          },
          metadata: {
            confidence: ioc.confidence,
            severity: ioc.severity,
            tags: ioc.tags
          }
        }))
      }
    };
  }

  /**
   * Convert to plain text format
   */
  toPlain(iocs) {
    const iocsArray = Array.isArray(iocs) ? iocs : [iocs];
    return iocsArray.map(ioc => ioc.value).join('\n');
  }

  /**
   * Parse IoCs from various formats
   */
  async parseFormat(data, sourceFormat) {
    switch (sourceFormat.toLowerCase()) {
      case 'json':
        return this.parseJSON(data);
      case 'csv':
        return this.parseCSV(data);
      case 'stix':
        return this.parseSTIX(data);
      case 'plain':
        return this.parsePlain(data);
      default:
        throw new Error(`Unsupported format: ${sourceFormat}`);
    }
  }

  /**
   * Parse JSON format
   */
  parseJSON(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return Array.isArray(parsed) ? parsed : parsed.iocs || [parsed];
  }

  /**
   * Parse CSV format
   */
  parseCSV(data) {
    const lines = data.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const ioc = {};
      headers.forEach((header, index) => {
        ioc[header] = values[index];
      });
      return ioc;
    });
  }

  /**
   * Parse STIX format
   */
  parseSTIX(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const objects = parsed.objects || [];
    
    return objects
      .filter(obj => obj.type === 'indicator')
      .map(indicator => ({
        value: this.extractValueFromSTIXPattern(indicator.pattern),
        type: this.detectTypeFromSTIXPattern(indicator.pattern),
        confidence: indicator.confidence || 50,
        tags: indicator.labels || [],
        first_seen: indicator.valid_from,
        expiration: indicator.valid_until
      }));
  }

  /**
   * Extract value from STIX pattern
   */
  extractValueFromSTIXPattern(pattern) {
    const match = pattern.match(/'([^']+)'/);
    return match ? match[1] : '';
  }

  /**
   * Detect type from STIX pattern
   */
  detectTypeFromSTIXPattern(pattern) {
    if (pattern.includes('ipv4-addr')) return 'ip';
    if (pattern.includes('domain-name')) return 'domain';
    if (pattern.includes('url:')) return 'url';
    if (pattern.includes('file:hashes')) return 'hash';
    if (pattern.includes('email-addr')) return 'email';
    return 'unknown';
  }

  /**
   * Parse plain text format (one IoC per line)
   */
  parsePlain(data) {
    const lines = data.split('\n').filter(line => line.trim());
    return lines.map(value => ({
      value: value.trim(),
      type: this.detectType(value.trim())
    }));
  }
}

module.exports = new FormatService();
