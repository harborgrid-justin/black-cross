/**
 * ThreatActor Service Module
 *
 * Production-grade service layer implementing business logic for threat actor
 * intelligence and tracking. This service acts as an intermediary between the
 * controller layer and the data access layer (repository), providing a clean
 * separation of concerns and encapsulating domain-specific operations.
 *
 * The service follows the repository pattern with Sequelize ORM for data
 * persistence and provides comprehensive threat actor management capabilities
 * including CRUD operations, filtering, searching, and statistical analysis.
 *
 * @module services/ThreatActorService
 * @see {@link ThreatActorRepository} for data access implementation
 * @see {@link ThreatActor} for model definition
 * @since 1.0.0
 */

import { threatActorRepository } from '../repositories';
import type { ThreatActor, ListFilters, PaginatedResponse } from '../repositories';

/**
 * ThreatActorService class providing business logic for threat actor operations.
 *
 * This service handles all threat actor-related business operations including:
 * - Creating and managing threat actor profiles
 * - Querying threat actors by various attributes (name, alias, sophistication, etc.)
 * - Tracking threat actor activity and timestamps
 * - Generating statistical reports and analytics
 * - Managing threat actor metadata and relationships
 *
 * All methods are asynchronous and interact with the database through the
 * ThreatActorRepository, providing a clean abstraction over data access logic.
 *
 * @class
 * @example
 * ```typescript
 * // Using the singleton instance
 * import { threatActorService } from './services/ThreatActorService';
 *
 * const actor = await threatActorService.create({
 *   name: 'APT28',
 *   aliases: ['Fancy Bear', 'Sofacy'],
 *   sophistication: 'advanced',
 *   motivation: ['espionage', 'political'],
 *   country: 'Russia'
 * });
 * ```
 */
export class ThreatActorService {
  /**
   * Creates a new threat actor profile in the database.
   *
   * This method initializes default values for array fields (aliases, motivation, tags)
   * if not provided, ensuring consistent data structure. The threat actor's name must be
   * unique across the system.
   *
   * @async
   * @param {Object} data - Threat actor data for creation
   * @param {string} data.name - Unique name identifier for the threat actor (required)
   * @param {string[]} [data.aliases=[]] - Alternative names or aliases for the threat actor
   * @param {string} [data.description] - Detailed description of the threat actor's activities and characteristics
   * @param {string} [data.sophistication] - Sophistication level (e.g., 'novice', 'intermediate', 'advanced', 'expert')
   * @param {string[]} [data.motivation=[]] - Motivations driving the threat actor (e.g., 'financial', 'espionage', 'political', 'hacktivism')
   * @param {Date} [data.firstSeen] - Timestamp when the threat actor was first observed
   * @param {Date} [data.lastSeen] - Timestamp when the threat actor was last observed
   * @param {string} [data.country] - Country or region associated with the threat actor
   * @param {string[]} [data.tags=[]] - Categorization tags for organization and filtering
   * @param {any} [data.metadata] - Additional flexible metadata stored as JSONB
   * @returns {Promise<ThreatActor>} Promise resolving to the newly created threat actor record
   * @throws {Error} Throws if name already exists (unique constraint violation)
   * @throws {Error} Throws if database operation fails
   *
   * @example
   * ```typescript
   * // Create a sophisticated nation-state actor
   * const apt28 = await threatActorService.create({
   *   name: 'APT28',
   *   aliases: ['Fancy Bear', 'Sofacy', 'Pawn Storm'],
   *   description: 'Russian state-sponsored cyber espionage group',
   *   sophistication: 'advanced',
   *   motivation: ['espionage', 'political'],
   *   country: 'Russia',
   *   tags: ['state-sponsored', 'APT'],
   *   firstSeen: new Date('2007-01-01'),
   *   metadata: {
   *     attribution: 'high-confidence',
   *     affiliation: 'GRU'
   *   }
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Create with minimal required data (defaults applied automatically)
   * const newActor = await threatActorService.create({
   *   name: 'Unknown Actor 2023-001'
   * });
   * // Result will have aliases: [], motivation: [], tags: []
   * ```
   */
  async create(data: {
    name: string;
    aliases?: string[];
    description?: string;
    sophistication?: string;
    motivation?: string[];
    firstSeen?: Date;
    lastSeen?: Date;
    country?: string;
    tags?: string[];
    metadata?: any;
  }): Promise<ThreatActor> {
    // Set defaults
    if (!data.aliases) {
      data.aliases = [];
    }
    if (!data.motivation) {
      data.motivation = [];
    }
    if (!data.tags) {
      data.tags = [];
    }

    return await threatActorRepository.create(data);
  }

