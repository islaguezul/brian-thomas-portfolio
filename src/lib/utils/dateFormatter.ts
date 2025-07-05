/**
 * Formats a date string to display only month and year, avoiding timezone issues
 * @param dateValue - ISO date string or Date object from database
 * @returns Formatted date string (e.g., "November 2023")
 */
export function formatMonthYear(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '';
  
  // Convert Date object to ISO string if needed
  const dateString = dateValue instanceof Date ? dateValue.toISOString() : dateValue;
  
  // Parse the date string and extract year and month
  // This avoids timezone conversion issues
  const [year, month] = dateString.split('T')[0].split('-');
  
  // Create a date using UTC to avoid timezone shifts
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
  
  // Format using UTC methods to ensure consistency
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Formats a date string to display abbreviated month and year, avoiding timezone issues
 * @param dateValue - ISO date string or Date object from database
 * @returns Formatted date string (e.g., "Nov 2023")
 */
export function formatMonthYearShort(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '';
  
  // Convert Date object to ISO string if needed
  const dateString = dateValue instanceof Date ? dateValue.toISOString() : dateValue;
  
  // Parse the date string and extract year and month
  // This avoids timezone conversion issues
  const [year, month] = dateString.split('T')[0].split('-');
  
  // Create a date using UTC to avoid timezone shifts
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
  
  // Format using UTC methods to ensure consistency
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric',
    timeZone: 'UTC'
  });
}