export const CROPS = [
  { id: 'paddy', label: 'Paddy', emoji: '🌾' },
  { id: 'onion', label: 'Onion', emoji: '🧅' },
  { id: 'tomato', label: 'Tomato', emoji: '🍅' },
  { id: 'sugarcane', label: 'Sugarcane', emoji: '🎋' },
  { id: 'maize', label: 'Maize', emoji: '🌽' },
  { id: 'wheat', label: 'Wheat', emoji: '🌾' },
  { id: 'cotton', label: 'Cotton', emoji: '🌿' },
  { id: 'potato', label: 'Potato', emoji: '🥔' },
  { id: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
  { id: 'other', label: 'Other', emoji: '➕' },
];
export const cropLabel = (id: string) => CROPS.find((c) => c.id === id)?.label ?? id;