  /**
   * Retrieves a threat actor by their unique identifier.
   *
   * This method fetches a complete threat actor record using the UUID primary key.
   * It throws an error if the threat actor is not found, ensuring explicit error
   * handling at the caller level.
   *
   * @async
   * @param {string} id - UUID of the threat actor to retrieve
   * @returns {Promise<ThreatActor>} Promise resolving to the threat actor record
   * @throws {Error} Throws with message 'ThreatActor with id {id} not found' if not found
   * @throws {Error} Throws if database operation fails
   *
   * @example
   * ```typescript
   * try {
   *   const actor = await threatActorService.getById('550e8400-e29b-41d4-a716-446655440000');
   *   console.log(`Found: ${actor.name}`);
   * } catch (error) {
   *   console.error('Threat actor not found');
   * }
   * ```
   */
  async getById(id: string): Promise<ThreatActor> {
    return await threatActorRepository.findByIdOrThrow(id);
  }

  /**
   * Retrieves a threat actor by their unique name.
   *
   * This method performs a case-sensitive lookup by the threat actor's primary name.
   * Returns null if no matching threat actor is found, allowing for graceful handling
   * of non-existent records without throwing exceptions.
   *
   * @async
   * @param {string} name - Exact name of the threat actor (case-sensitive)
   * @returns {Promise<ThreatActor | null>} Promise resolving to the threat actor record or null if not found
   *
   * @example
   * ```typescript
   * const apt28 = await threatActorService.getByName('APT28');
   * if (apt28) {
   *   console.log(`Sophistication: ${apt28.sophistication}`);
   * } else {
   *   console.log('Threat actor not found');
   * }
   * ```
   */
  async getByName(name: string): Promise<ThreatActor | null> {
    return await threatActorRepository.findByName(name);
  }

  /**
   * Lists threat actors with pagination, sorting, and filtering capabilities.
   *
   * This method provides flexible querying of threat actors with support for
   * pagination, sorting by any field, and filtering by multiple criteria. It
   * returns a paginated response with metadata for building user interfaces.
   *
   * @async
   * @param {ListFilters} [filters={}] - Query filters and pagination options
   * @param {number} [filters.page=1] - Page number (1-based indexing)
   * @param {number} [filters.pageSize=20] - Number of records per page
   * @param {string} [filters.sortBy='createdAt'] - Field name to sort by
   * @param {'asc' | 'desc'} [filters.sortOrder='desc'] - Sort direction
   * @param {string} [filters.search] - Search term (implementation depends on repository)
   * @returns {Promise<PaginatedResponse<ThreatActor>>} Promise resolving to paginated results with metadata
   * @returns {ThreatActor[]} returns.data - Array of threat actor records for the current page
   * @returns {number} returns.total - Total count of records matching filters
   * @returns {number} returns.page - Current page number
   * @returns {number} returns.pageSize - Records per page
   * @returns {number} returns.totalPages - Total number of pages
   * @returns {boolean} returns.hasNext - Whether there is a next page
   * @returns {boolean} returns.hasPrev - Whether there is a previous page
   *
   * @example
   * ```typescript
   * // Get first page with default settings
   * const response = await threatActorService.list();
   * console.log(`Found ${response.total} threat actors`);
   * console.log(`Page ${response.page} of ${response.totalPages}`);
   * ```
   *
   * @example
   * ```typescript
   * // Advanced filtering with pagination and sorting
   * const response = await threatActorService.list({
   *   page: 2,
   *   pageSize: 50,
   *   sortBy: 'name',
   *   sortOrder: 'asc',
   *   country: 'Russia',
   *   sophistication: 'advanced'
   * });
   *
   * response.data.forEach(actor => {
   *   console.log(`${actor.name} - ${actor.sophistication}`);
   * });
   *
   * if (response.hasNext) {
   *   console.log('More results available');
   * }
   * ```
   */
  async list(filters: ListFilters = {}): Promise<PaginatedResponse<ThreatActor>> {
    return await threatActorRepository.list(filters);
  }

