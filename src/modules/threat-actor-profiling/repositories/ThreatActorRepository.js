/**
 * Threat Actor Repository
 * Database operations for threat actors
 */

const ThreatActor = require('../models/ThreatActor');

class ThreatActorRepository {
  /**
   * Create a new threat actor
   */
  async create(actorData) {
    const actor = new ThreatActor(actorData);
    return await actor.save();
  }

  /**
   * Find threat actor by ID
   */
  async findById(id) {
    return await ThreatActor.findOne({ id });
  }

  /**
   * Find threat actor by name
   */
  async findByName(name) {
    return await ThreatActor.findOne({ name });
  }

  /**
   * Find threat actors by type
   */
  async findByType(type) {
    return await ThreatActor.find({ type });
  }

  /**
   * Find threat actors by status
   */
  async findByStatus(status) {
    return await ThreatActor.find({ status }).sort({ last_seen: -1 });
  }

  /**
   * Find threat actors by country
   */
  async findByCountry(country) {
    return await ThreatActor.find({ origin_country: country });
  }

  /**
   * Find threat actors by motivation
   */
  async findByMotivation(motivation) {
    return await ThreatActor.find({ motivation: motivation });
  }

  /**
   * List all threat actors with pagination
   */
  async list(filters = {}) {
    const {
      type,
      status,
      sophistication,
      motivation,
      country,
      search,
      limit = 50,
      skip = 0,
      sort = { updated_at: -1 }
    } = filters;

    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (sophistication) query.sophistication = sophistication;
    if (motivation) query.motivation = motivation;
    if (country) query.origin_country = country;
    if (search) {
      query.$text = { $search: search };
    }

    const actors = await ThreatActor.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await ThreatActor.countDocuments(query);

    return { actors, total, limit, skip };
  }

  /**
   * Update threat actor
   */
  async update(id, updateData) {
    return await ThreatActor.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Add alias to threat actor
   */
  async addAlias(id, alias) {
    return await ThreatActor.findOneAndUpdate(
      { id },
      { $addToSet: { aliases: alias } },
      { new: true }
    );
  }

  /**
   * Add TTP to threat actor
   */
  async addTTP(id, ttp) {
    return await ThreatActor.findOneAndUpdate(
      { id },
      { $push: { ttps: ttp } },
      { new: true }
    );
  }

  /**
   * Update last seen date
   */
  async updateLastSeen(id, date = new Date()) {
    return await ThreatActor.findOneAndUpdate(
      { id },
      { $set: { last_seen: date } },
      { new: true }
    );
  }

  /**
   * Add campaign reference
   */
  async addCampaign(id, campaignId) {
    return await ThreatActor.findOneAndUpdate(
      { id },
      { $addToSet: { campaigns: campaignId } },
      { new: true }
    );
  }

  /**
   * Add relationship
   */
  async addRelationship(id, relationship) {
    return await ThreatActor.findOneAndUpdate(
      { id },
      { $push: { relationships: relationship } },
      { new: true }
    );
  }

  /**
   * Update capability assessment
   */
  async updateCapabilityAssessment(id, assessment) {
    return await ThreatActor.findOneAndUpdate(
      { id },
      { $set: { capability_assessment: assessment } },
      { new: true }
    );
  }

  /**
   * Get actors by target industry
   */
  async findByTargetIndustry(industry) {
    return await ThreatActor.find({ 'targets.industries': industry });
  }

  /**
   * Get actors by target country
   */
  async findByTargetCountry(country) {
    return await ThreatActor.find({ 'targets.countries': country });
  }

  /**
   * Get recently active actors
   */
  async getRecentlyActive(days = 90) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return await ThreatActor.find({
      last_seen: { $gte: cutoffDate },
      status: 'active'
    }).sort({ last_seen: -1 });
  }

  /**
   * Get actors with specific sophistication level
   */
  async findBySophistication(level) {
    return await ThreatActor.find({ sophistication: level });
  }

  /**
   * Search actors by infrastructure
   */
  async searchByInfrastructure(indicator) {
    return await ThreatActor.find({
      $or: [
        { 'infrastructure.domains': indicator },
        { 'infrastructure.ips': indicator },
        { 'infrastructure.email_addresses': indicator }
      ]
    });
  }

  /**
   * Delete threat actor
   */
  async delete(id) {
    return await ThreatActor.findOneAndDelete({ id });
  }

  /**
   * Clear all threat actors (for testing)
   */
  async clear() {
    return await ThreatActor.deleteMany({});
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await ThreatActor.countDocuments();
    const byType = await ThreatActor.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const byStatus = await ThreatActor.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const bySophistication = await ThreatActor.aggregate([
      { $group: { _id: '$sophistication', count: { $sum: 1 } } }
    ]);

    return {
      total,
      by_type: byType,
      by_status: byStatus,
      by_sophistication: bySophistication
    };
  }
}

module.exports = new ThreatActorRepository();
