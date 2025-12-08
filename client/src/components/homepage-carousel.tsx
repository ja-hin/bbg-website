import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomepageBanner } from "@shared/schema";

interface HomepageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HomepageCarousel({ autoPlay = true, autoPlayInterval = 15000 }: HomepageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const preloadedRef = useRef(false);

  const { data: allBanners = [] } = useQuery({
    queryKey: ['/api/homepage-banners'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-banners');
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      return response.json();
    },
    retry: 1,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const banners = useMemo(() => 
    allBanners.filter((banner: HomepageBanner) => 
      banner.title !== "Who can use these plans"
    ), [allBanners]
  );

  const hasBanners = banners.length > 0;
  const slideCount = hasBanners ? banners.length : 1;

  useEffect(() => {
    if (!hasBanners || preloadedRef.current) return;
    preloadedRef.current = true;
    
    const firstBanner = banners[0];
    if (firstBanner) {
      const isMobile = window.innerWidth < 768;
      const heroUrl = isMobile ? firstBanner.mobileImageUrl : firstBanner.desktopImageUrl;
      
      const existingPreload = document.querySelector(`link[href="${heroUrl}"]`);
      if (!existingPreload) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = heroUrl;
        document.head.appendChild(preloadLink);
      }
    }
    
    banners.slice(1, 3).forEach((banner: HomepageBanner) => {
      const img = new Image();
      img.src = window.innerWidth < 768 ? banner.mobileImageUrl : banner.desktopImageUrl;
    });
  }, [banners, hasBanners]);

  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slideCount]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handleBannerClick = useCallback((banner: HomepageBanner) => {
    if (banner.linkUrl) {
      window.location.href = banner.linkUrl;
    }
  }, []);

  if (!hasBanners) {
    return null;
  }

  return (
    <section className="relative w-full">
      <div className="relative w-full overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner: HomepageBanner, index: number) => (
            <div key={banner.id} className="w-full flex-shrink-0 relative">
              <div 
                className="hidden md:block cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <img
                  src={banner.desktopImageUrl}
                  alt={banner.title || "Banner Image"}
                  className="w-full h-auto"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding={index === 0 ? "sync" : "async"}
                />
              </div>

              <div 
                className="block md:hidden cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <img
                  src={banner.mobileImageUrl}
                  alt={banner.title || "Banner Image"}
                  className="w-full h-auto"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding={index === 0 ? "sync" : "async"}
                />
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-white/50 shadow-lg z-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-white/50 shadow-lg z-10"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {banners.map((_: HomepageBanner, index: number) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
