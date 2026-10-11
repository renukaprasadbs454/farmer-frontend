import { sendOtpApi, verifyOtpApi } from './api';

export const authService = {
  async sendOtp(mobile: string): Promise<void> {
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      throw new Error('Enter a valid 10-digit mobile number.');
    }
    const res = await sendOtpApi(mobile);
    if (!res.success) {
      throw new Error(res.message || 'Failed to send OTP.');
    }
  },

  async verifyOtp(mobile: string, otp: string): Promise<{ token: string; account?: any; activeProfile?: any }> {
    const res = await verifyOtpApi(mobile, otp);

    if (!res.success) {
      throw new Error(res.message || 'The OTP entered is incorrect. Please try again.');
    }

    const token = res.data?.token || '';

    return {
      token,
      account: res.data?.account,
      activeProfile: res.data?.activeProfile,
    };
  },
};

