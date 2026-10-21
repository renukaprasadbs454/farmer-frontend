import { MOCK_LABOURERS } from '../constants/mockServices';
import { LabourCategory, Labourer, LabourFilters } from '../types';
import { getApiBaseUrl } from './api';

function mapTitleToCategory(title: string): LabourCategory {
  const t = title.toLowerCase();
  if (t.includes('cut') || t.includes('harvest') || t.includes('thresh')) return 'harvesting';
  if (t.includes('weed') || t.includes('clean')) return 'weeding';
  if (t.includes('sow') || t.includes('plant') || t.includes('transplant')) return 'planting';
  if (t.includes('spray') || t.includes('pesticide') || t.includes('fertilizer')) return 'spraying';
  if (t.includes('irrigat') || t.includes('drip')) return 'irrigation';
  if (t.includes('load') || t.includes('bag') || t.includes('pack')) return 'loading';
  return 'general';
}

export const labourService = {
  async getLabourers(
    search?: string,
    filters?: Partial<LabourFilters>,
  ): Promise<Labourer[]> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/services/available?category=LABOUR`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        let liveServices: Labourer[] = data.data.map((s: any, idx: number) => {
          const dailyMatch = s.description?.match(/₹(\d+)\/day/);
          const hourlyMatch = s.description?.match(/₹(\d+)\/hr/);
          const dailyRate = dailyMatch ? Number(dailyMatch[1]) : 450;
          const hourlyRate = hourlyMatch ? Number(hourlyMatch[1]) : 70;
          const skill = mapTitleToCategory(s.title);

          return {
            id: s.id,
            name: s.title.endsWith('Service') ? s.title : `${s.title} Service`,
            primarySkill: skill,
            secondarySkills: [skill],
            rating: 4.8,
            completedJobs: 95 + idx * 12,
            experience: 6,
            location: {
              label: 'Cluster Service Center',
              district: 'Mandya',
              state: 'Karnataka',
              latitude: 12.5218,
              longitude: 76.8951,
            },
            distance: 2.8 + (idx % 4) * 1.1,
            hourlyRate,
            dailyRate,
            availability: (idx % 5 === 4 ? 'available_tomorrow' : 'available_today') as any,
            about: s.description || 'Professional farm labour service dispatched with background-checked crews and standard agricultural tools.',
            reviews: [
              {
                id: `rev-${s.id}-1`,
                reviewerName: 'Verified Farmer',
                rating: 5,
                comment: 'Labour crew arrived punctually and completed farm operations cleanly.',
                date: '2026-09-24',
              },
            ],
          };
        });

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          liveServices = liveServices.filter(
            (item) => item.name.toLowerCase().includes(q) || item.primarySkill.toLowerCase().includes(q),
          );
        }

        if (filters?.category && filters.category !== 'all') {
          liveServices = liveServices.filter((item) => item.primarySkill === filters.category);
        }

        return liveServices;
      }
    } catch (e) {
      console.warn('Falling back to local labour services:', e);
    }

    let fallback = [...MOCK_LABOURERS];
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      fallback = fallback.filter(
        (item) => item.name.toLowerCase().includes(q) || item.primarySkill.toLowerCase().includes(q),
      );
    }
    if (filters?.category && filters.category !== 'all') {
      fallback = fallback.filter((item) => item.primarySkill === filters.category);
    }
    return fallback;
  },

  async getLabourerById(id: string): Promise<Labourer | null> {
    const list = await this.getLabourers();
    return list.find((l) => l.id === id) ?? MOCK_LABOURERS.find((l) => l.id === id) ?? null;
  },

  async getNearbyLabourers(limit = 3): Promise<Labourer[]> {
    const list = await this.getLabourers();
    return list.slice(0, limit);
  },
};
