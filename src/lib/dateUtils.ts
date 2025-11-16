/**
 * Utility functions for handling dates as date-only values (no time/timezone)
 */

/**
 * Formats a date to YYYY-MM-DD string for date inputs
 * Uses local date methods to avoid timezone conversion
 * Handles YYYY-MM-DD strings directly without timezone conversion
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    // If it's already a YYYY-MM-DD string, return it as-is (no conversion needed)
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      // Extract just the date part (YYYY-MM-DD) if there's time component
      const datePart = date.split('T')[0].split(' ')[0];
      return datePart;
    }
    
    // For Date objects, use local date methods to avoid timezone conversion
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // For string dates (like ISO format), extract date part first to avoid timezone issues
    if (typeof date === 'string') {
      // Try to extract YYYY-MM-DD from ISO format or other formats
      const dateMatch = date.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        return dateMatch[1];
      }
      
      // Fallback: parse as Date but use UTC methods to avoid timezone shift
      const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
      // Use UTC methods to get the date as stored, then format
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
 * Parses a YYYY-MM-DD string to a Date object in local timezone
 * Creates the date at local midnight to avoid timezone shifts
 */
export function parseDateFromInput(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString === '') return null;
  
  try {
    // Parse YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Validate
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    
    // Create date in local timezone at midnight (not UTC)
    // month is 0-indexed in Date constructor
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Formats a date for display (e.g., "Jan 15, 2024")
 * Uses local date methods, but extracts date part from ISO strings to avoid timezone shifts
 */
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    // If it's a string with YYYY-MM-DD format, extract and parse it properly
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const datePart = date.split('T')[0].split(' ')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString();
    }
    
    // For Date objects, use as-is
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString();
    }
    
    // For other string formats, try to parse
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '-';
  }
}

