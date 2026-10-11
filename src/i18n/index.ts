import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Lang } from '../types';
import { Dict, en } from './en';
import { hi } from './hi';
import { kn } from './kn';

const dictionaries: Record<Lang, Partial<Dict>> = { en, hi, kn };

// Add a language: create <code>.ts, register it above and in LANGUAGES.
export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}
export const useLangStore = create<LangState>()(
  persist((set) => ({ lang: 'en', setLang: (lang) => set({ lang }) }), {
    name: 'fm-lang',
    storage: createJSONStorage(() => AsyncStorage),
  }),
);

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key: keyof Dict): string => dictionaries[lang][key] ?? en[key];
}
