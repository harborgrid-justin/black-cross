/**
 * Incident Model - Sequelize
 * Security incidents and their lifecycle
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
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default('medium')
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  severity!: string;

  @Default('open')
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  status!: string;

  @Default(3)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  priority!: number;

  @Column(DataType.STRING)
  category?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    field: 'assigned_to_id',
  })
  assignedToId?: string;

  @BelongsTo(() => User, 'assignedToId')
  assignedTo?: User;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'detected_at',
  })
  detectedAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'resolved_at',
  })
  resolvedAt?: Date;

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
}