  /**
   * Lists all threat actors that have a specific alias.
   *
   * This method searches through the aliases array field to find threat actors
   * known by a particular alternative name. Useful for cross-referencing when
   * threat actors are known by multiple identities across different sources.
   *
   * @async
   * @param {string} alias - The alias name to search for (case-sensitive)
   * @returns {Promise<ThreatActor[]>} Promise resolving to array of matching threat actors
   *
   * @example
   * ```typescript
   * // Find all actors known as "Fancy Bear"
   * const actors = await threatActorService.listByAlias('Fancy Bear');
   * console.log(`Found ${actors.length} threat actors with this alias`);
   * ```
   */
  async listByAlias(alias: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findByAlias(alias);
  }

  /**
   * Lists all threat actors with a specific sophistication level.
   *
   * Filters threat actors by their technical capability and operational maturity.
   * Common sophistication levels include 'novice', 'intermediate', 'advanced', and 'expert'.
   * This is useful for threat prioritization and resource allocation.
   *
   * @async
   * @param {string} sophistication - The sophistication level to filter by
   * @returns {Promise<ThreatActor[]>} Promise resolving to array of matching threat actors
   *
   * @example
   * ```typescript
   * // Get all advanced persistent threats
   * const advancedActors = await threatActorService.listBySophistication('advanced');
   * console.log(`${advancedActors.length} advanced threat actors`);
   *
   * advancedActors.forEach(actor => {
   *   console.log(`${actor.name}: ${actor.country || 'Unknown origin'}`);
   * });
   * ```
   */
  async listBySophistication(sophistication: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findBySophistication(sophistication);
  }

  /**
   * Lists all threat actors with a specific motivation.
   *
   * Filters threat actors by their primary driving motivation. Since threat actors
   * can have multiple motivations, this method finds all actors where the specified
   * motivation is present in their motivation array. Common motivations include
   * 'financial', 'espionage', 'political', 'hacktivism', 'ideology', and 'revenge'.
   *
   * @async
   * @param {string} motivation - The motivation to filter by
   * @returns {Promise<ThreatActor[]>} Promise resolving to array of matching threat actors
   *
   * @example
   * ```typescript
   * // Find all financially motivated threat actors
   * const cybercriminals = await threatActorService.listByMotivation('financial');
   * console.log(`${cybercriminals.length} financially motivated actors`);
   * ```
   *
   * @example
   * ```typescript
   * // Find state-sponsored espionage groups
   * const spies = await threatActorService.listByMotivation('espionage');
   * const stateBacked = spies.filter(actor => actor.tags.includes('state-sponsored'));
   * ```
   */
  async listByMotivation(motivation: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findByMotivation(motivation);
  }

