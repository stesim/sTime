export function secondsToHoursAndMinutesString(seconds) {
  const minutes = Math.floor(seconds / 60) % 60;
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function secondsToDecimalHoursString(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${(minutes / 60).toFixed(1)}h`;
}
