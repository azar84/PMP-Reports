import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Schema for validating imported labour data
const importLabourSchema = z.object({
  'Labour Name': z.string().min(1, 'Labour name is required'),
  'Employee Number': z.string().optional().or(z.literal('')),
  'Phone': z.string().optional().or(z.literal('')),
  'Trade': z.string().optional().or(z.literal('')),
  'Status': z.enum(['Active', 'Inactive']).optional().default('Active'),
});

// POST - Import labour data from Excel file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.' },
        { status: 400 }
      );
    }

    // Read file buffer
    const buffer = await file.arrayBuffer();
    
    // Parse Excel/CSV file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return NextResponse.json(
        { success: false, error: 'File appears to be empty or has no data rows' },
        { status: 400 }
      );
    }

    // Get headers (first row)
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1) as any[][];

    // Validate headers
    const requiredHeaders = ['Labour Name'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required columns: ${missingHeaders.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Process data rows
    const processedData = [];
    const errors = [];

    console.log('Processing', dataRows.length, 'data rows');
    console.log('Headers:', headers);

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row || row.every(cell => !cell)) continue; // Skip empty rows

      // Create object from row data
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });

      console.log(`Processing row ${i + 2}:`, rowData);

      try {
        // Validate row data
        const validatedData = importLabourSchema.parse(rowData);
        
        // Convert to database format
        const labourData = {
          labourName: validatedData['Labour Name'],
          employeeNumber: validatedData['Employee Number'] || undefined,
          phone: validatedData['Phone'] || undefined,
          trade: validatedData['Trade'] || undefined,
          isActive: validatedData['Status'] === 'Active',
        };

        console.log('Validated labour data:', labourData);
        processedData.push(labourData);
      } catch (error) {
        console.error(`Validation error for row ${i + 2}:`, error);
        if (error instanceof z.ZodError) {
          errors.push({
            row: i + 2, // +2 because we skip header and arrays are 0-indexed
            errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
          });
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation errors found in the file',
          details: errors
        },
        { status: 400 }
      );
    }

    if (processedData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid data found in the file' },
        { status: 400 }
      );
    }

    // Import data to database
    const results = {
      created: 0,
      updated: 0,
      errors: [] as any[]
    };

    console.log('Starting database import for', processedData.length, 'records');

    for (const labourData of processedData) {
      try {
        console.log('Processing labour:', labourData.labourName);
        
        // Check if labour already exists (by name or employee number)
        const existingLabour = await prisma.labour.findFirst({
          where: {
            OR: [
              { labourName: labourData.labourName },
              ...(labourData.employeeNumber ? [{ employeeNumber: labourData.employeeNumber }] : [])
            ]
          }
        });

        if (existingLabour) {
          console.log('Updating existing labour:', existingLabour.id);
          // Update existing labour
          await prisma.labour.update({
            where: { id: existingLabour.id },
            data: labourData
          });
          results.updated++;
        } else {
          console.log('Creating new labour:', labourData.labourName);
          // Create new labour
          await prisma.labour.create({
            data: labourData
          });
          results.created++;
        }
      } catch (error) {
        console.error('Database error for labour:', labourData.labourName, error);
        results.errors.push({
          labourName: labourData.labourName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('Import completed:', results);

    return NextResponse.json({
      success: true,
      message: `Import completed successfully`,
      data: {
        totalProcessed: processedData.length,
        created: results.created,
        updated: results.updated,
        errors: results.errors.length,
        errorDetails: results.errors
      }
    });

  } catch (error) {
    console.error('Error importing labour data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import labour data' },
      { status: 500 }
    );
  }
}