  /**
   * Lists all threat actors associated with a specific country.
   *
   * Filters threat actors by their country of origin, operation, or attribution.
   * This is particularly useful for geopolitical threat analysis and understanding
   * regional threat landscapes.
   *
   * @async
   * @param {string} country - The country name to filter by
   * @returns {Promise<ThreatActor[]>} Promise resolving to array of matching threat actors
   *
   * @example
   * ```typescript
   * // Get all Russian threat actors
   * const russianActors = await threatActorService.listByCountry('Russia');
   * console.log(`${russianActors.length} Russian threat actors`);
   *
   * // Analyze sophistication distribution
   * const sophisticationCounts = russianActors.reduce((acc, actor) => {
   *   acc[actor.sophistication || 'unknown'] = (acc[actor.sophistication || 'unknown'] || 0) + 1;
   *   return acc;
   * }, {} as Record<string, number>);
   * ```
   */
  async listByCountry(country: string): Promise<ThreatActor[]> {
    return await threatActorRepository.findByCountry(country);
  }

  /**
   * Lists threat actors that have been active within a specified time window.
   *
   * This method filters threat actors based on their lastSeen timestamp, returning
   * only those observed within the specified number of days. This is crucial for
   * identifying currently active threats and prioritizing security responses.
   *
   * @async
   * @param {number} [days=30] - Number of days to look back from current date (default: 30)
   * @returns {Promise<ThreatActor[]>} Promise resolving to array of recently active threat actors
   *
   * @example
   * ```typescript
   * // Get threat actors active in the last 7 days
   * const recentThreats = await threatActorService.listRecentlyActive(7);
   * console.log(`${recentThreats.length} threat actors active this week`);
   * ```
   *
   * @example
   * ```typescript
   * // Monitor high-sophistication actors from the last 24 hours
   * const last24h = await threatActorService.listRecentlyActive(1);
   * const criticalThreats = last24h.filter(actor =>
   *   actor.sophistication === 'advanced' || actor.sophistication === 'expert'
   * );
   * console.log(`ALERT: ${criticalThreats.length} advanced actors active today`);
   * ```
   */
  async listRecentlyActive(days: number = 30): Promise<ThreatActor[]> {
    return await threatActorRepository.findRecentlyActive(days);
  }

  /**
   * Lists threat actors that have all of the specified tags.
   *
   * This method performs an AND search, returning only threat actors that have
   * ALL of the provided tags. Tags are used for categorization, classification,
   * and organizing threat actors by various attributes like TTP (Tactics, Techniques,
   * and Procedures), campaigns, or custom organizational schemes.
   *
   * @async
   * @param {string[]} tags - Array of tag names that must all be present
   * @returns {Promise<ThreatActor[]>} Promise resolving to array of matching threat actors
   *
   * @example
   * ```typescript
   * // Find APT groups focused on healthcare
   * const healthcareAPTs = await threatActorService.listByTags(['APT', 'healthcare']);
   * console.log(`${healthcareAPTs.length} APT groups targeting healthcare`);
   * ```
   *
   * @example
   * ```typescript
   * // Complex tag-based analysis
   * const ransomwareActors = await threatActorService.listByTags(['ransomware', 'active']);
   * const sophisticatedRansomware = ransomwareActors.filter(actor =>
   *   actor.sophistication === 'advanced'
   * );
   *
   * console.log(`Found ${sophisticatedRansomware.length} sophisticated ransomware groups:`);
   * sophisticatedRansomware.forEach(actor => {
   *   console.log(`- ${actor.name} (${actor.country || 'Unknown'})`);
   * });
   * ```
   */
  async listByTags(tags: string[]): Promise<ThreatActor[]> {
    return await threatActorRepository.findByTags(tags);
  }

