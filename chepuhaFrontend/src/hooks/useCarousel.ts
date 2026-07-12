import { useState, useCallback } from 'react';
import { TEMPLATES } from '../config/templates';

export const CAROUSEL_TEMPLATES = ['custom_ai', 'random', ...Object.keys(TEMPLATES)];

export const useCarousel = () => {
  const [carouselIndex, setCarouselIndex] = useState<number>(() => {
    const savedIdx = localStorage.getItem('chepuhaCarouselIdx');
    if (savedIdx !== null) return parseInt(savedIdx, 10);
    return 0;
  });

  const moveCarousel = useCallback((dir: 1 | -1, setAppState: any) => {
    setCarouselIndex(prev => {
      const next = (prev + dir + CAROUSEL_TEMPLATES.length) % CAROUSEL_TEMPLATES.length;
      const chosen = CAROUSEL_TEMPLATES[next];
      localStorage.setItem('chepuhaCarouselIdx', String(next));
      setAppState((ps: any) => ({ ...ps, selectedTemplate: chosen === 'random' ? 'random' : chosen }));
      return next;
    });
  }, []);

  return {
    carouselIndex,
    setCarouselIndex,
    moveCarousel,
    CAROUSEL_TEMPLATES
  };
};
