/**
 * Taxonomy Management Service
 * Handles custom threat taxonomy management
 */

const Taxonomy = require('../models/Taxonomy');
const logger = require('../utils/logger');

class TaxonomyService {
  /**
   * Create a new taxonomy
   * @param {Object} taxonomyData - Taxonomy data
   * @returns {Promise<Object>} Created taxonomy
   */
  async createTaxonomy(taxonomyData) {
    try {
      logger.info('Creating taxonomy', { name: taxonomyData.name });

      // Check if taxonomy with same name exists
      const existing = await Taxonomy.findOne({ name: taxonomyData.name });
      if (existing) {
        throw new Error('Taxonomy with this name already exists');
      }

      const taxonomy = new Taxonomy(taxonomyData);
      await taxonomy.save();

      logger.info('Taxonomy created successfully', { id: taxonomy.id });
      return taxonomy;
    } catch (error) {
      logger.error('Error creating taxonomy', { error: error.message });
      throw error;
    }
  }

  /**
   * Update an existing taxonomy
   * @param {string} taxonomyId - Taxonomy ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated taxonomy
   */
  async updateTaxonomy(taxonomyId, updateData) {
    try {
      logger.info('Updating taxonomy', { taxonomyId });

      const taxonomy = await Taxonomy.findOne({ id: taxonomyId });
      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      // Update fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] !== undefined && key !== 'id') {
          taxonomy[key] = updateData[key];
        }
      });

      // Increment version if categories changed
      if (updateData.categories) {
        const [major, minor, patch] = taxonomy.version.split('.').map(Number);
        taxonomy.version = `${major}.${minor}.${patch + 1}`;
      }

      await taxonomy.save();

      logger.info('Taxonomy updated successfully', { id: taxonomy.id });
      return taxonomy;
    } catch (error) {
      logger.error('Error updating taxonomy', { error: error.message });
      throw error;
    }
  }

  /**
   * Get a taxonomy by ID
   * @param {string} taxonomyId - Taxonomy ID
   * @returns {Promise<Object>} Taxonomy
   */
  async getTaxonomy(taxonomyId) {
    try {
      const taxonomy = await Taxonomy.findOne({ id: taxonomyId });
      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }
      return taxonomy;
    } catch (error) {
      logger.error('Error getting taxonomy', { error: error.message });
      throw error;
    }
  }

  /**
   * List all taxonomies
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Taxonomies
   */
  async listTaxonomies(filters = {}) {
    try {
      const query = {};

      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.is_default !== undefined) {
        query.is_default = filters.is_default;
      }

      const taxonomies = await Taxonomy.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 100);

      return taxonomies;
    } catch (error) {
      logger.error('Error listing taxonomies', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete a taxonomy
   * @param {string} taxonomyId - Taxonomy ID
   * @returns {Promise<boolean>} Deletion success
   */
  async deleteTaxonomy(taxonomyId) {
    try {
      logger.info('Deleting taxonomy', { taxonomyId });

      const taxonomy = await Taxonomy.findOne({ id: taxonomyId });
      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      if (taxonomy.is_default) {
        throw new Error('Cannot delete default taxonomy');
      }

      await Taxonomy.deleteOne({ id: taxonomyId });

      logger.info('Taxonomy deleted successfully', { taxonomyId });
      return true;
    } catch (error) {
      logger.error('Error deleting taxonomy', { error: error.message });
      throw error;
    }
  }

  /**
   * Add category to taxonomy
   * @param {string} taxonomyId - Taxonomy ID
   * @param {Object} categoryData - Category data
   * @returns {Promise<Object>} Updated taxonomy
   */
  async addCategory(taxonomyId, categoryData) {
    try {
      logger.info('Adding category to taxonomy', { taxonomyId, category: categoryData.name });

      const taxonomy = await Taxonomy.findOne({ id: taxonomyId });
      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      taxonomy.categories.push(categoryData);
      await taxonomy.save();

      logger.info('Category added successfully', { taxonomyId });
      return taxonomy;
    } catch (error) {
      logger.error('Error adding category', { error: error.message });
      throw error;
    }
  }

  /**
   * Remove category from taxonomy
   * @param {string} taxonomyId - Taxonomy ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<Object>} Updated taxonomy
   */
  async removeCategory(taxonomyId, categoryId) {
    try {
      logger.info('Removing category from taxonomy', { taxonomyId, categoryId });

      const taxonomy = await Taxonomy.findOne({ id: taxonomyId });
      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      taxonomy.categories = taxonomy.categories.filter(
        (cat) => cat.id !== categoryId,
      );
      await taxonomy.save();

      logger.info('Category removed successfully', { taxonomyId });
      return taxonomy;
    } catch (error) {
      logger.error('Error removing category', { error: error.message });
      throw error;
    }
  }

  /**
   * Map taxonomy to external framework
   * @param {string} taxonomyId - Taxonomy ID
   * @param {Object} mappingData - Mapping data
   * @returns {Promise<Object>} Updated taxonomy
   */
  async addFrameworkMapping(taxonomyId, mappingData) {
    try {
      logger.info('Adding framework mapping', { taxonomyId, framework: mappingData.framework });

      const taxonomy = await Taxonomy.findOne({ id: taxonomyId });
      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      taxonomy.mappings.push(mappingData);
      await taxonomy.save();

      logger.info('Framework mapping added successfully', { taxonomyId });
      return taxonomy;
    } catch (error) {
      logger.error('Error adding framework mapping', { error: error.message });
      throw error;
    }
  }

  /**
   * Export taxonomy
   * @param {string} taxonomyId - Taxonomy ID
   * @param {string} format - Export format (json, csv)
   * @returns {Promise<Object>} Exported data
   */
  async exportTaxonomy(taxonomyId, format = 'json') {
    try {
      const taxonomy = await Taxonomy.findOne({ id: taxonomyId });
      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      if (format === 'json') {
        return taxonomy.toObject();
      }

      // Add other format support as needed
      throw new Error(`Export format '${format}' not supported`);
    } catch (error) {
      logger.error('Error exporting taxonomy', { error: error.message });
      throw error;
    }
  }

  /**
   * Import taxonomy
   * @param {Object} taxonomyData - Taxonomy data to import
   * @returns {Promise<Object>} Imported taxonomy
   */
  async importTaxonomy(taxonomyData) {
    try {
      logger.info('Importing taxonomy', { name: taxonomyData.name });

      // Check for existing taxonomy
      const existing = await Taxonomy.findOne({ name: taxonomyData.name });
      if (existing) {
        // Update version
        const [major] = existing.version.split('.').map(Number);
        taxonomyData.version = `${major + 1}.0.0`;
        taxonomyData.name = `${taxonomyData.name} (Imported)`;
      }

      const taxonomy = new Taxonomy(taxonomyData);
      await taxonomy.save();

      logger.info('Taxonomy imported successfully', { id: taxonomy.id });
      return taxonomy;
    } catch (error) {
      logger.error('Error importing taxonomy', { error: error.message });
      throw error;
    }
  }
}

module.exports = new TaxonomyService();
