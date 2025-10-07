/**
 * Custom Playbook Creation Service
 * Handles custom playbook creation and management (Sub-Feature 15.2)
 */

import Playbook from '../models/Playbook';
import logger from '../utils/logger';

class PlaybookService {
  /**
   * Create custom playbook
   * @param {Object} playbookData - Playbook data
   * @returns {Promise<Object>} Created playbook
   */
  async createPlaybook(playbookData) {
    try {
      logger.info('Creating custom playbook', { name: playbookData.name });

      // Validate action order
      this.validateActionOrder(playbookData.actions);

      const playbook = new Playbook({
        ...playbookData,
        is_prebuilt: false,
        status: playbookData.status || 'draft',
      });

      await playbook.save();
      logger.info('Custom playbook created', { id: playbook.id });

      return playbook;
    } catch (error) {
      logger.error('Error creating playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Update playbook
   * @param {string} playbookId - Playbook ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated playbook
   */
  async updatePlaybook(playbookId, updateData) {
    try {
      logger.info('Updating playbook', { playbook_id: playbookId });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      // Don't allow updating pre-built playbooks
      if (playbook.is_prebuilt) {
        throw new Error('Cannot update pre-built playbooks. Clone it instead.');
      }

      // Validate action order if actions are being updated
      if (updateData.actions) {
        this.validateActionOrder(updateData.actions);
      }

      // Update version if significant changes
      if (updateData.actions || updateData.trigger_conditions) {
        updateData.version = this.incrementVersion(playbook.version);
      }

      Object.assign(playbook, updateData);
      await playbook.save();

      logger.info('Playbook updated', { id: playbook.id, version: playbook.version });

      return playbook;
    } catch (error) {
      logger.error('Error updating playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete playbook
   * @param {string} playbookId - Playbook ID
   * @returns {Promise<Object>} Delete result
   */
  async deletePlaybook(playbookId) {
    try {
      logger.info('Deleting playbook', { playbook_id: playbookId });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      // Don't allow deleting pre-built playbooks
      if (playbook.is_prebuilt) {
        throw new Error('Cannot delete pre-built playbooks');
      }

      await Playbook.deleteOne({ id: playbookId });
      logger.info('Playbook deleted', { id: playbookId });

      return { deleted: true, id: playbookId };
    } catch (error) {
      logger.error('Error deleting playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Clone playbook
   * @param {string} playbookId - Source playbook ID
   * @param {Object} options - Clone options
   * @returns {Promise<Object>} Cloned playbook
   */
  async clonePlaybook(playbookId: string, options: Record<string, any> = {}) {
    try {
      logger.info('Cloning playbook', { playbook_id: playbookId });

      const sourcePlaybook = await Playbook.findOne({ id: playbookId });

      if (!sourcePlaybook) {
        throw new Error('Source playbook not found');
      }

      const clonedData: any = sourcePlaybook.toObject();
      delete clonedData._id;
      delete clonedData.id;
      delete clonedData.created_at;
      delete clonedData.updated_at;

      const clonedPlaybook = new Playbook({
        ...clonedData,
        name: options.name || `${sourcePlaybook.name} (Copy)`,
        author: options.author || sourcePlaybook.author,
        is_prebuilt: false,
        status: 'draft',
        version: '1.0.0',
        execution_count: 0,
        success_count: 0,
        failure_count: 0,
        success_rate: 0,
      });

      await clonedPlaybook.save();
      logger.info('Playbook cloned', {
        source_id: playbookId,
        clone_id: clonedPlaybook.id,
      });

      return clonedPlaybook;
    } catch (error) {
      logger.error('Error cloning playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * List custom playbooks
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Custom playbooks
   */
  async listPlaybooks(filters: Record<string, any> = {}) {
    try {
      logger.info('Listing playbooks', filters);

      const query: Record<string, any> = {};

      if (filters.author) {
        query.author = filters.author;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.is_prebuilt !== undefined) {
        query.is_prebuilt = filters.is_prebuilt;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const playbooks = await Playbook.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 100)
        .select('-__v');

      logger.info('Playbooks retrieved', { count: playbooks.length });

      return playbooks;
    } catch (error) {
      logger.error('Error listing playbooks', { error: error.message });
      throw error;
    }
  }

  /**
   * Import playbook from JSON
   * @param {Object} playbookJson - Playbook JSON data
   * @param {Object} options - Import options
   * @returns {Promise<Object>} Imported playbook
   */
  async importPlaybook(playbookJson: any, options: Record<string, any> = {}) {
    try {
      logger.info('Importing playbook', { name: playbookJson.name });

      // Validate imported data
      if (!playbookJson.name || !playbookJson.actions) {
        throw new Error('Invalid playbook JSON');
      }

      // Check for existing playbook with same name
      if (!options.overwrite) {
        const existing = await Playbook.findOne({ name: playbookJson.name });
        if (existing) {
          throw new Error('Playbook with same name already exists');
        }
      }

      const playbookData = {
        ...playbookJson,
        author: options.author || 'imported',
        is_prebuilt: false,
        status: 'draft',
      };

      const playbook = await this.createPlaybook(playbookData);
      logger.info('Playbook imported', { id: playbook.id });

      return playbook;
    } catch (error) {
      logger.error('Error importing playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Export playbook to JSON
   * @param {string} playbookId - Playbook ID
   * @returns {Promise<Object>} Playbook JSON
   */
  async exportPlaybook(playbookId) {
    try {
      logger.info('Exporting playbook', { playbook_id: playbookId });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      const exportData: any = playbook.toObject();

      // Remove internal fields
      delete exportData._id;
      delete exportData.id;
      delete exportData.__v;
      delete exportData.created_at;
      delete exportData.updated_at;
      delete exportData.execution_count;
      delete exportData.success_count;
      delete exportData.failure_count;
      delete exportData.success_rate;
      delete exportData.last_executed_at;

      logger.info('Playbook exported', { playbook_id: playbookId });

      return exportData;
    } catch (error) {
      logger.error('Error exporting playbook', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate action order
   * @param {Array} actions - Actions to validate
   */
  validateActionOrder(actions) {
    if (!actions || actions.length === 0) {
      throw new Error('Playbook must have at least one action');
    }

    const orders = actions.map((a) => a.order).sort((a, b) => a - b);

    // Check for gaps or duplicates
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) {
        throw new Error(`Invalid action order. Expected ${i}, got ${orders[i]}`);
      }
    }
  }

  /**
   * Increment version number
   * @param {string} version - Current version
   * @returns {string} New version
   */
  incrementVersion(version) {
    const parts = version.split('.');
    parts[2] = String(parseInt(parts[2], 10) + 1);
    return parts.join('.');
  }
}

export default new PlaybookService();

