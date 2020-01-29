export function timeDurationToHoursAndMinutesString(time) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60) % 60;
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function timeDurationToDecimalHoursString(time) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${(minutes / 60).toFixed(1)}h`;
}

export function timeToHoursMinutesString(time) {
  return new Date(time).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
