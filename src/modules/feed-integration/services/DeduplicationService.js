/**
 * Deduplication Service
 *
 * Business logic for duplicate detection and deduplication
 */

const crypto = require('crypto');
const { feedItemRepository, feedSourceRepository } = require('../repositories');

class DeduplicationService {
  /**
   * Find duplicate of a feed item
   */
  async findDuplicate(item) {
    // Calculate hash if not present
    if (!item.hash) {
      item.hash = this.calculateHash(item);
    }

    // Check for exact hash match
    const exactMatch = await feedItemRepository.findByHash(item.hash);
    if (exactMatch) {
      return exactMatch;
    }

    // Check for fuzzy matches
    const fuzzyMatches = await this.findFuzzyMatches(item);
    if (fuzzyMatches.length > 0) {
      return fuzzyMatches[0];
    }

    return null;
  }

  /**
   * Calculate hash for deduplication
   */
  calculateHash(item) {
    const hashInput = JSON.stringify({
      type: item.type,
      indicator_type: item.indicator_type,
      value: this.normalizeValue(item.value),
      title: item.title
    });
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Normalize value for comparison
   */
  normalizeValue(value) {
    if (typeof value !== 'string') return value;

    // Convert to lowercase and remove whitespace
    value = value.toLowerCase().trim();

    // Remove common protocol prefixes for URLs
    value = value.replace(/^(https?:\/\/)?(www\.)?/, '');

    return value;
  }

  /**
   * Find fuzzy matches
   */
  async findFuzzyMatches(item) {
    const allItems = await feedItemRepository.findAll({
      type: item.type,
      indicator_type: item.indicator_type,
      limit: 10000
    });

    const matches = [];
    const normalizedValue = this.normalizeValue(item.value);

    for (const existingItem of allItems.data) {
      if (existingItem.id === item.id) continue;

      const existingNormalized = this.normalizeValue(existingItem.value);
      const similarity = this.calculateSimilarity(normalizedValue, existingNormalized);

      if (similarity >= 0.9) {
        matches.push({
          item: existingItem,
          similarity
        });
      }
    }

    // Sort by similarity descending
    matches.sort((a, b) => b.similarity - a.similarity);

    return matches.map((m) => m.item);
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Exact match
    if (str1 === str2) return 1;

    // Calculate Levenshtein distance
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);

    return 1 - (distance / maxLen);
  }

  /**
   * Deduplicate feed items
   */
  async deduplicateItems(filters = {}) {
    const items = await feedItemRepository.findAll({
      ...filters,
      is_duplicate: false,
      limit: 10000
    });

    const results = {
      total_checked: items.data.length,
      duplicates_found: 0,
      duplicates_marked: 0,
      errors: []
    };

    const processedHashes = new Set();
    const duplicateGroups = new Map();

    // Group items by hash
    for (const item of items.data) {
      if (!item.hash) {
        item.hash = this.calculateHash(item);
      }

      if (processedHashes.has(item.hash)) {
        results.duplicates_found++;

        // Get the group for this hash
        if (!duplicateGroups.has(item.hash)) {
          duplicateGroups.set(item.hash, []);
        }
        duplicateGroups.get(item.hash).push(item);
      } else {
        processedHashes.add(item.hash);
        duplicateGroups.set(item.hash, [item]);
      }
    }

    // Process duplicate groups
    for (const [hash, group] of duplicateGroups.entries()) {
      if (group.length > 1) {
        // Keep the first item as original, mark others as duplicates
        const original = group[0];

        for (let i = 1; i < group.length; i++) {
          try {
            group[i].markAsDuplicate(original.id);
            await feedItemRepository.update(group[i].id, group[i]);
            results.duplicates_marked++;
          } catch (error) {
            results.errors.push({
              item_id: group[i].id,
              error: error.message
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Get duplicate statistics
   */
  async getDuplicateStatistics() {
    const stats = await feedItemRepository.getStatistics();

    return {
      total_items: stats.total,
      unique_items: stats.unique_items,
      duplicates: stats.duplicates,
      deduplication_rate: stats.total > 0
        ? `${((stats.duplicates / stats.total) * 100).toFixed(2)}%`
        : '0%'
    };
  }

  /**
   * Get list of duplicates
   */
  async listDuplicates(filters = {}) {
    return await feedItemRepository.findAll({
      ...filters,
      is_duplicate: true
    });
  }

  /**
   * Merge duplicate items
   */
  async mergeDuplicates(duplicateId, originalId, mergeStrategy = 'keep_original') {
    const duplicate = await feedItemRepository.findById(duplicateId);
    const original = await feedItemRepository.findById(originalId);

    if (!duplicate || !original) {
      throw new Error('Duplicate or original item not found');
    }

    let merged = { ...original };

    switch (mergeStrategy) {
      case 'keep_original':
        // Keep original, just mark duplicate
        duplicate.markAsDuplicate(originalId);
        await feedItemRepository.update(duplicateId, duplicate);
        break;

      case 'merge_fields':
        // Merge fields from duplicate into original
        merged.tags = [...new Set([...original.tags, ...duplicate.tags])];
        merged.categories = [...new Set([...original.categories, ...duplicate.categories])];
        merged.confidence = Math.max(original.confidence, duplicate.confidence);

        if (duplicate.last_seen > original.last_seen) {
          merged.last_seen = duplicate.last_seen;
        }

        await feedItemRepository.update(originalId, merged);
        duplicate.markAsDuplicate(originalId);
        await feedItemRepository.update(duplicateId, duplicate);
        break;

      case 'prioritize_source':
        // Prioritize based on feed source reliability
        const dupSource = await feedSourceRepository.findById(duplicate.feed_source_id);
        const origSource = await feedSourceRepository.findById(original.feed_source_id);

        if (dupSource && origSource && dupSource.reliability_score > origSource.reliability_score) {
          // Use duplicate as primary
          merged = { ...duplicate };
          merged.id = originalId;
          await feedItemRepository.update(originalId, merged);
        }

        duplicate.markAsDuplicate(originalId);
        await feedItemRepository.update(duplicateId, duplicate);
        break;
    }

    return merged;
  }

  /**
   * Get deduplication report
   */
  async getDeduplicationReport() {
    const stats = await this.getDuplicateStatistics();
    const duplicates = await this.listDuplicates({ limit: 100 });

    return {
      summary: stats,
      recent_duplicates: duplicates.data.map((d) => ({
        id: d.id,
        value: d.value,
        type: d.type,
        duplicate_of: d.duplicate_of,
        created_at: d.created_at
      })),
      recommendations: this.generateRecommendations(stats)
    };
  }

  /**
   * Generate deduplication recommendations
   */
  generateRecommendations(stats) {
    const recommendations = [];

    const dupRate = parseFloat(stats.deduplication_rate);

    if (dupRate > 20) {
      recommendations.push({
        level: 'high',
        message: 'High duplicate rate detected. Consider reviewing feed sources for overlapping coverage.'
      });
    }

    if (dupRate > 10) {
      recommendations.push({
        level: 'medium',
        message: 'Moderate duplicate rate. Regular deduplication is recommended.'
      });
    }

    if (stats.duplicates > 1000) {
      recommendations.push({
        level: 'high',
        message: 'Large number of duplicates. Run batch deduplication to clean up.'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        level: 'info',
        message: 'Deduplication rate is healthy. Continue monitoring.'
      });
    }

    return recommendations;
  }
}

module.exports = new DeduplicationService();
