import { NextRequest } from 'next/server';

export interface BackupConfig {
  id: string;
  name: string;
  type: 'database' | 'files' | 'config' | 'full';
  schedule: string; // cron expression
  retention: number; // days
  enabled: boolean;
  trustLockRequired: boolean;
}

export interface BackupJob {
  id: string;
  configId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  size?: number;
  location?: string;
  trustLockVerified: boolean;
  error?: string;
}

export interface RestoreJob {
  id: string;
  backupId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  trustLockVerified: boolean;
  error?: string;
}

export class BackupService {
  private static configs: BackupConfig[] = [];
  private static jobs: BackupJob[] = [];
  private static restoreJobs: RestoreJob[] = [];
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) return;

    this.setupDefaultConfigs();
    this.startScheduledBackups();
    
    this.isInitialized = true;
    console.log('💾 Backup service initialized with Trust-Lock validation');
  }

  static async createBackup(
    configId: string,
    request?: NextRequest
  ): Promise<BackupJob> {
    const config = this.configs.find(c => c.id === configId);
    if (!config) {
      throw new Error(`Backup config not found: ${configId}`);
    }

    // Verify Trust-Lock for critical backups
    if (config.trustLockRequired) {
      const trustLockVerified = await this.verifyTrustLock(request);
      if (!trustLockVerified) {
        throw new Error('Trust-Lock verification required for this backup operation');
      }
    }

    const job: BackupJob = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      configId,
      status: 'pending',
      startedAt: Date.now(),
      trustLockVerified: config.trustLockRequired
    };

    this.jobs.push(job);

    // Execute backup asynchronously
    this.executeBackup(job, config);

    return job;
  }

  static async restoreBackup(
    backupId: string,
    request?: NextRequest
  ): Promise<RestoreJob> {
    const backup = this.jobs.find(j => j.id === backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    if (backup.status !== 'completed') {
      throw new Error('Can only restore completed backups');
    }

    // Always require Trust-Lock for restore operations
    const trustLockVerified = await this.verifyTrustLock(request);
    if (!trustLockVerified) {
      throw new Error('Trust-Lock verification required for restore operations');
    }

    const restoreJob: RestoreJob = {
      id: `restore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      backupId,
      status: 'pending',
      startedAt: Date.now(),
      trustLockVerified: true
    };

    this.restoreJobs.push(restoreJob);

    // Execute restore asynchronously
    this.executeRestore(restoreJob, backup);

    return restoreJob;
  }

  static getBackupConfigs(): BackupConfig[] {
    return this.configs;
  }

  static getBackupJobs(limit: number = 50): BackupJob[] {
    return this.jobs
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit);
  }

  static getRestoreJobs(limit: number = 20): RestoreJob[] {
    return this.restoreJobs
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit);
  }

  static getBackupStatus(): {
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    lastBackup?: number;
    nextScheduledBackup?: number;
  } {
    const completedBackups = this.jobs.filter(j => j.status === 'completed');
    const failedBackups = this.jobs.filter(j => j.status === 'failed');
    const lastBackup = completedBackups.length > 0 
      ? Math.max(...completedBackups.map(j => j.completedAt || 0))
      : undefined;

    return {
      totalBackups: this.jobs.length,
      successfulBackups: completedBackups.length,
      failedBackups: failedBackups.length,
      lastBackup,
      nextScheduledBackup: this.getNextScheduledBackup()
    };
  }

  private static setupDefaultConfigs(): void {
    this.configs = [
      {
        id: 'daily_database',
        name: 'Daily Database Backup',
        type: 'database',
        schedule: '0 2 * * *', // 2 AM daily
        retention: 30,
        enabled: true,
        trustLockRequired: true
      },
      {
        id: 'hourly_config',
        name: 'Hourly Config Backup',
        type: 'config',
        schedule: '0 * * * *', // Every hour
        retention: 7,
        enabled: true,
        trustLockRequired: false
      },
      {
        id: 'weekly_full',
        name: 'Weekly Full Backup',
        type: 'full',
        schedule: '0 3 * * 0', // 3 AM every Sunday
        retention: 12,
        enabled: true,
        trustLockRequired: true
      },
      {
        id: 'monthly_archive',
        name: 'Monthly Archive',
        type: 'full',
        schedule: '0 4 1 * *', // 4 AM on 1st of every month
        retention: 365,
        enabled: true,
        trustLockRequired: true
      }
    ];
  }

  private static startScheduledBackups(): void {
    // In production, use a proper cron scheduler
    // For demo purposes, we'll simulate scheduled backups
    setInterval(() => {
      this.checkScheduledBackups();
    }, 60000); // Check every minute
  }

  private static checkScheduledBackups(): void {
    const now = new Date();
    
    for (const config of this.configs) {
      if (!config.enabled) continue;

      // Simple cron-like checking (in production, use a proper cron library)
      if (this.shouldRunBackup(config, now)) {
        this.createBackup(config.id);
      }
    }
  }

  private static shouldRunBackup(config: BackupConfig, now: Date): boolean {
    // Simplified cron checking - in production, use a proper cron parser
    const [minute, hour, day, month, weekday] = config.schedule.split(' ');
    
    return (
      (minute === '*' || parseInt(minute) === now.getMinutes()) &&
      (hour === '*' || parseInt(hour) === now.getHours()) &&
      (day === '*' || parseInt(day) === now.getDate()) &&
      (month === '*' || parseInt(month) === now.getMonth() + 1) &&
      (weekday === '*' || parseInt(weekday) === now.getDay())
    );
  }

  private static async executeBackup(job: BackupJob, config: BackupConfig): Promise<void> {
    try {
      job.status = 'running';
      
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, implement actual backup logic
      switch (config.type) {
        case 'database':
          await this.backupDatabase(job);
          break;
        case 'files':
          await this.backupFiles(job);
          break;
        case 'config':
          await this.backupConfig(job);
          break;
        case 'full':
          await this.backupFull(job);
          break;
      }

      job.status = 'completed';
      job.completedAt = Date.now();
      job.size = Math.floor(Math.random() * 1000000); // Simulate size
      job.location = `s3://hookahplus-backups/${job.id}.tar.gz`;

      console.log(`✅ Backup completed: ${job.id}`);

    } catch (error) {
      job.status = 'failed';
      job.completedAt = Date.now();
      job.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Backup failed: ${job.id}`, error);
    }
  }

  private static async executeRestore(restoreJob: RestoreJob, backup: BackupJob): Promise<void> {
    try {
      restoreJob.status = 'running';
      
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // In production, implement actual restore logic
      await this.restoreFromBackup(restoreJob, backup);

      restoreJob.status = 'completed';
      restoreJob.completedAt = Date.now();

      console.log(`✅ Restore completed: ${restoreJob.id}`);

    } catch (error) {
      restoreJob.status = 'failed';
      restoreJob.completedAt = Date.now();
      restoreJob.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Restore failed: ${restoreJob.id}`, error);
    }
  }

  private static async backupDatabase(job: BackupJob): Promise<void> {
    // In production, use pg_dump or similar
    console.log(`📊 Backing up database for job ${job.id}`);
  }

  private static async backupFiles(job: BackupJob): Promise<void> {
    // In production, tar/zip files
    console.log(`📁 Backing up files for job ${job.id}`);
  }

  private static async backupConfig(job: BackupJob): Promise<void> {
    // In production, backup configuration files
    console.log(`⚙️ Backing up config for job ${job.id}`);
  }

  private static async backupFull(job: BackupJob): Promise<void> {
    // In production, full system backup
    console.log(`💾 Full backup for job ${job.id}`);
  }

  private static async restoreFromBackup(restoreJob: RestoreJob, backup: BackupJob): Promise<void> {
    // In production, restore from backup location
    console.log(`🔄 Restoring from backup ${backup.id} for job ${restoreJob.id}`);
  }

  private static async verifyTrustLock(request?: NextRequest): Promise<boolean> {
    if (!request) return false;

    try {
      const trustLockToken = request.headers.get('x-trust-lock-token');
      if (!trustLockToken) return false;

      const response = await fetch('/api/trust-lock/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: trustLockToken,
          action: 'backup_operation'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Trust-Lock verification failed:', error);
      return false;
    }
  }

  private static getNextScheduledBackup(): number | undefined {
    // Calculate next scheduled backup time
    const now = Date.now();
    const nextHour = now + (60 * 60 * 1000);
    return nextHour;
  }

  static async cleanupOldBackups(): Promise<void> {
    const now = Date.now();
    
    for (const config of this.configs) {
      const cutoffTime = now - (config.retention * 24 * 60 * 60 * 1000);
      
      // Remove old completed backups
      const oldBackups = this.jobs.filter(job => 
        job.configId === config.id &&
        job.status === 'completed' &&
        job.completedAt && job.completedAt < cutoffTime
      );

      for (const backup of oldBackups) {
        // In production, delete from storage
        console.log(`🗑️ Cleaning up old backup: ${backup.id}`);
      }

      // Remove from jobs array
      this.jobs = this.jobs.filter(job => !oldBackups.includes(job));
    }
  }
}

// Initialize backup service
if (typeof window === 'undefined') {
  BackupService.init();
}
