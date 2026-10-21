import { MOCK_MACHINERY } from '../constants/mockServices';
import { Machinery, MachineryCategory, MachineryFilters } from '../types';
import { getApiBaseUrl } from './api';

function mapTitleToMachineryType(title: string): MachineryCategory {
  const t = title.toLowerCase();
  if (t.includes('harvester')) return 'harvester';
  if (t.includes('drone') || t.includes('spray')) return 'sprayer';
  if (t.includes('jcb') || t.includes('excavator')) return 'jcb';
  if (t.includes('leveler')) return 'cultivator';
  if (t.includes('weeder') || t.includes('tiller')) return 'rotavator';
  if (t.includes('tanker')) return 'water_tanker';
  return 'tractor';
}

export const machineryService = {
  async getMachinery(
    search?: string,
    filters?: Partial<MachineryFilters>,
  ): Promise<Machinery[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/services/available?category=VEHICLE`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        let liveMachinery: Machinery[] = data.data.map((s: any, idx: number) => {
          const hourlyMatch = s.description?.match(/₹([\d,]+)\/hr/);
          const acreMatch = s.description?.match(/₹([\d,]+)\/acre/);
          const hourlyRate = hourlyMatch ? Number(hourlyMatch[1].replace(/,/g, '')) : 1000;
          const perAcreRate = acreMatch ? Number(acreMatch[1].replace(/,/g, '')) : 1200;
          const type = mapTitleToMachineryType(s.title);

          return {
            id: s.id,
            name: s.title.endsWith('Service') ? s.title : `${s.title} Service`,
            type,
            provider: 'Certified Fleet Dispatch', // Strictly Platform Fleet, NO personal owner details!
            rating: 4.8,
            reviewCount: 38 + idx * 6,
            location: {
              label: 'Fleet Dispatch Hub',
              district: 'Mandya',
              state: 'Karnataka',
              latitude: 12.5218,
              longitude: 76.8951,
            },
            distance: 3.5 + (idx % 3) * 1.2,
            hourlyRate,
            dailyRate: hourlyRate * 6,
            perAcreRate,
            operatorIncluded: true,
            availability: (idx % 4 === 3 ? 'available_tomorrow' : 'available_today') as any,
            specifications: ['Commercial Grade Machine', 'Operator & Fuel Included', 'GPS Tracked Dispatch'],
            minimumBookingHours: 2,
            description: s.description || 'Heavy-duty agricultural machinery dispatched directly to your field with a certified operator.',
            reviews: [
              {
                id: `mrev-${s.id}-1`,
                reviewerName: 'Verified Farmer',
                rating: 5,
                comment: 'Equipment dispatched on schedule. Field work executed with high precision.',
                date: '2026-09-22',
              },
            ],
          };
        });

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          liveMachinery = liveMachinery.filter(
            (item) => item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q),
          );
        }

        if (filters?.category && filters.category !== 'all') {
          liveMachinery = liveMachinery.filter((item) => item.type === filters.category);
        }

        return liveMachinery;
      }
    } catch (e) {
      console.warn('Falling back to local machinery services:', e);
    }

    let fallback = [...MOCK_MACHINERY];
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      fallback = fallback.filter(
        (item) => item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q),
      );
    }
    if (filters?.category && filters.category !== 'all') {
      fallback = fallback.filter((item) => item.type === filters.category);
    }
    return fallback;
  },

  async getMachineryById(id: string): Promise<Machinery | null> {
    const items = await this.getMachinery();
    return items.find((m) => m.id === id) ?? MOCK_MACHINERY.find((m) => m.id === id) ?? null;
  },

  async getNearbyMachinery(limit = 3): Promise<Machinery[]> {
    const items = await this.getMachinery();
    return items.slice(0, limit);
  },
};
