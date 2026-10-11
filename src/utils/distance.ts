/**
 * Haversine distance between two lat/lng points in kilometres.
 * Returns a deterministic mock value when coordinates are missing.
 */
export function getDistanceKm(
  lat1?: number,
  lng1?: number,
  lat2?: number,
  lng2?: number,
): number {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
    // Deterministic fallback when coordinates are not available
    return 5.0;
  }
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // one decimal place
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * Format distance for display.
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
