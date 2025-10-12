/**
 * ThreatActor Model - Sequelize
 * Threat actor intelligence and tracking
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
  Index,
} from 'sequelize-typescript';

@Table({
  tableName: 'threat_actors',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['name'] },
  ],
})
export default class ThreatActor extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  aliases!: string[];

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.STRING)
  sophistication?: string;

  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  motivation!: string[];

  @Column({
    type: DataType.DATE,
    field: 'first_seen',
  })
  firstSeen?: Date;

  @Column({
    type: DataType.DATE,
    field: 'last_seen',
  })
  lastSeen?: Date;

  @Column(DataType.STRING)
  country?: string;

  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  tags!: string[];

  @Column(DataType.JSONB)
  metadata?: any;

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
