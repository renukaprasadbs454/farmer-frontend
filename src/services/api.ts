import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

export function getApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  const fallbackUrl = __DEV__ ? 'http://localhost:9443/api/v1' : '';
  const apiUrl = configuredUrl || fallbackUrl;

  if (!apiUrl) {
    throw new Error('Farmer Mate API URL is not configured. Set EXPO_PUBLIC_API_URL before building the APK.');
  }

  if (Platform.OS !== 'web' && !__DEV__ && /localhost|127\.0\.0\.1/i.test(apiUrl)) {
    throw new Error('Installed APK cannot use localhost API. Set EXPO_PUBLIC_API_URL to the live backend URL before building.');
  }

  return apiUrl.replace(/\/+$/, '');
}

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL?.trim() || (__DEV__ ? 'http://localhost:9443/api/v1' : '')).replace(/\/+$/, '');

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
  const res = await fetch(`${getApiBaseUrl()}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: cleanPhone }),
  });
  return res.json();
}

export async function verifyOtpApi(phoneNumber: string, otp: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const res = await fetch(`${getApiBaseUrl()}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: cleanPhone, otp }),
  });
  return res.json();
}

export async function fetchMeApi(token: string) {
  const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createFarmerProfileApi(data: {
  accountId: string;
  fullName: string;
  regionId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  taluk?: string;
  hobli?: string;
  village?: string;
  pincode?: string;
  subProfileData?: any;
}) {
  const res = await fetch(`${getApiBaseUrl()}/auth/create-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: 'FARMER' }),
  });
  return res.json();
}

export async function updateFarmerProfileApi(data: any) {
  const res = await fetch(`${getApiBaseUrl()}/users/farmer-profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchLiveProductsApi(query?: {
  regionId?: string;
  categorySlug?: string;
  search?: string;
  sortBy?: string;
}) {
  const params = new URLSearchParams();
  if (query?.regionId) params.append('regionId', query.regionId);
  if (query?.categorySlug) params.append('categorySlug', query.categorySlug);
  if (query?.search) params.append('search', query.search);
  if (query?.sortBy) params.append('sortBy', query.sortBy);
  params.append('isApproved', 'true');

  const res = await fetch(`${getApiBaseUrl()}/products?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchLiveServicesApi() {
  const res = await fetch(`${getApiBaseUrl()}/services/available`);
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
  const res = await fetch(`${getApiBaseUrl()}/services/jobs`, {
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
  const res = await fetch(`${getApiBaseUrl()}/services/book-equipment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookingData),
  });
  return res.json();
}

export async function fetchUserConversationApi(params: {
  userProfileId?: string;
  farmerName?: string;
  farmerPhone?: string;
  regionName?: string;
}) {
  const search = new URLSearchParams();
  if (params.userProfileId) search.append('userProfileId', params.userProfileId);
  if (params.farmerName) search.append('farmerName', params.farmerName);
  if (params.farmerPhone) search.append('farmerPhone', params.farmerPhone);
  if (params.regionName) search.append('regionName', params.regionName);

  const res = await fetch(`${getApiBaseUrl()}/chat/conversation?${search.toString()}`);
  return res.json();
}

export async function postUserMessageApi(payload: {
  conversationId?: string;
  userProfileId?: string;
  farmerName?: string;
  farmerPhone?: string;
  regionName?: string;
  text?: string;
  type?: 'TEXT' | 'VOICE' | 'IMAGE' | 'VIDEO';
  mediaUrl?: string;
  durationSeconds?: number;
}) {
  const res = await fetch(`${getApiBaseUrl()}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
