import { useState, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'sakinah_favorites_v1';

interface FavoritesState {
  adhkar: string[]; // IDs of favorited adhkar
  hadiths: string[]; // IDs of favorited hadiths
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritesState>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse favorites from localStorage', e);
    }
    return { adhkar: [], hadiths: [] };
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  const toggleDhikrFavorite = (id: string) => {
    setFavorites(prev => {
      const exists = prev.adhkar.includes(id);
      return {
        ...prev,
        adhkar: exists ? prev.adhkar.filter(item => item !== id) : [...prev.adhkar, id],
      };
    });
  };

  const toggleHadithFavorite = (id: string) => {
    setFavorites(prev => {
      const exists = prev.hadiths.includes(id);
      return {
        ...prev,
        hadiths: exists ? prev.hadiths.filter(item => item !== id) : [...prev.hadiths, id],
      };
    });
  };

  const isDhikrFavorite = (id: string) => favorites.adhkar.includes(id);
  const isHadithFavorite = (id: string) => favorites.hadiths.includes(id);

  const totalFavoritesCount = favorites.adhkar.length + favorites.hadiths.length;

  const clearAllFavorites = () => {
    setFavorites({ adhkar: [], hadiths: [] });
  };

  return {
    favorites,
    toggleDhikrFavorite,
    toggleHadithFavorite,
    isDhikrFavorite,
    isHadithFavorite,
    totalFavoritesCount,
    clearAllFavorites,
  };
}
