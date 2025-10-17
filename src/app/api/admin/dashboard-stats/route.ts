import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import type { ApiResponse } from '../../../../lib/api';

interface DashboardStats {
  totalUsers: number;
  mediaFiles: number;
  scheduledJobs: number;
  activeSettings: number;
}

export async function GET() {
  try {
    // Get current counts
    const [
      totalUsers,
      mediaFiles,
      activeSettings
    ] = await Promise.all([
      prisma.adminUser.count(),
      prisma.mediaLibrary.count(),
      prisma.siteSettings.count()
    ]);

    // Scheduled jobs count - this would depend on your scheduler implementation
    const scheduledJobs = 0; // Placeholder - update based on your scheduler

    const stats: DashboardStats = {
      totalUsers,
      mediaFiles,
      scheduledJobs,
      activeSettings
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to fetch dashboard statistics'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
} 