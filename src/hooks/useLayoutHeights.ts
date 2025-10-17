import { useEffect, useState } from 'react';

interface LayoutHeights {
  headerHeight: number;
  footerHeight: number;
}

export const useLayoutHeights = (): LayoutHeights => {
  const [heights, setHeights] = useState<LayoutHeights>({
    headerHeight: 80,
    footerHeight: 96
  });

  useEffect(() => {
    const measureHeights = () => {
      // Find header element (look for common header selectors)
      const headerSelectors = [
        'header',
        '[data-header]',
        '.header',
        '#header',
        'nav',
        '[role="banner"]'
      ];
      
      let headerElement: Element | null = null;
      for (const selector of headerSelectors) {
        headerElement = document.querySelector(selector);
        if (headerElement) break;
      }

      // Find footer element (look for common footer selectors)
      const footerSelectors = [
        'footer',
        '[data-footer]',
        '.footer',
        '#footer',
        '[role="contentinfo"]'
      ];
      
      let footerElement: Element | null = null;
      for (const selector of footerSelectors) {
        footerElement = document.querySelector(selector);
        if (footerElement) break;
      }

      // Measure heights
      const headerHeight = headerElement ? headerElement.getBoundingClientRect().height : 80;
      const footerHeight = footerElement ? footerElement.getBoundingClientRect().height : 96;

      // Set CSS custom properties
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);

      setHeights({ headerHeight, footerHeight });
    };

    // Measure on mount
    measureHeights();

    // Measure on window resize
    const handleResize = () => {
      // Debounce resize events
      clearTimeout((window as any).resizeTimeout);
      (window as any).resizeTimeout = setTimeout(measureHeights, 100);
    };

    window.addEventListener('resize', handleResize);

    // Measure after a short delay to ensure components are rendered
    const timeoutId = setTimeout(measureHeights, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
      clearTimeout((window as any).resizeTimeout);
    };
  }, []);

  return heights;
}; 