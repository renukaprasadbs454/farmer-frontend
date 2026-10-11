import { MOCK_LABOURERS } from '../constants/mockServices';
import { Labourer, LabourFilters } from '../types';
import { API_BASE_URL } from './api';

export const labourService = {
  async getLabourers(
    search?: string,
    filters?: Partial<LabourFilters>,
  ): Promise<Labourer[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users?role=LABOUR`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const liveLabourers: Labourer[] = data.data.map((u: any) => ({
          id: u.id,
          name: u.fullName,
          avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          phone: `+91 ${u.account?.phoneNumber}`,
          rating: u.labourProfile?.rating || 4.8,
          reviewCount: 15,
          completedJobs: 24,
          primarySkill: u.labourProfile?.servicesOffered?.[0] || 'General Farm Help',
          secondarySkills: u.labourProfile?.servicesOffered || [],
          hourlyRate: u.labourProfile?.hourlyRate || 80,
          dailyRate: u.labourProfile?.dailyRate || 500,
          teamSize: 5,
          availability: 'available',
          location: {
            label: u.address || `${u.region?.name} Market`,
            village: u.region?.name || 'Pune',
            district: u.region?.district || 'Pune',
            state: u.region?.state || 'Maharashtra',
            lat: 18.5204,
            lng: 73.8567,
          },
          distance: 3.5,
          bio: 'Experienced farm hand team for sowing, harvesting, and field maintenance.',
          verified: true,
          gender: 'mixed',
        }));
        return liveLabourers;
      }
    } catch (e) {
      console.warn('Falling back to local labour data:', e);
    }

    return [...MOCK_LABOURERS];
  },

  async getLabourerById(id: string): Promise<Labourer | null> {
    const labourers = await this.getLabourers();
    return labourers.find((l) => l.id === id) ?? MOCK_LABOURERS.find((l) => l.id === id) ?? null;
  },

  async getNearbyLabourers(limit = 3): Promise<Labourer[]> {
    const labourers = await this.getLabourers();
    return labourers.slice(0, limit);
  },
};
