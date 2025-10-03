/**
 * Threat Actor Profiling Repositories
 */

const threatActorRepository = require('./ThreatActorRepository');
const campaignRepository = require('./CampaignRepository');
const attributionRepository = require('./AttributionRepository');

module.exports = {
  threatActorRepository,
  campaignRepository,
  attributionRepository
};