  /**
   * Updates an existing threat actor with partial data.
   *
   * This method allows for partial updates of threat actor records, modifying only
   * the fields provided in the updates object. All other fields remain unchanged.
   * The method validates that the threat actor exists before attempting the update.
   *
   * @async
   * @param {string} id - UUID of the threat actor to update
   * @param {Partial<ThreatActor>} updates - Object containing fields to update (can be partial)
   * @returns {Promise<ThreatActor>} Promise resolving to the updated threat actor record
   * @throws {Error} Throws with message 'ThreatActor with id {id} not found' if actor doesn't exist
   * @throws {Error} Throws if database operation fails
   * @throws {Error} Throws if unique constraint is violated (e.g., duplicate name)
   *
   * @example
   * ```typescript
   * // Update sophistication level after new intelligence
   * const updated = await threatActorService.update(
   *   '550e8400-e29b-41d4-a716-446655440000',
   *   { sophistication: 'expert' }
   * );
   * console.log(`Updated ${updated.name} to expert level`);
   * ```
   *
   * @example
   * ```typescript
   * // Add new aliases and tags
   * const actor = await threatActorService.update(actorId, {
   *   aliases: [...existingActor.aliases, 'New Alias'],
   *   tags: [...existingActor.tags, 'ransomware', 'healthcare-targeting'],
   *   lastSeen: new Date()
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Update metadata with new attribution information
   * await threatActorService.update(actorId, {
   *   metadata: {
   *     ...existingMetadata,
   *     attribution: 'confirmed',
   *     confidence: 'high',
   *     sources: ['threat-intel-feed-1', 'threat-intel-feed-2']
   *   }
   * });
   * ```
   */
  async update(id: string, updates: Partial<ThreatActor>): Promise<ThreatActor> {
    return await threatActorRepository.update(id, updates);
  }

  /**
   * Updates the lastSeen timestamp for a threat actor to the current time.
   *
   * This convenience method is used to quickly mark a threat actor as recently
   * observed without requiring the caller to provide the current timestamp. This
   * is useful for tracking threat actor activity patterns and identifying active threats.
   *
   * @async
   * @param {string} id - UUID of the threat actor to update
   * @returns {Promise<ThreatActor>} Promise resolving to the updated threat actor record
   * @throws {Error} Throws with message 'ThreatActor with id {id} not found' if actor doesn't exist
   * @throws {Error} Throws if database operation fails
   *
   * @example
   * ```typescript
   * // Mark threat actor as seen when processing new IOCs
   * const actor = await threatActorService.updateLastSeen(actorId);
   * console.log(`${actor.name} last seen: ${actor.lastSeen}`);
   * ```
   *
   * @example
   * ```typescript
   * // Automated activity tracking
   * async function processSecurityAlert(alert: SecurityAlert) {
   *   if (alert.threatActorId) {
   *     await threatActorService.updateLastSeen(alert.threatActorId);
   *     console.log('Updated threat actor activity timestamp');
   *   }
   * }
   * ```
   */
  async updateLastSeen(id: string): Promise<ThreatActor> {
    return await threatActorRepository.updateLastSeen(id);
  }

  /**
   * Permanently deletes a threat actor from the database.
   *
   * This is a destructive operation that permanently removes the threat actor record.
   * Use with caution as this action cannot be undone. Consider implementing soft deletes
   * or archiving for production systems where audit trails are important.
   *
   * @async
   * @param {string} id - UUID of the threat actor to delete
   * @returns {Promise<void>} Promise resolving when deletion is complete
   * @throws {Error} Throws with message 'ThreatActor with id {id} not found' if actor doesn't exist
   * @throws {Error} Throws if database operation fails
   * @throws {Error} May throw if foreign key constraints prevent deletion
   *
   * @example
   * ```typescript
   * // Delete a false positive or duplicate entry
   * try {
   *   await threatActorService.delete('550e8400-e29b-41d4-a716-446655440000');
   *   console.log('Threat actor deleted successfully');
   * } catch (error) {
   *   console.error('Failed to delete:', error.message);
   * }
   * ```
   *
   * @remarks
   * **Warning**: This permanently deletes the record. In production systems,
   * consider using a soft delete pattern or moving records to an archive table
   * to maintain audit trails and enable data recovery.
   */
  async delete(id: string): Promise<void> {
    return await threatActorRepository.delete(id);
  }

