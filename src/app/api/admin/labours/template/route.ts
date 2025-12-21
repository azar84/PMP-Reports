import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// GET - Download Excel template for labour import
export async function GET(request: NextRequest) {
  try {
    // Create template data with headers and sample rows
    const templateData = [
      {
        'Labour Name': 'Ahmed Hassan',
        'Employee Number': 'LAB001',
        'Phone': '+234 123 456 7890',
        'Trade': 'Carpenter',
        'Status': 'Active'
      },
      {
        'Labour Name': 'Mohammed Ali',
        'Employee Number': 'LAB002',
        'Phone': '+234 987 654 3210',
        'Trade': 'Electrician',
        'Status': 'Active'
      },
      {
        'Labour Name': 'Ibrahim Saleh',
        'Employee Number': 'LAB003',
        'Phone': '+234 555 123 4567',
        'Trade': 'Plumber',
        'Status': 'Inactive'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Labour Name
      { wch: 15 }, // Employee Number
      { wch: 20 }, // Phone
      { wch: 20 }, // Trade
      { wch: 10 }, // Status
    ];
    worksheet['!cols'] = columnWidths;

    // Add instructions sheet
    const instructionsData = [
      ['Labour Import Template Instructions'],
      [''],
      ['Required Fields:'],
      ['- Labour Name: Full name of the labour worker (required)'],
      [''],
      ['Optional Fields:'],
      ['- Employee Number: Unique identifier for the labour'],
      ['- Phone: Contact phone number'],
      ['- Trade: Trade or skill type (e.g., Carpenter, Electrician, Plumber)'],
      ['- Status: Active or Inactive (defaults to Active if empty)'],
      [''],
      ['Notes:'],
      ['- If a labour with the same name or employee number exists, it will be updated'],
      ['- Empty cells will be treated as optional fields'],
      ['- Status must be either "Active" or "Inactive"'],
      [''],
      ['Sample data is provided in the first sheet.'],
      ['Delete the sample rows and add your own data before importing.']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    
    // Set column width for instructions
    instructionsSheet['!cols'] = [{ wch: 60 }];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Labour Data');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true 
    });

    // Set response headers for file download
    const filename = 'labours_import_template.xlsx';
    
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

