/**
 * User Model - Sequelize TypeScript
 *
 * Represents a user account in the Black-Cross threat intelligence platform.
 * This model handles user authentication, authorization, and tracks user activity
 * across the system. Users can be assigned to incidents and their actions are
 * logged in audit trails.
 *
 * @remarks
 * - Uses UUID v4 for primary keys to avoid enumeration attacks
 * - Passwords should be hashed before storage (handled in service layer)
 * - Role-based access control (RBAC) through the `role` field
 * - Supports soft deletion through the `isActive` flag
 * - All database columns use snake_case naming convention
 *
 * @example
 * ```typescript
 * // Create a new user
 * const user = await User.create({
 *   email: 'analyst@example.com',
 *   username: 'jdoe',
 *   password: hashedPassword,
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   role: 'analyst',
 * });
 *
 * // Find user with relationships
 * const userWithIncidents = await User.findByPk(userId, {
 *   include: [{ model: Incident }, { model: AuditLog }],
 * });
 *
 * // Update last login timestamp
 * await user.update({ lastLogin: new Date() });
 * ```
 *
 * @see {@link Incident} for user-incident relationships
 * @see {@link AuditLog} for user activity tracking
 */

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import Incident from './Incident';
import AuditLog from './AuditLog';

/**
 * User database model for authentication and authorization.
 *
 * Extends Sequelize Model with TypeScript decorators for type-safe
 * database operations and schema definition.
 *
 * @class User
 * @extends {Model}
 *
 * @property {string} id - UUID v4 primary key
 * @property {string} email - Unique email address for authentication
 * @property {string} username - Unique username for login and display
 * @property {string} password - Hashed password (never store plaintext)
 * @property {string} [firstName] - User's first name (optional)
 * @property {string} [lastName] - User's last name (optional)
 * @property {string} role - User role for RBAC (e.g., 'admin', 'analyst', 'viewer')
 * @property {boolean} isActive - Account active status for soft deletion
 * @property {Date} [lastLogin] - Timestamp of most recent successful login
 * @property {Date} createdAt - Account creation timestamp (auto-managed)
 * @property {Date} updatedAt - Last modification timestamp (auto-managed)
 * @property {Incident[]} [incidents] - Incidents assigned to this user
 * @property {AuditLog[]} [auditLogs] - Audit trail of user actions
 */
@Table({
  tableName: 'users',
  underscored: true,
  timestamps: true,
})
export default class User extends Model {
  /**
   * Unique identifier for the user account.
   *
   * Auto-generated UUID v4 string used as the primary key. UUIDs are preferred
   * over auto-incrementing integers to prevent user enumeration attacks and
   * to facilitate distributed systems and data migration.
   *
   * @type {string}
   * @readonly Primary key, managed by database
   *
   * @example
   * ```typescript
   * console.log(user.id); // "550e8400-e29b-41d4-a716-446655440000"
   * ```
   */
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
    id!: string;

  /**
   * User's email address for authentication and communication.
   *
   * Must be unique across all users. Used for login, password recovery,
   * and system notifications. Should be validated for proper email format
   * at the application layer before persistence.
   *
   * @type {string}
   * @required
   *
   * @remarks
   * - Enforced as unique at database level with unique index
   * - Cannot be null
   * - Recommended to store in lowercase for case-insensitive comparisons
   * - Database column: `email`
   *
   * @example
   * ```typescript
   * const user = await User.findOne({ where: { email: 'analyst@example.com' } });
   * ```
   */
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
    email!: string;

  /**
   * Unique username for user identification and login.
   *
   * Human-readable identifier used for authentication and display purposes.
   * Must be unique across all users. Typically used in audit logs and
   * UI displays instead of email addresses.
   *
   * @type {string}
   * @required
   *
   * @remarks
   * - Enforced as unique at database level with unique index
   * - Cannot be null
   * - Consider enforcing alphanumeric constraints at application layer
   * - Database column: `username`
   *
   * @example
   * ```typescript
   * const user = await User.findOne({ where: { username: 'jdoe' } });
   * ```
   */
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
    username!: string;

  /**
   * User's hashed password for authentication.
   *
   * CRITICAL: This field must NEVER store plaintext passwords. Always hash
   * passwords using bcrypt or similar before storage. The service layer
   * is responsible for password hashing and verification.
   *
   * @type {string}
   * @required
   *
   * @remarks
   * - MUST be hashed with bcrypt (recommended rounds: 10-12)
   * - Never return this field in API responses
   * - Cannot be null
   * - Database column: `password`
   *
   * @example
   * ```typescript
   * import bcrypt from 'bcrypt';
   *
   * // Hashing password before storage
   * const hashedPassword = await bcrypt.hash(plainPassword, 10);
   * await User.create({ password: hashedPassword, ... });
   *
   * // Verifying password
   * const isValid = await bcrypt.compare(plainPassword, user.password);
   * ```
   *
   * @see {@link https://www.npmjs.com/package/bcrypt} for bcrypt documentation
   */
  @AllowNull(false)
  @Column(DataType.STRING)
    password!: string;

