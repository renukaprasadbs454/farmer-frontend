import { MOCK_MACHINERY } from '../constants/mockServices';
import { Machinery, MachineryFilters } from '../types';
import { API_BASE_URL } from './api';

export const machineryService = {
  async getMachinery(
    search?: string,
    filters?: Partial<MachineryFilters>,
  ): Promise<Machinery[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/users?role=SERVICEMAN`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const liveMachinery: Machinery[] = data.data.map((u: any) => ({
          id: u.id,
          name: `${u.servicemanProfile?.vehicleType || 'Tractor'} (${u.servicemanProfile?.vehicleNumber || 'MH-12'})`,
          type: (u.servicemanProfile?.vehicleType?.toLowerCase().includes('harvester') ? 'harvester' : 'tractor') as any,
          provider: u.fullName,
          phone: `+91 ${u.account?.phoneNumber}`,
          providerVerified: true,
          images: ['https://images.unsplash.com/photo-1592417817098-8f3d6eb231fc?w=600'],
          rating: u.servicemanProfile?.rating || 4.8,
          reviewCount: 18,
          specs: {
            power: '45 HP',
            fuelType: 'Diesel',
            modelYear: 2024,
            implementsAvailable: ['Plough', 'Rotavator', 'Cultivator'],
          },
          hourlyRate: u.servicemanProfile?.ratePerHour || 1000,
          dailyRate: 6000,
          perAcreRate: u.servicemanProfile?.ratePerAcre || 1200,
          operatorIncluded: true,
          fuelIncluded: true,
          availability: 'available',
          location: {
            label: u.address || `${u.region?.name} City`,
            village: u.region?.name || 'Pune',
            district: u.region?.district || 'Pune',
            state: u.region?.state || 'Maharashtra',
            lat: 18.5204,
            lng: 73.8567,
          },
          distance: 4.2,
          description: 'Heavy duty agricultural machinery with trained operator.',
        }));
        return liveMachinery;
      }
    } catch (e) {
      console.warn('Falling back to local machinery data:', e);
    }

    return [...MOCK_MACHINERY];
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
