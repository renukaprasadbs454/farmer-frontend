import { FarmerProfile } from '../types';
import { wait } from '../utils/delay';

export const farmerService = {
  async saveProfile(profile: FarmerProfile): Promise<FarmerProfile> {
    await wait(700);
    return profile;
  },
};
