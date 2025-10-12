/**
 * PlaybookExecution Model - Sequelize
 * Automation playbook execution history
 */

import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Index,
} from 'sequelize-typescript';

@Table({
  tableName: 'playbook_executions',
  underscored: true,
  timestamps: false,
  indexes: [
    { fields: ['playbook_id'] },
    { fields: ['status'] },
    { fields: ['started_at'] },
  ],
})
export default class PlaybookExecution extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Index
  @Column({
    type: DataType.STRING,
    field: 'playbook_id',
  })
  playbookId!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'playbook_name',
  })
  playbookName!: string;

  @Default('pending')
  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  status!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING,
    field: 'triggered_by',
  })
  triggeredBy!: string;

  @Default(DataType.NOW)
  @AllowNull(false)
  @Index
  @Column({
    type: DataType.DATE,
    field: 'started_at',
  })
  startedAt!: Date;

  @Column({
    type: DataType.DATE,
    field: 'completed_at',
  })
  completedAt?: Date;

  @Column(DataType.INTEGER)
  duration?: number;

  @Column(DataType.JSONB)
  result?: any;

  @Column({
    type: DataType.TEXT,
    field: 'error_message',
  })
  errorMessage?: string;

  @Column(DataType.JSONB)
  metadata?: any;
}
