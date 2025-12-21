import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

// GET - Export labour data as Excel file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';

    // Fetch all labour data
    const labours = await prisma.labour.findMany({
      include: {
        projectLabours: {
          where: {
            status: {
              not: 'Completed'
            }
          },
          include: {
            project: {
              select: {
                id: true,
                projectName: true,
                projectCode: true,
              },
            },
            trade: {
              select: {
                id: true,
                trade: true,
                requiredQuantity: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Prepare data for Excel export
    const exportData = labours.map(labour => ({
      'Labour Name': labour.labourName,
      'Employee Number': labour.employeeNumber || '',
      'Phone': labour.phone || '',
      'Trade': labour.trade || '',
      'Status': labour.isActive ? 'Active' : 'Inactive',
      'Monthly Base Rate': labour.monthlyBaseRate ? Number(labour.monthlyBaseRate) : '',
      'Active Projects': labour.projectLabours.length,
      'Is Utilized': labour.projectLabours.length > 0 ? 'Yes' : 'No',
      'Created Date': new Date(labour.createdAt).toLocaleDateString(),
      'Last Updated': new Date(labour.updatedAt).toLocaleDateString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Labour Name
      { wch: 15 }, // Employee Number
      { wch: 15 }, // Phone
      { wch: 20 }, // Trade
      { wch: 10 }, // Status
      { wch: 15 }, // Monthly Base Rate
      { wch: 12 }, // Active Projects
      { wch: 12 }, // Is Utilized
      { wch: 12 }, // Created Date
      { wch: 12 }, // Last Updated
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Labour Data');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: format as XLSX.BookType,
      compression: true 
    });

    // Set response headers for file download
    const filename = `labours_data_${new Date().toISOString().split('T')[0]}.${format}`;
    
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error exporting labour data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export labour data' },
      { status: 500 }
    );
  }
}

