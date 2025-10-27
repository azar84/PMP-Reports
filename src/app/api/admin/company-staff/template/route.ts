import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// GET - Download Excel template for staff import
export async function GET(request: NextRequest) {
  try {
    // Create template data with headers and sample rows
    const templateData = [
      {
        'Staff Name': 'John Doe',
        'Employee Number': 'EMP001',
        'Email': 'john.doe@company.com',
        'Phone': '+234 123 456 7890',
        'Position': 'Project Manager',
        'Status': 'Active'
      },
      {
        'Staff Name': 'Jane Smith',
        'Employee Number': 'EMP002',
        'Email': 'jane.smith@company.com',
        'Phone': '+234 987 654 3210',
        'Position': 'Senior Engineer',
        'Status': 'Active'
      },
      {
        'Staff Name': 'Mike Johnson',
        'Employee Number': 'EMP003',
        'Email': 'mike.johnson@company.com',
        'Phone': '+234 555 123 4567',
        'Position': 'Project Director',
        'Status': 'Inactive'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Staff Name
      { wch: 15 }, // Employee Number
      { wch: 30 }, // Email
      { wch: 20 }, // Phone
      { wch: 20 }, // Position
      { wch: 10 }, // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Add instructions sheet
    const instructionsData = [
      ['Staff Import Template Instructions'],
      [''],
      ['Required Fields:'],
      ['- Staff Name: Full name of the staff member (required)'],
      [''],
      ['Optional Fields:'],
      ['- Employee Number: Unique identifier for the staff member'],
      ['- Email: Valid email address'],
      ['- Phone: Contact phone number'],
      ['- Position: Job title or role'],
      ['- Status: Active or Inactive (defaults to Active if empty)'],
      [''],
      ['Notes:'],
      ['- If a staff member with the same name or employee number exists, it will be updated'],
      ['- Empty cells will be treated as optional fields'],
      ['- Status must be either "Active" or "Inactive"'],
      ['- Email addresses must be valid format'],
      [''],
      ['Sample data is provided in the first sheet.'],
      ['Delete the sample rows and add your own data before importing.']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    
    // Set column width for instructions
    instructionsSheet['!cols'] = [{ wch: 60 }];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    // Set response headers for file download
    const filename = 'staff_import_template.xlsx';
    
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
