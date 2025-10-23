/**
 * User Model - Sequelize
 * User accounts and authentication
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

@Table({
  tableName: 'users',
  underscored: true,
  timestamps: true,
})
export default class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
    id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
    email!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
    username!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
    password!: string;

  @Column({
    type: DataType.STRING,
    field: 'first_name',
  })
    firstName?: string;

  @Column({
    type: DataType.STRING,
    field: 'last_name',
  })
    lastName?: string;

  @Default('analyst')
  @AllowNull(false)
  @Column(DataType.STRING)
    role!: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
  })
    isActive!: boolean;

  @Column({
    type: DataType.DATE,
    field: 'last_login',
  })
    lastLogin?: Date;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
    createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
    updatedAt!: Date;

  @HasMany(() => Incident, 'assignedToId')
    incidents?: Incident[];

  @HasMany(() => AuditLog, 'userId')
    auditLogs?: AuditLog[];
}
