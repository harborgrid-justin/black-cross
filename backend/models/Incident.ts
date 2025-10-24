/**
 * Incident Model - Sequelize
 *
 * Represents security incidents within the Black-Cross threat intelligence platform.
 * This model manages the complete lifecycle of security incidents including detection,
 * assignment, tracking, and resolution. Incidents are indexed by status, severity,
 * and assigned user for efficient querying and reporting.
 *
 * @remarks
 * This model uses Sequelize TypeScript decorators for schema definition and
 * automatically handles timestamps (createdAt, updatedAt). The model supports
 * incident assignment to users through a foreign key relationship.
 *
 * @example
 * ```typescript
 * // Create a new incident
 * const incident = await Incident.create({
 *   title: 'Suspicious Network Activity',
 *   description: 'Unusual outbound traffic detected',
 *   severity: 'high',
 *   status: 'open',
 *   priority: 1,
 *   category: 'network',
 *   detectedAt: new Date(),
 * });
 *
 * // Update incident status
 * await incident.update({
 *   status: 'investigating',
 *   assignedToId: userId,
 * });
 *
 * // Resolve incident
 * await incident.update({
 *   status: 'resolved',
 *   resolvedAt: new Date(),
 * });
 * ```
 *
 * @see {@link User} for the assignee relationship
 */

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import User from './User';

/**
 * Database table configuration for security incidents.
 *
 * @remarks
 * - Table name: 'incidents'
 * - Uses snake_case for column names (underscored: true)
 * - Automatic timestamp management enabled
 * - Indexed fields: status, severity, assigned_to_id for query performance
 */
@Table({
  tableName: 'incidents',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['severity'] },
    { fields: ['assigned_to_id'] },
  ],
})
export default class Incident extends Model {
  /**
   * Unique identifier for the incident.
   *
   * @remarks
   * - Automatically generated UUID v4
   * - Primary key for the incidents table
   * - Immutable once created
   *
   * @type {string}
   */
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
    id!: string;

  /**
   * Brief title or name of the security incident.
   *
   * @remarks
   * - Required field (non-nullable)
   * - Should be concise and descriptive
   * - Examples: "Phishing Attack", "Data Breach", "Malware Detection"
   *
   * @type {string}
   */
  @AllowNull(false)
  @Column(DataType.STRING)
    title!: string;

  /**
   * Detailed description of the incident.
   *
   * @remarks
   * - Optional field for comprehensive incident details
   * - Can include technical findings, affected systems, and initial analysis
   * - Stored as TEXT for unlimited length
   *
   * @type {string | undefined}
   */
  @Column(DataType.TEXT)
    description?: string;

  /**
   * Severity level of the incident.
   *
   * @remarks
   * - Required field with default value: 'medium'
   * - Indexed for efficient filtering and sorting
   * - Common values: 'low', 'medium', 'high', 'critical'
   * - Determines urgency and resource allocation
   *
   * @type {string}
   * @default 'medium'
   */
  @Default('medium')
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
    severity!: string;

  /**
   * Current status of the incident in its lifecycle.
   *
   * @remarks
   * - Required field with default value: 'open'
   * - Indexed for efficient status-based queries
   * - Typical workflow: 'open' → 'investigating' → 'contained' → 'resolved' → 'closed'
   * - Additional states: 'pending', 'escalated', 'false_positive'
   *
   * @type {string}
   * @default 'open'
   */
  @Default('open')
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
    status!: string;

  /**
   * Priority level for incident handling.
   *
   * @remarks
   * - Required field with default value: 3
   * - Lower numbers indicate higher priority (1 = highest, 5 = lowest)
   * - Used for incident queue management and SLA tracking
   * - Priority may differ from severity (e.g., high severity but low business impact)
   *
   * @type {number}
   * @default 3
   */
  @Default(3)
  @AllowNull(false)
  @Column(DataType.INTEGER)
    priority!: number;

  /**
   * Category or type of the security incident.
   *
   * @remarks
   * - Optional classification field
   * - Examples: 'malware', 'phishing', 'data_breach', 'unauthorized_access',
   *   'ddos', 'insider_threat', 'network', 'application'
   * - Used for reporting and pattern analysis
   *
   * @type {string | undefined}
   */
  @Column(DataType.STRING)
    category?: string;

  /**
   * Foreign key reference to the User assigned to this incident.
   *
   * @remarks
   * - Optional field (incidents may be unassigned)
   * - References the User model's id (UUID)
   * - Indexed for efficient assignment-based queries
   * - Database column name: 'assigned_to_id'
   *
   * @type {string | undefined}
   * @see {@link User}
   */
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'assigned_to_id',
  })
    assignedToId?: string;

  /**
   * The User instance assigned to handle this incident.
   *
   * @remarks
   * - Sequelize BelongsTo relationship to User model
   * - Lazy-loaded by default (use include to eager load)
   * - Null if incident is unassigned
   * - Provides access to assignee details (name, email, role)
   *
   * @type {User | undefined}
   * @see {@link User}
   *
   * @example
   * ```typescript
   * // Eager load the assigned user
   * const incident = await Incident.findOne({
   *   where: { id: incidentId },
   *   include: [{ model: User, as: 'assignedTo' }]
   * });
   * console.log(incident.assignedTo?.username);
   * ```
   */
  @BelongsTo(() => User, 'assignedToId')
    assignedTo?: User;

  /**
   * Timestamp when the incident was first detected or reported.
   *
   * @remarks
   * - Required field for incident timeline tracking
   * - May differ from createdAt (e.g., incident detected yesterday, logged today)
   * - Used for metrics like time-to-detection and incident aging
   * - Database column name: 'detected_at'
   *
   * @type {Date}
   */
  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'detected_at',
  })
    detectedAt!: Date;

  /**
   * Timestamp when the incident was resolved.
   *
   * @remarks
   * - Optional field (null for open/in-progress incidents)
   * - Set when incident status changes to 'resolved' or 'closed'
   * - Used to calculate resolution time and SLA compliance
   * - Database column name: 'resolved_at'
   *
   * @type {Date | undefined}
   */
  @Column({
    type: DataType.DATE,
    field: 'resolved_at',
  })
    resolvedAt?: Date;

  /**
   * Timestamp when the incident record was created in the database.
   *
   * @remarks
   * - Automatically managed by Sequelize
   * - Immutable after creation
   * - Database column name: 'created_at'
   *
   * @type {Date}
   * @readonly
   */
  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
    createdAt!: Date;

  /**
   * Timestamp when the incident record was last updated.
   *
   * @remarks
   * - Automatically managed by Sequelize on every save/update
   * - Useful for tracking recent activity and cache invalidation
   * - Database column name: 'updated_at'
   *
   * @type {Date}
   * @readonly
   */
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
    updatedAt!: Date;
}
