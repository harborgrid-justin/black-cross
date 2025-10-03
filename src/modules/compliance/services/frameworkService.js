/**
 * Framework Mapping Service
 * Handles compliance framework mapping and control management
 */

/* eslint-disable no-await-in-loop, no-restricted-syntax, camelcase */

const { v4: uuidv4 } = require('uuid');
const ComplianceControl = require('../models/ComplianceControl');
const logger = require('../utils/logger');

class FrameworkService {
  /**
   * Get all available frameworks
   * @returns {Promise<Array>} List of frameworks
   */
  async getFrameworks() {
    try {
      logger.info('Retrieving available frameworks');

      const frameworks = [
        { id: 'NIST-CSF', name: 'NIST Cybersecurity Framework', version: '1.1' },
        { id: 'NIST-800-53', name: 'NIST SP 800-53', version: 'Rev 5' },
        { id: 'NIST-800-171', name: 'NIST SP 800-171', version: 'Rev 2' },
        { id: 'ISO-27001', name: 'ISO/IEC 27001', version: '2013' },
        { id: 'ISO-27002', name: 'ISO/IEC 27002', version: '2013' },
        { id: 'ISO-27017', name: 'ISO/IEC 27017', version: '2015' },
        { id: 'ISO-27018', name: 'ISO/IEC 27018', version: '2019' },
        { id: 'PCI-DSS', name: 'PCI Data Security Standard', version: '4.0' },
        { id: 'HIPAA', name: 'Health Insurance Portability and Accountability Act', version: 'Final Rule' },
        { id: 'GDPR', name: 'General Data Protection Regulation', version: '2016/679' },
        { id: 'SOX', name: 'Sarbanes-Oxley Act', version: '2002' },
        { id: 'SOC2', name: 'SOC 2 Type II', version: '2017' },
        { id: 'CMMC', name: 'Cybersecurity Maturity Model Certification', version: '2.0' },
        { id: 'FedRAMP', name: 'Federal Risk and Authorization Management Program', version: 'Rev 5' },
        { id: 'CIS', name: 'CIS Controls', version: 'v8' },
      ];

      return frameworks;
    } catch (error) {
      logger.error('Error retrieving frameworks', { error: error.message });
      throw error;
    }
  }

  /**
   * Map controls to a framework
   * @param {String} framework - Framework identifier
   * @param {Object} mappingData - Mapping data
   * @returns {Promise<Object>} Mapping result
   */
  async mapControls(framework, mappingData) {
    try {
      logger.info('Mapping controls to framework', { framework });

      // eslint-disable-next-line camelcase
      const { controls, mapping_type = 'direct' } = mappingData;
      const results = {
        framework,
        // eslint-disable-next-line camelcase
        mapping_type,
        mapped_controls: [],
        errors: [],
      };

      // eslint-disable-next-line no-restricted-syntax
      for (const controlId of controls) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const control = await ComplianceControl.findOne({
            id: controlId,
            framework,
          });

          if (control) {
            results.mapped_controls.push({
              control_id: control.control_id,
              status: 'mapped',
              implementation_status: control.implementation_status,
            });
          } else {
            results.errors.push({
              control_id: controlId,
              error: 'Control not found',
            });
          }
        } catch (err) {
          results.errors.push({
            control_id: controlId,
            error: err.message,
          });
        }
      }

      logger.info('Control mapping completed', {
        framework,
        mapped: results.mapped_controls.length,
        errors: results.errors.length,
      });

      return results;
    } catch (error) {
      logger.error('Error mapping controls', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a new compliance control
   * @param {Object} controlData - Control data
   * @returns {Promise<Object>} Created control
   */
  async createControl(controlData) {
    try {
      logger.info('Creating compliance control', {
        control_id: controlData.control_id,
        framework: controlData.framework,
      });

      const control = new ComplianceControl({
        ...controlData,
        id: uuidv4(),
      });

      await control.save();
      logger.info('Control created successfully', { id: control.id });

      return control;
    } catch (error) {
      logger.error('Error creating control', { error: error.message });
      throw error;
    }
  }

  /**
   * Get controls by framework
   * @param {String} framework - Framework identifier
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Controls
   */
  async getControlsByFramework(framework, filters = {}) {
    try {
      logger.info('Retrieving controls for framework', { framework });

      const query = { framework };

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.implementation_status) {
        query.implementation_status = filters.implementation_status;
      }
      if (filters.risk_level) {
        query.risk_level = filters.risk_level;
      }

      const controls = await ComplianceControl.find(query)
        .sort({ control_id: 1 })
        .lean();

      logger.info('Controls retrieved', {
        framework,
        count: controls.length,
      });

      return controls;
    } catch (error) {
      logger.error('Error retrieving controls', { error: error.message });
      throw error;
    }
  }

  /**
   * Update control status
   * @param {String} controlId - Control ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated control
   */
  async updateControl(controlId, updates) {
    try {
      logger.info('Updating control', { controlId });

      const control = await ComplianceControl.findOneAndUpdate(
        { id: controlId },
        { $set: updates },
        { new: true },
      );

      if (!control) {
        throw new Error('Control not found');
      }

      logger.info('Control updated successfully', { id: control.id });
      return control;
    } catch (error) {
      logger.error('Error updating control', { error: error.message });
      throw error;
    }
  }
}

module.exports = new FrameworkService();
