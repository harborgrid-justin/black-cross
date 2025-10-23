/**
 * Asset Model - Sequelize
 * IT asset inventory and management
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
  Index,
} from 'sequelize-typescript';

@Table({
  tableName: 'assets',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['criticality'] },
  ],
})
export default class Asset extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
    id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
    name!: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
    type!: string;

  @Column({
    type: DataType.STRING,
    field: 'ip_address',
  })
    ipAddress?: string;

  @Column(DataType.STRING)
    hostname?: string;

  @Default('medium')
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
    criticality!: string;

  @Column(DataType.STRING)
    owner?: string;

  @Column(DataType.STRING)
    location?: string;

  @Column(DataType.STRING)
    environment?: string;

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
