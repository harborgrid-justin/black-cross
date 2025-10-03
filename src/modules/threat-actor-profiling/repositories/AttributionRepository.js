/**
 * Attribution Repository
 * Database operations for attribution analysis
 */

const Attribution = require('../models/Attribution');

class AttributionRepository {
  /**
   * Create a new attribution
   */
  async create(attributionData) {
    const attribution = new Attribution(attributionData);
    return await attribution.save();
  }

  /**
   * Find attribution by ID
   */
  async findById(id) {
    return await Attribution.findOne({ id });
  }

  /**
   * Find attribution by incident ID
   */
  async findByIncidentId(incidentId) {
    return await Attribution.findOne({ incident_id: incidentId });
  }

  /**
   * Find attributions by actor ID
   */
  async findByActorId(actorId) {
    return await Attribution.find({
      'attributed_actors.actor_id': actorId
    }).sort({ incident_date: -1 });
  }

  /**
   * List all attributions with pagination
   */
  async list(filters = {}) {
    const {
      actor_id,
      verification_status,
      min_confidence,
      limit = 50,
      skip = 0,
      sort = { incident_date: -1 }
    } = filters;

    const query = {};

    if (actor_id) query['attributed_actors.actor_id'] = actor_id;
    if (verification_status) query.verification_status = verification_status;
    if (min_confidence) query.overall_confidence = { $gte: min_confidence };

    const attributions = await Attribution.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Attribution.countDocuments(query);

    return { attributions, total, limit, skip };
  }

  /**
   * Update attribution
   */
  async update(id, updateData) {
    return await Attribution.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update verification status
   */
  async updateVerificationStatus(id, status, verifiedBy) {
    return await Attribution.findOneAndUpdate(
      { id },
      {
        $set: {
          verification_status: status,
          verified_by: verifiedBy,
          verification_date: new Date()
        }
      },
      { new: true }
    );
  }

  /**
   * Add attributed actor
   */
  async addAttributedActor(id, actor) {
    return await Attribution.findOneAndUpdate(
      { id },
      { $push: { attributed_actors: actor } },
      { new: true }
    );
  }

  /**
   * Get high confidence attributions
   */
  async getHighConfidenceAttributions(minConfidence = 75) {
    return await Attribution.find({
      overall_confidence: { $gte: minConfidence }
    }).sort({ overall_confidence: -1 });
  }

  /**
   * Get recent attributions
   */
  async getRecentAttributions(days = 30) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await Attribution.find({
      incident_date: { $gte: cutoffDate }
    }).sort({ incident_date: -1 });
  }

  /**
   * Delete attribution
   */
  async delete(id) {
    return await Attribution.findOneAndDelete({ id });
  }

  /**
   * Clear all attributions (for testing)
   */
  async clear() {
    return await Attribution.deleteMany({});
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await Attribution.countDocuments();
    const byVerificationStatus = await Attribution.aggregate([
      { $group: { _id: '$verification_status', count: { $sum: 1 } } }
    ]);
    const avgConfidence = await Attribution.aggregate([
      { $group: { _id: null, avg_confidence: { $avg: '$overall_confidence' } } }
    ]);
    const byMethod = await Attribution.aggregate([
      { $group: { _id: '$analysis_method', count: { $sum: 1 } } }
    ]);

    return {
      total,
      by_verification_status: byVerificationStatus,
      average_confidence: avgConfidence[0]?.avg_confidence || 0,
      by_method: byMethod
    };
  }
}

module.exports = new AttributionRepository();
