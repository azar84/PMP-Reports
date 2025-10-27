import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

// GET - Export staff data as Excel file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';

    // Fetch all staff data
    const staff = await prisma.companyStaff.findMany({
      include: {
        projectStaff: {
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
                projectCode: true,
              },
            },
            position: {
              select: {
                id: true,
                designation: true,
                requiredUtilization: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate utilization for each staff member
    const staffWithUtilization = staff.map(member => {
      const totalUtilization = member.projectStaff.reduce((sum, assignment) => sum + assignment.utilization, 0);
      const remainingCapacity = Math.max(0, 100 - totalUtilization);
      
      return {
        ...member,
        totalUtilization,
        remainingCapacity,
      };
    });

    // Prepare data for Excel export
    const exportData = staffWithUtilization.map(member => ({
      'Staff Name': member.staffName,
      'Employee Number': member.employeeNumber || '',
      'Email': member.email || '',
      'Phone': member.phone || '',
      'Position': member.position || '',
      'Status': member.isActive ? 'Active' : 'Inactive',
      'Total Utilization (%)': member.totalUtilization || 0,
      'Remaining Capacity (%)': member.remainingCapacity || 100,
      'Active Projects': member.projectStaff.length,
      'Created Date': new Date(member.createdAt).toLocaleDateString(),
      'Last Updated': new Date(member.updatedAt).toLocaleDateString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Staff Name
      { wch: 15 }, // Employee Number
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Position
      { wch: 10 }, // Status
      { wch: 15 }, // Total Utilization
      { wch: 15 }, // Remaining Capacity
      { wch: 12 }, // Active Projects
      { wch: 12 }, // Created Date
      { wch: 12 }, // Last Updated
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Data');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: format as XLSX.BookType,
      compression: true 
    });

    // Set response headers for file download
    const filename = `staff_data_${new Date().toISOString().split('T')[0]}.${format}`;
    
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error exporting staff data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export staff data' },
      { status: 500 }
    );
  }
}
