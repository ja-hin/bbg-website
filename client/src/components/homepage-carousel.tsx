import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomepageBanner } from "@shared/schema";

interface HomepageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}

function ProgressiveImage({ src, alt, className = "", onClick, priority = false }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className="relative w-full overflow-hidden" onClick={onClick}>
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLoaded && !hasError ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
        }}
      />
      
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-auto transition-all duration-500 ${
            isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
          } ${className}`}
          style={{ imageRendering: 'crisp-edges' }}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
        />
      )}
      
      {hasError && (
        <div className="w-full aspect-[16/6] md:aspect-[16/5] flex items-center justify-center bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6]">
          <div className="text-center text-white px-8 py-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">XtraCover Protection</h2>
            <p className="text-lg opacity-90">Protect your devices with our plans</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function HomepageCarousel({ autoPlay = true, autoPlayInterval = 15000 }: HomepageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: allBanners = [], isLoading } = useQuery({
    queryKey: ['/api/homepage-banners'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-banners');
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      return response.json();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    if (!autoPlay || slideCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slideCount]);

  useEffect(() => {
    if (!hasBanners) return;
    
    banners.slice(0, 2).forEach((banner: HomepageBanner) => {
      const desktopImg = new Image();
      desktopImg.src = banner.desktopImageUrl;
      
      const mobileImg = new Image();
      mobileImg.src = banner.mobileImageUrl;
    });
  }, [banners, hasBanners]);

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

  if (isLoading || !hasBanners) {
    return (
      <section className="relative w-full">
        <div 
          className="w-full min-h-[280px] md:min-h-[400px]"
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
          }}
        />
      </section>
    );
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
              <div className="hidden md:block">
                <ProgressiveImage
                  src={banner.desktopImageUrl}
                  alt={banner.title || "Banner Image"}
                  className="cursor-pointer"
                  onClick={() => handleBannerClick(banner)}
                  priority={index === 0}
                />
              </div>

              <div className="block md:hidden">
                <ProgressiveImage
                  src={banner.mobileImageUrl}
                  alt={banner.title || "Banner Image"}
                  className="cursor-pointer"
                  onClick={() => handleBannerClick(banner)}
                  priority={index === 0}
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
