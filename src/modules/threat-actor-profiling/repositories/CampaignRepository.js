/**
 * Campaign Repository
 * Database operations for campaigns
 */

const Campaign = require('../models/Campaign');

class CampaignRepository {
  /**
   * Create a new campaign
   */
  async create(campaignData) {
    const campaign = new Campaign(campaignData);
    return await campaign.save();
  }

  /**
   * Find campaign by ID
   */
  async findById(id) {
    return await Campaign.findOne({ id });
  }

  /**
   * Find campaigns by threat actor
   */
  async findByThreatActorId(actorId) {
    return await Campaign.find({ threat_actor_id: actorId }).sort({ start_date: -1 });
  }

  /**
   * Find campaigns by status
   */
  async findByStatus(status) {
    return await Campaign.find({ status }).sort({ start_date: -1 });
  }

  /**
   * List all campaigns with pagination
   */
  async list(filters = {}) {
    const {
      threat_actor_id,
      status,
      industry,
      country,
      search,
      limit = 50,
      skip = 0,
      sort = { start_date: -1 }
    } = filters;

    const query = {};

    if (threat_actor_id) query.threat_actor_id = threat_actor_id;
    if (status) query.status = status;
    if (industry) query['targets.industries'] = industry;
    if (country) query['targets.countries'] = country;
    if (search) {
      query.$text = { $search: search };
    }

    const campaigns = await Campaign.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Campaign.countDocuments(query);

    return { campaigns, total, limit, skip };
  }

  /**
   * Update campaign
   */
  async update(id, updateData) {
    return await Campaign.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Add TTP to campaign
   */
  async addTTP(id, ttp) {
    return await Campaign.findOneAndUpdate(
      { id },
      { $push: { ttps: ttp } },
      { new: true }
    );
  }

  /**
   * Add target organization
   */
  async addTargetOrganization(id, organization) {
    return await Campaign.findOneAndUpdate(
      { id },
      { $push: { 'targets.organizations': organization } },
      { new: true }
    );
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent(id, event) {
    return await Campaign.findOneAndUpdate(
      { id },
      { $push: { timeline_events: event } },
      { new: true }
    );
  }

  /**
   * Link campaigns
   */
  async linkCampaigns(id, linkedCampaign) {
    return await Campaign.findOneAndUpdate(
      { id },
      { $push: { linked_campaigns: linkedCampaign } },
      { new: true }
    );
  }

  /**
   * Get active campaigns
   */
  async getActiveCampaigns() {
    return await Campaign.find({
      $or: [{ status: 'active' }, { status: 'ongoing' }]
    }).sort({ start_date: -1 });
  }

  /**
   * Get campaigns by date range
   */
  async findByDateRange(startDate, endDate) {
    return await Campaign.find({
      start_date: { $gte: startDate, $lte: endDate }
    }).sort({ start_date: -1 });
  }

  /**
   * Find campaigns by target industry
   */
  async findByTargetIndustry(industry) {
    return await Campaign.find({ 'targets.industries': industry });
  }

  /**
   * Find campaigns by target country
   */
  async findByTargetCountry(country) {
    return await Campaign.find({ 'targets.countries': country });
  }

  /**
   * Delete campaign
   */
  async delete(id) {
    return await Campaign.findOneAndDelete({ id });
  }

  /**
   * Clear all campaigns (for testing)
   */
  async clear() {
    return await Campaign.deleteMany({});
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await Campaign.countDocuments();
    const byStatus = await Campaign.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byActor = await Campaign.aggregate([
      { $group: { _id: '$threat_actor_id', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      total,
      by_status: byStatus,
      top_actors: byActor
    };
  }
}

module.exports = new CampaignRepository();
