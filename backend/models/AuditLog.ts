/**
 * AuditLog Model - Sequelize
 * Audit trail for all user actions
 */

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import User from './User';

@Table({
  tableName: 'audit_logs',
  underscored: true,
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['timestamp'] },
  ],
})
export default class AuditLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.UUID,
    field: 'user_id',
  })
  userId!: string;

  @BelongsTo(() => User, 'userId')
  user?: User;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  action!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  resource!: string;

  @Column({
    type: DataType.STRING,
    field: 'resource_id',
  })
  resourceId?: string;

  @Column(DataType.JSONB)
  details?: any;

  @Column({
    type: DataType.STRING,
    field: 'ip_address',
  })
  ipAddress?: string;

  @Column({
    type: DataType.STRING,
    field: 'user_agent',
  })
  userAgent?: string;

  @Default(DataType.NOW)
  @AllowNull(false)
  @Index
  @Column(DataType.DATE)
  timestamp!: Date;
}