  /**
   * User's first name (given name).
   *
   * Optional field for personalization and display purposes. Used in
   * user profiles, greetings, and report generation.
   *
   * @type {string | undefined}
   * @optional
   *
   * @remarks
   * - Database column: `first_name` (snake_case)
   * - Can be null or undefined
   * - No default value
   *
   * @example
   * ```typescript
   * const fullName = `${user.firstName} ${user.lastName}`.trim();
   * ```
   */
  @Column({
    type: DataType.STRING,
    field: 'first_name',
  })
    firstName?: string;

  /**
   * User's last name (family name).
   *
   * Optional field for personalization and display purposes. Used in
   * user profiles, greetings, and report generation.
   *
   * @type {string | undefined}
   * @optional
   *
   * @remarks
   * - Database column: `last_name` (snake_case)
   * - Can be null or undefined
   * - No default value
   *
   * @example
   * ```typescript
   * const displayName = user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
   * ```
   */
  @Column({
    type: DataType.STRING,
    field: 'last_name',
  })
    lastName?: string;

  /**
   * User's role for Role-Based Access Control (RBAC).
   *
   * Determines the user's permissions and access level within the platform.
   * Common roles include 'admin', 'analyst', 'viewer', and 'manager'.
   * Role permissions are enforced by authorization middleware.
   *
   * @type {string}
   * @default 'analyst'
   * @required
   *
   * @remarks
   * - Defaults to 'analyst' for new users
   * - Cannot be null
   * - Should be validated against allowed roles at application layer
   * - Database column: `role`
   * - Common values: 'admin', 'analyst', 'manager', 'viewer'
   *
   * @example
   * ```typescript
   * // Check user permissions
   * if (user.role === 'admin') {
   *   // Admin-only operations
   * }
   *
   * // Find all analysts
   * const analysts = await User.findAll({ where: { role: 'analyst' } });
   * ```
   *
   * @see Authorization middleware for role-based permission checks
   */
  @Default('analyst')
  @AllowNull(false)
  @Column(DataType.STRING)
    role!: string;

