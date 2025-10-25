/**
 * Currency formatting utilities
 */

/**
 * Format a number as currency using the site's currency symbol
 * @param amount - The amount to format
 * @param currencySymbol - The currency symbol to use (default: '$')
 * @param locale - The locale for number formatting (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  currencySymbol: string = '$', 
  locale: string = 'en-US'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencySymbol}0`;
  }

  // Format the number with commas
  const formattedNumber = new Intl.NumberFormat(locale).format(Math.round(amount));
  
  // Return with currency symbol
  return `${currencySymbol}${formattedNumber}`;
}

/**
 * Format a number as currency with decimal places
 * @param amount - The amount to format
 * @param currencySymbol - The currency symbol to use (default: '$')
 * @param decimals - Number of decimal places (default: 2)
 * @param locale - The locale for number formatting (default: 'en-US')
 * @returns Formatted currency string with decimals
 */
export function formatCurrencyWithDecimals(
  amount: number, 
  currencySymbol: string = '$', 
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencySymbol}0.${'0'.repeat(decimals)}`;
  }

  // Format the number with specified decimal places
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  
  // Return with currency symbol
  return `${currencySymbol}${formattedNumber}`;
}

/**
 * Parse a currency string back to a number
 * @param currencyString - The currency string to parse
 * @param currencySymbol - The currency symbol to remove (default: '$')
 * @returns The parsed number or 0 if invalid
 */
export function parseCurrency(
  currencyString: string, 
  currencySymbol: string = '$'
): number {
  if (!currencyString) return 0;
  
  // Remove currency symbol and any non-numeric characters except decimal point and commas
  const cleaned = currencyString
    .replace(new RegExp(`\\${currencySymbol}`, 'g'), '')
    .replace(/[^\d.,]/g, '');
  
  // Handle different decimal separators
  const normalized = cleaned.replace(',', '');
  
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}
