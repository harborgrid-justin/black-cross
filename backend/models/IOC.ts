/**
 * IOC Model - Sequelize
 * Indicators of Compromise tracking
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
  tableName: 'iocs',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['value'] },
    { fields: ['severity'] },
  ],
})
export default class IOC extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  type!: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  value!: string;

  @Column(DataType.TEXT)
  description?: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  severity!: string;

  @Default(50)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  confidence!: number;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'first_seen',
  })
  firstSeen!: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    field: 'last_seen',
  })
  lastSeen!: Date;

  @AllowNull(false)
  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  tags!: string[];

  @Column(DataType.STRING)
  source?: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    field: 'is_active',
  })
  isActive!: boolean;

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
