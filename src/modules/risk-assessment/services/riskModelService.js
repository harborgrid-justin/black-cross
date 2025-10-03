/**
 * Custom Risk Scoring Models Service
 * Handles custom risk model management
 */

const RiskModel = require('../models/RiskModel');
const logger = require('../utils/logger');

class RiskModelService {
  /**
   * Create a new risk model
   * @param {Object} modelData - Risk model data
   * @returns {Promise<Object>} Created risk model
   */
  async createModel(modelData) {
    try {
      logger.info('Creating risk model', { name: modelData.name });

      // Check if model with same name exists
      const existing = await RiskModel.findOne({ name: modelData.name });
      if (existing) {
        throw new Error('Risk model with this name already exists');
      }

      // If this is marked as default, unset other defaults
      if (modelData.is_default) {
        await RiskModel.updateMany({}, { is_default: false });
      }

      const model = new RiskModel({
        name: modelData.name,
        description: modelData.description,
        model_type: modelData.model_type,
        formula: modelData.formula,
        factors: modelData.factors,
        likelihood_matrix: modelData.likelihood_matrix || this.getDefaultLikelihoodMatrix(),
        impact_matrix: modelData.impact_matrix || this.getDefaultImpactMatrix(),
        risk_levels: modelData.risk_levels || this.getDefaultRiskLevels(),
        version: 1,
        is_active: true,
        is_default: modelData.is_default || false,
        industry_template: modelData.industry_template,
        created_by: modelData.created_by,
        metadata: modelData.metadata,
      });

      await model.save();

      logger.info('Risk model created', { modelId: model.id });
      return model;
    } catch (error) {
      logger.error('Error creating risk model', { error: error.message });
      throw error;
    }
  }

  /**
   * Update risk model
   * @param {string} modelId - Model ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated risk model
   */
  async updateModel(modelId, updates) {
    try {
      logger.info('Updating risk model', { modelId });

      const model = await RiskModel.findOne({ id: modelId });
      if (!model) {
        throw new Error('Risk model not found');
      }

      // If making this default, unset other defaults
      if (updates.is_default && !model.is_default) {
        await RiskModel.updateMany({ id: { $ne: modelId } }, { is_default: false });
      }

      // Increment version on significant changes
      if (updates.formula || updates.factors || updates.likelihood_matrix || updates.impact_matrix) {
        model.version += 1;
      }

      Object.assign(model, updates);
      await model.save();

      logger.info('Risk model updated', { modelId });
      return model;
    } catch (error) {
      logger.error('Error updating risk model', { error: error.message });
      throw error;
    }
  }

  /**
   * Get risk model by ID
   * @param {string} modelId - Model ID
   * @returns {Promise<Object>} Risk model
   */
  async getModel(modelId) {
    try {
      const model = await RiskModel.findOne({ id: modelId });
      if (!model) {
        throw new Error('Risk model not found');
      }
      return model;
    } catch (error) {
      logger.error('Error getting risk model', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all risk models
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of risk models
   */
  async getModels(filters = {}) {
    try {
      const query = {};

      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }

      if (filters.industry_template) {
        query.industry_template = filters.industry_template;
      }

      if (filters.model_type) {
        query.model_type = filters.model_type;
      }

      const models = await RiskModel.find(query).sort({ is_default: -1, created_at: -1 });
      return models;
    } catch (error) {
      logger.error('Error getting risk models', { error: error.message });
      throw error;
    }
  }

  /**
   * Get default risk model
   * @returns {Promise<Object>} Default risk model
   */
  async getDefaultModel() {
    try {
      let model = await RiskModel.findOne({ is_default: true, is_active: true });

      // If no default exists, create one
      if (!model) {
        model = await this.createModel({
          name: 'Default Risk Model',
          description: 'Standard risk assessment model',
          model_type: 'qualitative',
          formula: '(Likelihood * Impact) / 100',
          factors: [],
          is_default: true,
          created_by: 'system',
        });
      }

      return model;
    } catch (error) {
      logger.error('Error getting default model', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete risk model
   * @param {string} modelId - Model ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteModel(modelId) {
    try {
      const model = await RiskModel.findOne({ id: modelId });
      if (!model) {
        throw new Error('Risk model not found');
      }

      if (model.is_default) {
        throw new Error('Cannot delete default risk model');
      }

      await RiskModel.deleteOne({ id: modelId });

      logger.info('Risk model deleted', { modelId });
      return { success: true, message: 'Risk model deleted successfully' };
    } catch (error) {
      logger.error('Error deleting risk model', { error: error.message });
      throw error;
    }
  }

  /**
   * Create model from industry template
   * @param {string} industry - Industry type
   * @param {string} createdBy - User creating the model
   * @returns {Promise<Object>} Created risk model
   */
  async createFromTemplate(industry, createdBy) {
    try {
      const templates = {
        financial: {
          name: 'Financial Services Risk Model',
          description: 'Risk model tailored for financial institutions',
          factors: [
            {
              name: 'regulatory_impact',
              weight: 0.3,
              data_type: 'number',
              description: 'Regulatory compliance impact',
            },
            {
              name: 'financial_loss',
              weight: 0.4,
              data_type: 'number',
              description: 'Potential financial loss',
            },
            {
              name: 'reputation_damage',
              weight: 0.3,
              data_type: 'number',
              description: 'Reputation impact',
            },
          ],
        },
        healthcare: {
          name: 'Healthcare Risk Model',
          description: 'Risk model for healthcare organizations',
          factors: [
            {
              name: 'patient_safety',
              weight: 0.4,
              data_type: 'number',
              description: 'Patient safety impact',
            },
            {
              name: 'data_privacy',
              weight: 0.3,
              data_type: 'number',
              description: 'PHI exposure risk',
            },
            {
              name: 'operational_impact',
              weight: 0.3,
              data_type: 'number',
              description: 'Service disruption',
            },
          ],
        },
        // Add more templates as needed
      };

      const template = templates[industry];
      if (!template) {
        throw new Error('Industry template not found');
      }

      return this.createModel({
        ...template,
        model_type: 'hybrid',
        formula: '(Likelihood * Impact * Factor_Weights) / 100',
        industry_template: industry,
        created_by: createdBy,
      });
    } catch (error) {
      logger.error('Error creating model from template', { error: error.message });
      throw error;
    }
  }

  /**
   * Get default likelihood matrix
   * @returns {Object} Default likelihood matrix
   */
  getDefaultLikelihoodMatrix() {
    return {
      very_low: { min: 0, max: 20 },
      low: { min: 21, max: 40 },
      medium: { min: 41, max: 60 },
      high: { min: 61, max: 80 },
      very_high: { min: 81, max: 100 },
    };
  }

  /**
   * Get default impact matrix
   * @returns {Object} Default impact matrix
   */
  getDefaultImpactMatrix() {
    return {
      negligible: { min: 0, max: 20 },
      minor: { min: 21, max: 40 },
      moderate: { min: 41, max: 60 },
      major: { min: 61, max: 80 },
      critical: { min: 81, max: 100 },
    };
  }

  /**
   * Get default risk levels
   * @returns {Object} Default risk levels
   */
  getDefaultRiskLevels() {
    return {
      low: { min: 0, max: 30 },
      medium: { min: 31, max: 50 },
      high: { min: 51, max: 70 },
      critical: { min: 71, max: 100 },
    };
  }
}

module.exports = new RiskModelService();
