import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);
}

// Enhanced scroll function for immediate use
export function scrollToTopSmooth() {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
}

export function scrollToTopInstant() {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}