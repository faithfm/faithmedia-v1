/**
 * Extract the directory path from a full file path
 * @param pathname The full file path
 * @returns The directory path without the filename
 */
export function filePath(pathname: string): string {
  return pathname.split("/").slice(0, -1).join("/")
}

/**
 * Extract the filename from a full file path
 * @param pathname The full file path
 * @returns The filename without the directory path
 */
export function fileName(pathname: string): string {
  return pathname.split("/").pop() || ""
}

/**
 * Convert seconds to MM:SS format
 * @param seconds The number of seconds to convert
 * @returns A string in MM:SS format
 */
export function convertSecondsToMinutes(seconds: number): string {
  // Handle invalid inputs
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '00:00'
  }
  
  // Handle very large numbers (cap at 99:59)
  if (seconds > 5999) {
    return '99:59'
  }
  
  // Round to avoid floating point precision issues
  const totalSeconds = Math.floor(seconds)
  
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  
  // Format with proper 2-digit padding
  const paddedMinutes = minutes.toString().padStart(2, '0')
  const paddedSeconds = remainingSeconds.toString().padStart(2, '0')
  
  return `${paddedMinutes}:${paddedSeconds}`
}

/**
 * Get user initials from full name
 * @param fullName The full name to extract initials from
 * @returns The initials (first letter of each word)
 */
export function getInitials(fullName: string): string {
  return (fullName || "")
    .split(" ")
    .map(n => n[0])
    .join("")
}