  /**
   * Retrieves comprehensive statistical analysis of threat actors in the database.
   *
   * This method generates aggregate statistics useful for dashboards, reporting,
   * and threat landscape analysis. It provides counts and distributions across
   * multiple dimensions including total actors, geographic distribution,
   * sophistication levels, and recent activity.
   *
   * @async
   * @returns {Promise<Object>} Promise resolving to statistics object
   * @returns {number} returns.total - Total number of threat actors in the database
   * @returns {Record<string, number>} returns.byCountry - Count of threat actors per country (key: country name, value: count)
   * @returns {Record<string, number>} returns.bySophistication - Count of threat actors per sophistication level (key: level, value: count)
   * @returns {number} returns.recentlyActive - Count of threat actors active in the last 30 days
   *
   * @example
   * ```typescript
   * // Generate threat landscape overview
   * const stats = await threatActorService.getStatistics();
   *
   * console.log(`Total Threat Actors: ${stats.total}`);
   * console.log(`Recently Active: ${stats.recentlyActive}`);
   *
   * console.log('\nBy Country:');
   * Object.entries(stats.byCountry)
   *   .sort(([, a], [, b]) => b - a)
   *   .forEach(([country, count]) => {
   *     console.log(`  ${country}: ${count}`);
   *   });
   *
   * console.log('\nBy Sophistication:');
   * Object.entries(stats.bySophistication).forEach(([level, count]) => {
   *   console.log(`  ${level}: ${count}`);
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Use statistics for dashboard metrics
   * const stats = await threatActorService.getStatistics();
   * const activityRate = (stats.recentlyActive / stats.total * 100).toFixed(1);
   * console.log(`Activity Rate: ${activityRate}% of actors active in last 30 days`);
   *
   * // Identify most common sophistication level
   * const topSophistication = Object.entries(stats.bySophistication)
   *   .reduce((a, b) => a[1] > b[1] ? a : b)[0];
   * console.log(`Most common sophistication: ${topSophistication}`);
   * ```
   */
  async getStatistics(): Promise<{
    total: number;
    byCountry: Record<string, number>;
    bySophistication: Record<string, number>;
    recentlyActive: number;
  }> {
    return await threatActorRepository.getStatistics();
  }

  /**
   * Checks whether a threat actor with the specified ID exists in the database.
   *
   * This is a lightweight existence check that only queries for record count,
   * making it more efficient than fetching the full record when you only need
   * to verify existence. Useful for validation and conditional logic.
   *
   * @async
   * @param {string} id - UUID of the threat actor to check
   * @returns {Promise<boolean>} Promise resolving to true if the threat actor exists, false otherwise
   *
   * @example
   * ```typescript
   * // Validate before performing operations
   * if (await threatActorService.exists(actorId)) {
   *   await threatActorService.updateLastSeen(actorId);
   * } else {
   *   console.log('Threat actor not found');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Conditional creation
   * const actorName = 'APT28';
   * const existing = await threatActorService.getByName(actorName);
   *
   * if (!existing) {
   *   await threatActorService.create({ name: actorName });
   * } else if (await threatActorService.exists(existing.id)) {
   *   await threatActorService.updateLastSeen(existing.id);
   * }
   * ```
   */
  async exists(id: string): Promise<boolean> {
    return await threatActorRepository.exists(id);
  }
}

/**
 * Singleton instance of ThreatActorService for convenient import and use.
 *
 * This pre-instantiated service instance follows the singleton pattern, ensuring
 * a single shared instance across the application. Use this for all threat actor
 * operations rather than creating new instances.
 *
 * @constant
 * @type {ThreatActorService}
 *
 * @example
 * ```typescript
 * // Named import (recommended)
 * import { threatActorService } from './services/ThreatActorService';
 *
 * const actors = await threatActorService.list();
 * ```
 *
 * @example
 * ```typescript
 * // Default import
 * import threatActorService from './services/ThreatActorService';
 *
 * const actor = await threatActorService.getById(actorId);
 * ```
 */
export const threatActorService = new ThreatActorService();

/**
 * Default export of the singleton ThreatActorService instance.
 *
 * @default
 */
export default threatActorService;
