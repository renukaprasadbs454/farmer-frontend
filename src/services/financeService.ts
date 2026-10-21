import { getApiBaseUrl } from './api';
import { useAuthStore } from '../store/authStore';

function getAuthHeaders() {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ── 1. LOANS API ──
export async function fetchLoanOffersApi(loanType?: string) {
  try {
    const params = new URLSearchParams();
    if (loanType) params.append('loanType', loanType);
    const res = await fetch(`${getApiBaseUrl()}/loans/offers?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch loan offers from server, using fallback', error);
    return [
      {
        id: 'loan-offer-sbi-kcc-001',
        title: 'SBI Kisan Credit Card (KCC) Crop Loan',
        loanType: 'CROP_LOAN',
        providerName: 'State Bank of India (SBI Agri)',
        interestRatePercent: 4.0,
        minAmount: 15000,
        maxAmount: 300000,
        tenureMonthsMin: 6,
        tenureMonthsMax: 12,
        subsidyPercent: 3.0,
        documentsRequired: ['Aadhaar Card', 'Land Record (RTC / 7-12 Extract)', 'Bank Passbook'],
        description: 'Subsidized short-term crop cultivation loan with 3% prompt repayment incentive. Effective rate only 4% p.a.',
      },
      {
        id: 'loan-offer-hdfc-land-002',
        title: 'HDFC Bank Land Mortgage & Development Loan',
        loanType: 'LAND_MORTGAGE',
        providerName: 'HDFC Rural Banking',
        interestRatePercent: 7.25,
        minAmount: 50000,
        maxAmount: 1500000,
        tenureMonthsMin: 12,
        tenureMonthsMax: 60,
        subsidyPercent: 0.0,
        documentsRequired: ['7/12 & 8A Extract', 'Registered Title Deed', 'PAN Card'],
        description: 'Term credit against farm land mortgage for farm fencing, borewell drilling, and solar pump installation.',
      },
    ];
  }
}

export async function applyForLoanApi(payload: Record<string, any>) {
  const res = await fetch(`${getApiBaseUrl()}/loans/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchMyLoanApplicationsApi() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/loans/my-applications`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch my loan applications', error);
    return [];
  }
}

// ── 2. INSURANCE API ──
export async function fetchInsuranceOffersApi(insuranceType?: string) {
  try {
    const params = new URLSearchParams();
    if (insuranceType) params.append('insuranceType', insuranceType);
    const res = await fetch(`${getApiBaseUrl()}/insurance/offers?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch insurance schemes from server, using fallback', error);
    return [
      {
        id: 'insurance-pmfby-scheme-001',
        policyName: 'PMFBY - Pradhan Mantri Fasal Bima Yojana',
        insuranceType: 'PMFBY_SCHEME',
        underwriterName: 'Agriculture Insurance Company of India (AIC)',
        coveredCrops: ['Onion', 'Tomato', 'Sugarcane', 'Paddy', 'Cotton', 'Wheat'],
        premiumRatePercent: 2.0,
        sumInsuredPerAcre: 40000.0,
        perilsCovered: ['Drought', 'Flood', 'Pest Attack', 'Hailstorm', 'Unseasonal Rains'],
        coverageDetails: 'Complete yield loss coverage from sowing to post-harvest. Farmer pays only 2% premium, remaining funded by Govts.',
      },
      {
        id: 'insurance-weather-index-002',
        policyName: 'Parametric Weather Shield & Rainfall Deficit Cover',
        insuranceType: 'WEATHER_INDEX_INSURANCE',
        underwriterName: 'Bajaj Allianz General Insurance',
        coveredCrops: ['Tomato', 'Chilli', 'Pomegranate', 'Grapes', 'Onion'],
        premiumRatePercent: 3.5,
        sumInsuredPerAcre: 60000.0,
        perilsCovered: ['Excess Rainfall', 'Consecutive Dry Spell (>21 days)', 'Extreme Heat Wave'],
        coverageDetails: 'Automated parametric payout linked directly to IMD automatic weather stations without requiring manual field loss surveyor.',
      },
    ];
  }
}

export async function applyForInsuranceApi(payload: Record<string, any>) {
  const res = await fetch(`${getApiBaseUrl()}/insurance/apply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchMyInsuranceApplicationsApi() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/insurance/my-applications`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch my insurance applications', error);
    return [];
  }
}

export async function fileInsuranceClaimApi(id: string, payload: Record<string, any>) {
  const res = await fetch(`${getApiBaseUrl()}/insurance/applications/${id}/claim`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ── 3. CROP INVEST / STOCK MARKET API ──
export async function fetchCropCommoditiesApi(category?: string) {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    const res = await fetch(`${getApiBaseUrl()}/invest/crops?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch crop market from server, using fallback', error);
    return [
      {
        id: 'crop-cmd-onion-nashik-001',
        cropName: 'Nashik Red Onion (Mandi Grade A)',
        category: 'Vegetables',
        variety: 'Garwa Red',
        unit: 'Quintal',
        currentPrice: 1650.0,
        openingPrice: 1200.0,
        changePercent: 37.5,
        dayHigh: 1720.0,
        dayLow: 1180.0,
        minInvestmentUnits: 1.0,
        maxInvestmentUnits: 250.0,
      },
      {
        id: 'crop-cmd-tomato-hybrid-002',
        cropName: 'Hybrid Table Tomato (Kolar/Pune)',
        category: 'Vegetables',
        variety: 'Abhinav Firm',
        unit: 'Quintal',
        currentPrice: 2800.0,
        openingPrice: 2200.0,
        changePercent: 27.27,
        dayHigh: 2950.0,
        dayLow: 2150.0,
        minInvestmentUnits: 1.0,
        maxInvestmentUnits: 150.0,
      },
      {
        id: 'crop-cmd-wheat-sharbati-003',
        cropName: 'Lokwan Sharbati Wheat',
        category: 'Grains',
        variety: 'Lokwan Premium Grain',
        unit: 'Quintal',
        currentPrice: 3100.0,
        openingPrice: 2950.0,
        changePercent: 5.08,
        dayHigh: 3150.0,
        dayLow: 2920.0,
        minInvestmentUnits: 2.0,
        maxInvestmentUnits: 500.0,
      },
    ];
  }
}

export async function investInCropApi(payload: {
  commodityId: string;
  unitsPurchased: number;
  farmerName: string;
  farmerPhone: string;
}) {
  const res = await fetch(`${getApiBaseUrl()}/invest/buy`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function sellCropInvestmentApi(investmentId: string) {
  const res = await fetch(`${getApiBaseUrl()}/invest/sell/${investmentId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchMyPortfolioApi() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/invest/my-portfolio`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Failed to fetch farmer portfolio', error);
    return {
      summary: { totalInvested: 0, totalCurrentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0, totalRealizedPnL: 0 },
      data: [],
    };
  }
}

// ── 4. WAREHOUSES API ──
export async function fetchWarehouseListingsApi(warehouseType?: string, district?: string) {
  try {
    const params = new URLSearchParams();
    if (warehouseType) params.append('warehouseType', warehouseType);
    if (district) params.append('district', district);
    const res = await fetch(`${getApiBaseUrl()}/warehouses/listings?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch warehouses from server, using fallback', error);
    return [
      {
        id: 'warehouse-mandya-cold-001',
        name: 'Mandya Agro Cold Chain & Logistics Hub',
        warehouseType: 'COLD_STORAGE',
        location: 'Plot 45-B, Mandya Industrial Area',
        district: 'Mandya',
        state: 'Karnataka',
        totalCapacitySqFt: 15000.0,
        availableCapacitySqFt: 6200.0,
        rentPerSqFtDay: 1.40,
        rentPerSqFtMonth: 36.0,
        temperatureRange: '0°C to 4°C (Humidity 85-90%)',
        features: ['24/7 CCTV', 'Diesel Generator Backup', 'Goods In-Transit Insurance', 'Forklift Bay'],
        contactPerson: 'Santhosh Kumar',
        contactPhone: '+91 9448199221',
      },
      {
        id: 'warehouse-nashik-godown-002',
        name: 'Nashik APMC Aerated Onion & Grain Godown',
        warehouseType: 'DRY_GRAIN_GODOWN',
        location: 'Lasalgaon Mandi Yard, Niphad Taluka',
        district: 'Nashik',
        state: 'Maharashtra',
        totalCapacitySqFt: 35000.0,
        availableCapacitySqFt: 14500.0,
        rentPerSqFtDay: 0.85,
        rentPerSqFtMonth: 22.0,
        temperatureRange: 'Ambient Natural Air-Flow Ventilated',
        features: ['Slotted Aeration Grills', 'Fumigation & Rodent Shield', 'Electronic Weighbridge'],
        contactPerson: 'Nitin Kadam',
        contactPhone: '+91 9822044882',
      },
    ];
  }
}

export async function bookWarehouseSpaceApi(payload: Record<string, any>) {
  const res = await fetch(`${getApiBaseUrl()}/warehouses/book`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchMyWarehouseBookingsApi() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/warehouses/my-bookings`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.warn('Failed to fetch my warehouse bookings', error);
    return [];
  }
}
