import { useMemo, useState, useCallback } from 'react';
import { HAIRCUTS, getHaircutById } from '../constants/haircuts';
import { Haircut, HaircutCategory } from '../types';

// Categories present in the catalog, in a stable display order.
const CATEGORY_ORDER: HaircutCategory[] = [
  'fade',
  'taper',
  'crop',
  'buzz',
  'quiff',
  'pompadour',
  'fringe',
  'curly',
  'classic',
  'long',
];

export function useCatalog() {
  const [activeCategory, setActiveCategory] = useState<HaircutCategory | 'all'>('all');

  const categories = useMemo<HaircutCategory[]>(() => {
    const present = new Set(HAIRCUTS.map((h) => h.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, []);

  const filtered = useMemo<Haircut[]>(() => {
    if (activeCategory === 'all') return HAIRCUTS;
    return HAIRCUTS.filter((h) => h.category === activeCategory);
  }, [activeCategory]);

  const getById = useCallback((id: string) => getHaircutById(id), []);

  return {
    all: HAIRCUTS,
    categories,
    activeCategory,
    setActiveCategory,
    filtered,
    getById,
  };
}
