/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format date to show full day name, month, day, and year
 * Example: "Monday, January 15, 2024"
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateWithDay = (dateString) => {
  if (!dateString) return 'Not available';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format date to show month, day, and year (shorter format)
 * Example: "January 15, 2024"
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return 'Not available';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format time to show hours and minutes
 * Example: "09:30 AM"
 * @param {string|Date} timeString - Time string or Date object
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString || timeString === null || timeString === undefined) return 'Not Checked Out';
  
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return 'Invalid time';
  
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get month name from month number (0-11)
 * @param {number} month - Month number (0-11)
 * @returns {string} Month name
 */
export const getMonthName = (month) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month] || 'Unknown';
};

/**
 * Get day name from date
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Day name
 */
export const getDayName = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const options = { weekday: 'long' };
  return date.toLocaleDateString('en-US', options);
};
