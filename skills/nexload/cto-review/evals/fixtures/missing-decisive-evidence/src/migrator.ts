export interface MigrationPlan {
  readonly partitionId: string;
  readonly targetShards: number;
}

export class PartitionMigrator {
  async migratePartition(plan: MigrationPlan): Promise<void> {
    // Re-shards live PostgreSQL partitions without explicit distributed lock ownership
    // or transactional rollback checkpoints
  }
}
