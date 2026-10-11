import { useAuthStore } from '../store/authStore';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:9443/api/v1';

function getAuthHeaders() {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function sendOtpApi(phoneNumber: string) {
  // Sanitize numeric digits
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: cleanPhone }),
  });
  return res.json();
}

export async function verifyOtpApi(phoneNumber: string, otp: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: cleanPhone, otp }),
  });
  return res.json();
}

export async function createFarmerProfileApi(data: {
  accountId: string;
  fullName: string;
  regionId?: string;
  address?: string;
  subProfileData?: any;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/create-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: 'FARMER' }),
  });
  return res.json();
}

export async function fetchLiveProductsApi(regionId?: string) {
  const params = new URLSearchParams();
  if (regionId) params.append('regionId', regionId);
  params.append('isApproved', 'true');

  const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchLiveServicesApi() {
  const res = await fetch(`${API_BASE_URL}/services/available`);
  return res.json();
}

export async function createLabourJobApi(jobData: {
  serviceTitle: string;
  workersNeeded: number;
  durationType?: string;
  durationValue?: number;
  ratePerUnit: number;
  startDate?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/services/jobs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(jobData),
  });
  return res.json();
}

export async function bookEquipmentServiceApi(bookingData: {
  vehicleType: string;
  acreage: number;
  ratePerAcre: number;
  bookingDate?: string;
  servicemanProfileId?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/services/book-equipment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });
  return res.json();
}
