import { Location } from '../types';

export function calculateDistance(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number,
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return Math.floor(Math.random() * 8) + 1; // Fallback mock distance 1-8 km
  }

  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm} km away`;
}

export const KARNATAKA_DISTRICTS: Record<string, string[]> = {
  Mandya: ['Mandya', 'Maddur', 'Malavalli', 'Srirangapatna', 'Pandavapura', 'Nag 选择 naganahalli'],
  Mysuru: ['Mysuru', 'Nanjangud', 'Hunsur', 'T Narasipura', 'K R Nagara'],
  Hassan: ['Hassan', 'Arsikere', 'Channarayapatna', 'Holenarasipura', 'Sakleshpur'],
  Dharwad: ['Dharwad', 'Hubballi', 'Kalghatgi', 'Navalgund', 'Kundgol'],
  Kolar: ['Kolar', 'Bangarapet', 'Mulbagal', 'Malur', 'Srinivasapur'],
};
