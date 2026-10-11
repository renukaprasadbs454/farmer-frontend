import { EntityReview, SupportTicket } from '../types';

export const MOCK_REVIEWS: EntityReview[] = [
  {
    id: 'rev-001',
    entityType: 'labour',
    entityId: 'l1',
    reviewerId: 'farmer-current',
    reviewerName: 'Ramesh Gowda',
    rating: 5,
    comment: 'Punctual and very skilled in tomato harvesting. Handled the crop carefully.',
    createdAt: '2026-08-10',
    verified: true,
  },
  {
    id: 'rev-002',
    entityType: 'labour',
    entityId: 'l1',
    reviewerId: 'farmer-002',
    reviewerName: 'Suresh Patil',
    rating: 4.5,
    comment: 'Great work ethic. Completed paddy planting work ahead of schedule.',
    createdAt: '2026-07-28',
    verified: true,
  },
  {
    id: 'rev-003',
    entityType: 'machinery',
    entityId: 'm1',
    reviewerId: 'farmer-current',
    reviewerName: 'Ramesh Gowda',
    rating: 5,
    comment: 'Mahindra 575 DI tractor was in excellent condition. Operator was experienced.',
    createdAt: '2026-09-02',
    verified: true,
  },
  {
    id: 'rev-004',
    entityType: 'product',
    entityId: 'prod-001',
    reviewerId: 'farmer-003',
    reviewerName: 'Basavaraj K',
    rating: 5,
    comment: 'Germination rate was above 90%. Got deep red tomatoes with high market value.',
    createdAt: '2026-08-15',
    verified: true,
  },
];

export const MOCK_FAQS = [
  {
    q: 'How do I find labourers near my farm?',
    a: 'Go to the Services tab, select "Labour", and browse nearby workers sorted by distance and skill. Tap "Request Worker" to book.',
  },
  {
    q: 'How do I book a tractor or JCB?',
    a: 'Under Services tab, select "Machinery", choose your required machine type, enter duration or acreage, and send a booking request.',
  },
  {
    q: 'How do I buy fertilizers, seeds or pesticides?',
    a: 'Open the Market tab, click "Buy Products", search or select a category, add items to your cart, and proceed to checkout.',
  },
  {
    q: 'How do I sell my harvested crops directly to buyers?',
    a: 'Go to Market → "Sell Crops", tap "+ List Your Crop", fill in crop details, price, quantity, and publish. Wholesale buyers will send purchase requests.',
  },
  {
    q: 'What happens when a buyer accepts or sends a request?',
    a: 'You will receive an instant notification under 🔔 Notifications. You can review the offer, accept or reject it under Market → Sell.',
  },
  {
    q: 'How do I change the app language?',
    a: 'Go to My Farm → Settings or My Farm tab directly, and select your preferred language (English, Hindi, or Kannada).',
  },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-101',
    category: 'Crop Sale',
    description: 'Enquired about transport options for Mandya APMC market pickup.',
    createdAt: '2026-09-25',
    status: 'resolved',
  },
];
