import { NextRequest, NextResponse } from 'next/server';
import { BackupService } from '@/lib/backup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'configs':
        const configs = BackupService.getBackupConfigs();
        return NextResponse.json({
          success: true,
          data: { configs }
        });

      case 'jobs':
        const limit = parseInt(searchParams.get('limit') || '50');
        const jobs = BackupService.getBackupJobs(limit);
        return NextResponse.json({
          success: true,
          data: { jobs }
        });

      case 'restore-jobs':
        const restoreLimit = parseInt(searchParams.get('limit') || '20');
        const restoreJobs = BackupService.getRestoreJobs(restoreLimit);
        return NextResponse.json({
          success: true,
          data: { restoreJobs }
        });

      case 'status':
        const status = BackupService.getBackupStatus();
        return NextResponse.json({
          success: true,
          data: { status }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve backup data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, configId, backupId } = body;

    switch (action) {
      case 'create_backup':
        if (!configId) {
          return NextResponse.json(
            { success: false, error: 'Config ID required' },
            { status: 400 }
          );
        }

        const backupJob = await BackupService.createBackup(configId, request);
        return NextResponse.json({
          success: true,
          message: 'Backup job created successfully',
          data: { job: backupJob }
        });

      case 'restore_backup':
        if (!backupId) {
          return NextResponse.json(
            { success: false, error: 'Backup ID required' },
            { status: 400 }
          );
        }

        const restoreJob = await BackupService.restoreBackup(backupId, request);
        return NextResponse.json({
          success: true,
          message: 'Restore job created successfully',
          data: { job: restoreJob }
        });

      case 'cleanup':
        await BackupService.cleanupOldBackups();
        return NextResponse.json({
          success: true,
          message: 'Cleanup completed successfully'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Backup API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Backup operation failed' 
      },
      { status: 500 }
    );
  }
}
