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
    
    // For Date objects or other string formats, parse and format using local timezone
    const d = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(d.getTime())) return '';
    
    // Use local date methods to avoid timezone conversion
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
 * Uses local date methods
 */
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '-';
  }
}

