/**
 * Convert seconds to timestamp.
 * @param {number} duration 
 * @returns {string}
 */
export function timestamp(duration) {
  // Calculate hours, minutes, and seconds
  let hours = Math.floor(duration / 3600)
  let minutes = Math.floor((duration % 3600) / 60)
  let seconds = Math.floor(+(duration % 60).toFixed(3)) // Keeps milliseconds

  // Pad with leading zeros if necessary
  let hoursStr = hours.toString().padStart(2, "0")
  let minutesStr = minutes.toString().padStart(2, "0")
  let secondsStr = seconds.toString().padStart(2, "0") // To account for the fractional part

  return `${hoursStr}:${minutesStr}:${secondsStr}`
}