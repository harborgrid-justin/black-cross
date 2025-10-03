/**
 * Pre-Built Playbook Library Service
 * Handles pre-built response playbooks (Sub-Feature 15.1)
 */

const Playbook = require('../models/Playbook');
const logger = require('../utils/logger');

class LibraryService {
  /**
   * Get pre-built playbooks library
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Pre-built playbooks
   */
  async getLibrary(filters = {}) {
    try {
      logger.info('Fetching pre-built playbooks library', filters);

      const query = { is_prebuilt: true, status: 'active' };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      const playbooks = await Playbook.find(query)
        .sort({ execution_count: -1, success_rate: -1 })
        .limit(filters.limit || 100)
        .select('-__v');

      logger.info('Pre-built playbooks retrieved', { count: playbooks.length });

      return playbooks;
    } catch (error) {
      logger.error('Error fetching library', { error: error.message });
      throw error;
    }
  }

  /**
   * Get playbook by ID
   * @param {string} playbookId - Playbook ID
   * @returns {Promise<Object>} Playbook details
   */
  async getPlaybook(playbookId) {
    try {
      logger.info('Fetching playbook', { playbook_id: playbookId });

      const playbook = await Playbook.findOne({ id: playbookId }).select('-__v');

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      return playbook;
    } catch (error) {
      logger.error('Error fetching playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Get playbook categories
   * @returns {Promise<Array>} Available categories
   */
  async getCategories() {
    try {
      logger.info('Fetching playbook categories');

      const categories = await Playbook.distinct('category', { 
        is_prebuilt: true,
        status: 'active' 
      });

      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const count = await Playbook.countDocuments({ 
            category,
            is_prebuilt: true,
            status: 'active' 
          });
          return { category, count };
        })
      );

      return categoriesWithCount;
    } catch (error) {
      logger.error('Error fetching categories', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize pre-built playbooks (for seeding)
   * @returns {Promise<Object>} Initialization result
   */
  async initializeLibrary() {
    try {
      logger.info('Initializing pre-built playbooks library');

      const prebuiltPlaybooks = this.getPrebuiltPlaybooksData();
      const results = {
        created: 0,
        skipped: 0,
        total: prebuiltPlaybooks.length
      };

      for (const playbookData of prebuiltPlaybooks) {
        const existing = await Playbook.findOne({ 
          name: playbookData.name,
          is_prebuilt: true 
        });

        if (!existing) {
          await Playbook.create(playbookData);
          results.created++;
        } else {
          results.skipped++;
        }
      }

      logger.info('Library initialized', results);
      return results;
    } catch (error) {
      logger.error('Error initializing library', { error: error.message });
      throw error;
    }
  }

  /**
   * Get pre-built playbooks data
   * @returns {Array} Pre-built playbooks
   */
  getPrebuiltPlaybooksData() {
    return [
      {
        name: 'Phishing Email Response',
        description: 'Automated response to phishing email alerts including email analysis, IOC extraction, and user notification',
        category: 'phishing_response',
        author: 'Black-Cross Security Team',
        status: 'active',
        is_prebuilt: true,
        trigger_conditions: {
          type: 'event',
          event_type: 'phishing_alert'
        },
        actions: [
          {
            type: 'collect_evidence',
            name: 'Collect Email Evidence',
            description: 'Collect email headers and content',
            parameters: { evidence_type: 'email' },
            order: 0
          },
          {
            type: 'enrich_ioc',
            name: 'Enrich IOCs',
            description: 'Enrich URLs and sender information',
            parameters: { ioc_types: ['url', 'email'] },
            order: 1
          },
          {
            type: 'block_ip',
            name: 'Block Malicious IPs',
            description: 'Block identified malicious IP addresses',
            parameters: {},
            order: 2,
            condition: { type: 'equals', variable: 'threat_level', value: 'high' }
          },
          {
            type: 'send_notification',
            name: 'Notify Security Team',
            description: 'Send alert to security team',
            parameters: { channel: 'email', recipients: ['security@company.com'] },
            order: 3
          },
          {
            type: 'create_ticket',
            name: 'Create Incident Ticket',
            description: 'Create incident ticket for tracking',
            parameters: { priority: 'high' },
            order: 4
          }
        ],
        tags: ['phishing', 'email', 'automated'],
        mitre_attack: {
          tactics: ['Initial Access'],
          techniques: ['T1566']
        }
      },
      {
        name: 'Malware Containment',
        description: 'Rapid containment of malware-infected endpoints including isolation and scan',
        category: 'malware_containment',
        author: 'Black-Cross Security Team',
        status: 'active',
        is_prebuilt: true,
        trigger_conditions: {
          type: 'event',
          event_type: 'malware_detected'
        },
        actions: [
          {
            type: 'isolate_endpoint',
            name: 'Isolate Infected Endpoint',
            description: 'Immediately isolate the infected endpoint',
            parameters: {},
            order: 0
          },
          {
            type: 'collect_evidence',
            name: 'Collect Forensic Evidence',
            description: 'Collect memory dump and process information',
            parameters: { evidence_type: 'forensic' },
            order: 1
          },
          {
            type: 'run_scan',
            name: 'Full System Scan',
            description: 'Run comprehensive malware scan',
            parameters: { scan_type: 'full' },
            order: 2
          },
          {
            type: 'send_notification',
            name: 'Alert Security Operations',
            description: 'Notify SOC team immediately',
            parameters: { channel: 'slack', priority: 'critical' },
            order: 3
          },
          {
            type: 'create_ticket',
            name: 'Create Incident',
            description: 'Create high-priority incident ticket',
            parameters: { priority: 'critical' },
            order: 4
          }
        ],
        tags: ['malware', 'containment', 'endpoint'],
        mitre_attack: {
          tactics: ['Execution', 'Persistence'],
          techniques: ['T1204', 'T1543']
        }
      },
      {
        name: 'Ransomware Response',
        description: 'Emergency response to ransomware attacks with isolation and backup verification',
        category: 'ransomware_response',
        author: 'Black-Cross Security Team',
        status: 'active',
        is_prebuilt: true,
        approvals_required: true,
        approval_roles: ['security_manager', 'incident_commander'],
        trigger_conditions: {
          type: 'event',
          event_type: 'ransomware_detected'
        },
        actions: [
          {
            type: 'isolate_endpoint',
            name: 'Emergency Isolation',
            description: 'Immediately isolate all affected endpoints',
            parameters: {},
            order: 0
          },
          {
            type: 'update_firewall',
            name: 'Block C2 Communications',
            description: 'Block command and control servers',
            parameters: {},
            order: 1
          },
          {
            type: 'collect_evidence',
            name: 'Preserve Evidence',
            description: 'Collect ransomware samples and logs',
            parameters: { evidence_type: 'ransomware' },
            order: 2
          },
          {
            type: 'send_notification',
            name: 'Emergency Alert',
            description: 'Send emergency notification to leadership',
            parameters: { 
              channel: 'multiple',
              recipients: ['security@company.com', 'ciso@company.com'],
              priority: 'emergency'
            },
            order: 3
          },
          {
            type: 'approval',
            name: 'Approval for Recovery',
            description: 'Wait for approval before recovery actions',
            parameters: { approvers: ['security_manager'] },
            order: 4
          },
          {
            type: 'create_ticket',
            name: 'Create Critical Incident',
            description: 'Create critical incident for tracking',
            parameters: { priority: 'critical', type: 'ransomware' },
            order: 5
          }
        ],
        tags: ['ransomware', 'critical', 'emergency'],
        mitre_attack: {
          tactics: ['Impact'],
          techniques: ['T1486']
        }
      },
      {
        name: 'Account Compromise Response',
        description: 'Automated response to compromised user accounts with credential reset and session termination',
        category: 'account_compromise',
        author: 'Black-Cross Security Team',
        status: 'active',
        is_prebuilt: true,
        trigger_conditions: {
          type: 'event',
          event_type: 'account_compromise'
        },
        actions: [
          {
            type: 'reset_credentials',
            name: 'Force Password Reset',
            description: 'Reset compromised user credentials',
            parameters: {},
            order: 0
          },
          {
            type: 'custom_api',
            name: 'Terminate Active Sessions',
            description: 'Terminate all active user sessions',
            parameters: { action: 'terminate_sessions' },
            order: 1
          },
          {
            type: 'collect_evidence',
            name: 'Collect Access Logs',
            description: 'Collect authentication and access logs',
            parameters: { evidence_type: 'access_logs' },
            order: 2
          },
          {
            type: 'send_notification',
            name: 'Notify User',
            description: 'Send notification to affected user',
            parameters: { channel: 'email' },
            order: 3
          },
          {
            type: 'create_ticket',
            name: 'Create Investigation Ticket',
            description: 'Create ticket for further investigation',
            parameters: { priority: 'high', type: 'account_compromise' },
            order: 4
          }
        ],
        tags: ['account', 'credentials', 'identity'],
        mitre_attack: {
          tactics: ['Credential Access', 'Initial Access'],
          techniques: ['T1078', 'T1110']
        }
      },
      {
        name: 'DDoS Mitigation',
        description: 'Automated DDoS attack mitigation with traffic analysis and blocking',
        category: 'ddos_mitigation',
        author: 'Black-Cross Security Team',
        status: 'active',
        is_prebuilt: true,
        trigger_conditions: {
          type: 'event',
          event_type: 'ddos_detected'
        },
        actions: [
          {
            type: 'query_siem',
            name: 'Analyze Traffic Patterns',
            description: 'Query SIEM for traffic analysis',
            parameters: { query: 'ddos_traffic_analysis' },
            order: 0
          },
          {
            type: 'update_firewall',
            name: 'Apply Rate Limiting',
            description: 'Apply rate limiting rules',
            parameters: { action: 'rate_limit' },
            order: 1
          },
          {
            type: 'block_ip',
            name: 'Block Attack Sources',
            description: 'Block identified attack source IPs',
            parameters: {},
            order: 2
          },
          {
            type: 'send_notification',
            name: 'Alert Network Team',
            description: 'Notify network operations team',
            parameters: { channel: 'slack', team: 'network_ops' },
            order: 3
          },
          {
            type: 'create_ticket',
            name: 'Create DDoS Incident',
            description: 'Create incident ticket',
            parameters: { priority: 'high', type: 'ddos' },
            order: 4
          }
        ],
        tags: ['ddos', 'network', 'availability'],
        mitre_attack: {
          tactics: ['Impact'],
          techniques: ['T1498', 'T1499']
        }
      }
    ];
  }
}

module.exports = new LibraryService();