  /**
   * Account active status flag for soft deletion.
   *
   * Indicates whether the user account is active and can authenticate.
   * Set to false to disable an account without deleting user data,
   * preserving audit trails and historical records.
   *
   * @type {boolean}
   * @default true
   * @required
   *
   * @remarks
   * - Defaults to true for new accounts
   * - Cannot be null
   * - Database column: `is_active` (snake_case)
   * - Preferred over hard deletion to maintain data integrity
   * - Authentication should check this field before allowing login
   *
   * @example
   * ```typescript
   * // Deactivate user account (soft delete)
   * await user.update({ isActive: false });
   *
   * // Find only active users
   * const activeUsers = await User.findAll({ where: { isActive: true } });
   *
   * // Reactivate account
   * await user.update({ isActive: true });
   * ```
   */
  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
  })
    isActive!: boolean;

  /**
   * User capabilities for fine-grained access control.
   *
   * Array of capability strings that define specific permissions the user has.
   * Used for capability-based access control (CBAC) providing more granular
   * permissions than role-based access alone.
   *
   * @type {string[] | undefined}
   * @optional
   *
   * @remarks
   * - Database column: `capabilities` (JSONB array)
   * - Can be null or empty array for users with no special capabilities
   * - Works in conjunction with role-based permissions
   * - Capabilities are defined in utils/access/capabilities.ts
   *
   * @example
   * ```typescript
   * // Assign capabilities to user
   * await user.update({
   *   capabilities: ['KNOWLEDGE:CREATE', 'INCIDENT:UPDATE', 'AI:USE']
   * });
   *
   * // Check if user has specific capability
   * if (user.capabilities?.includes('BYPASS:ENTERPRISE')) {
   *   // Admin operations
   * }
   * ```
   */
  @Column({
    type: DataType.JSONB,
    field: 'capabilities',
  })
    capabilities?: string[];

  /**
   * Organization identifier for multi-tenant support.
   *
   * Links the user to a specific organization for resource isolation
   * and access control in multi-tenant deployments.
   *
   * @type {string | undefined}
   * @optional
   *
   * @remarks
   * - Database column: `organization_id`
   * - Can be null for users not assigned to an organization
   * - Used for organization-level access control
   * - Should match organization UUID format
   *
   * @example
   * ```typescript
   * // Assign user to organization
   * await user.update({ organization_id: 'org-uuid-here' });
   *
   * // Find users in same organization
   * const orgUsers = await User.findAll({
   *   where: { organization_id: currentUser.organization_id }
   * });
   * ```
   */
  @Column({
    type: DataType.STRING,
    field: 'organization_id',
  })
    organization_id?: string;

  /**
   * Timestamp of the user's most recent successful login.
   *
   * Tracks when the user last authenticated to the system. Useful for
   * security monitoring, session management, and identifying inactive accounts.
   * Should be updated by the authentication service upon successful login.
   *
   * @type {Date | undefined}
   * @optional
   *
   * @remarks
   * - Database column: `last_login` (snake_case)
   * - Can be null for users who have never logged in
   * - Should be updated atomically during authentication
   * - Useful for detecting account compromise or unusual access patterns
   *
   * @example
   * ```typescript
   * // Update last login on authentication
   * await user.update({ lastLogin: new Date() });
   *
   * // Find users inactive for 90+ days
   * const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
   * const inactiveUsers = await User.findAll({
   *   where: {
   *     lastLogin: { [Op.lt]: ninetyDaysAgo },
   *     isActive: true,
   *   },
   * });
   * ```
   */
  @Column({
    type: DataType.DATE,
    field: 'last_login',
  })
    lastLogin?: Date;

  /**
   * Account creation timestamp.
   *
   * Automatically managed by Sequelize. Records when the user account
   * was created. Immutable after creation.
   *
   * @type {Date}
   * @readonly Managed automatically by Sequelize
   *
   * @remarks
   * - Auto-populated by Sequelize on record creation
   * - Database column: `created_at` (snake_case)
   * - Cannot be manually set or updated
   * - Part of standard audit trail
   *
   * @example
   * ```typescript
   * const accountAge = Date.now() - user.createdAt.getTime();
   * console.log(`Account is ${accountAge / (1000 * 60 * 60 * 24)} days old`);
   * ```
   */
  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
    createdAt!: Date;

  /**
   * Last modification timestamp.
   *
   * Automatically managed by Sequelize. Records when any field in the
   * user record was last updated. Updates automatically on any change.
   *
   * @type {Date}
   * @readonly Managed automatically by Sequelize
   *
   * @remarks
   * - Auto-updated by Sequelize on any record modification
   * - Database column: `updated_at` (snake_case)
   * - Cannot be manually set
   * - Part of standard audit trail
   *
   * @example
   * ```typescript
   * // Check if user was recently modified
   * const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
   * if (user.updatedAt > oneHourAgo) {
   *   console.log('User was recently updated');
   * }
   * ```
   */
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
    updatedAt!: Date;

  /**
   * Security incidents assigned to this user.
   *
   * One-to-many relationship with the Incident model. Contains all incidents
   * where this user is designated as the assigned analyst or responder.
   * Lazy-loaded by default; must be explicitly included in queries.
   *
   * @type {Incident[] | undefined}
   * @optional Only populated when explicitly included in query
   *
   * @remarks
   * - Foreign key in Incident table: `assignedToId`
   * - Lazy-loaded; use `include` to populate
   * - Used for workload tracking and incident assignment
   * - Cascade behavior defined in Incident model
   *
   * @example
   * ```typescript
   * // Load user with assigned incidents
   * const user = await User.findByPk(userId, {
   *   include: [{ model: Incident }],
   * });
   *
   * console.log(`User has ${user.incidents?.length || 0} assigned incidents`);
   *
   * // Count user's open incidents
   * const openCount = await Incident.count({
   *   where: {
   *     assignedToId: userId,
   *     status: 'open',
   *   },
   * });
   * ```
   *
   * @see {@link Incident} for incident model details
   */
  @HasMany(() => Incident, 'assignedToId')
    incidents?: Incident[];

  /**
   * Audit log entries recording this user's actions.
   *
   * One-to-many relationship with the AuditLog model. Contains comprehensive
   * audit trail of all actions performed by this user within the platform.
   * Essential for compliance, security monitoring, and forensic analysis.
   *
   * @type {AuditLog[] | undefined}
   * @optional Only populated when explicitly included in query
   *
   * @remarks
   * - Foreign key in AuditLog table: `userId`
   * - Lazy-loaded; use `include` to populate
   * - Critical for compliance (SOC2, GDPR, etc.)
   * - Should never be deleted when deactivating users
   * - Cascade behavior defined in AuditLog model
   *
   * @example
   * ```typescript
   * // Load user with audit logs
   * const user = await User.findByPk(userId, {
   *   include: [{
   *     model: AuditLog,
   *     order: [['createdAt', 'DESC']],
   *     limit: 100,
   *   }],
   * });
   *
   * // Find specific user actions
   * const recentLogins = await AuditLog.findAll({
   *   where: {
   *     userId: userId,
   *     action: 'login',
   *     createdAt: { [Op.gte]: new Date('2024-01-01') },
   *   },
   * });
   * ```
   *
   * @see {@link AuditLog} for audit log model details
   */
  @HasMany(() => AuditLog, 'userId')
    auditLogs?: AuditLog[];
}
