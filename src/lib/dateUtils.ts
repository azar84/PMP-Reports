/**
 * Utility functions for handling dates as date-only values (no time/timezone)
 */

/**
 * Formats a date to YYYY-MM-DD string for date inputs
 * For PostgreSQL DATE type, extracts the date part from Date objects
 * Since DATE type stores only the date (no time/timezone), we can safely extract the date part
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    // If it's already a YYYY-MM-DD string, return it as-is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      // Extract just the date part (YYYY-MM-DD) if there's time component
      const datePart = date.split('T')[0].split(' ')[0];
      return datePart;
    }
    
    // For Date objects, extract the date part
    // PostgreSQL DATE type returns Date objects at midnight UTC when retrieved
    // We use UTC methods to get the exact date that was stored
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return '';
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // For string dates (like ISO format), extract date part
    if (typeof date === 'string') {
      // Try to extract YYYY-MM-DD from ISO format or other formats
      const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        return dateMatch[1];
      }
      
      // Fallback: parse as Date and extract UTC date
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Parses a YYYY-MM-DD string to a Date object at UTC midnight
 * This ensures the date is stored consistently regardless of server timezone
 * PostgreSQL DATE type stores only the date part, but Prisma requires a Date object
 * By using UTC, we ensure "2024-01-15" is always stored as "2024-01-15" regardless of server timezone
 */
export function parseDateFromInput(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString === '') return null;
  
  try {
    // Parse YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Validate
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    
    // Create date at UTC midnight to ensure consistent storage
    // This way, "2024-01-15" is always stored as "2024-01-15" in the database
    // regardless of what timezone the server is in
    // month is 0-indexed in Date.UTC
    return new Date(Date.UTC(year, month - 1, day));
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Formats a date for display in DD-MM-YYYY format (e.g., "15-01-2024")
 * Extracts ONLY the date part (YYYY-MM-DD) from any input, ignoring time and timezone
 * This ensures dates are displayed exactly as entered, without timezone conversion
 */
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    let day: number, month: number, year: number;
    
    // If it's a string with YYYY-MM-DD format, extract and parse it properly
    // This handles ISO strings like "2024-01-15T00:00:00Z" or "2024-01-15"
    if (typeof date === 'string') {
      // Extract just the date part (YYYY-MM-DD) - ignore everything after T or space
      const datePart = date.split('T')[0].split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        [year, month, day] = datePart.split('-').map(Number);
      } else {
        // Fallback: try to parse as Date but extract UTC date to avoid timezone shift
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        // Use UTC methods to get the date as it was stored, avoiding timezone conversion
        year = d.getUTCFullYear();
        month = d.getUTCMonth() + 1;
        day = d.getUTCDate();
      }
    } else if (date instanceof Date) {
      // For Date objects, extract the date part using UTC to avoid timezone conversion
      if (isNaN(date.getTime())) return '-';
      // Use UTC methods to ensure we get the date as stored, not converted to local timezone
      year = date.getUTCFullYear();
      month = date.getUTCMonth() + 1; // getMonth() is 0-indexed
      day = date.getUTCDate();
    } else {
      return '-';
    }
    
    // Validate
    if (isNaN(year) || isNaN(month) || isNaN(day)) return '-';
    
    // Format as DD-MM-YYYY
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    return `${dayStr}-${monthStr}-${year}`;
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '-';
  }
}

