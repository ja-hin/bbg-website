import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomepageBanner } from "@shared/schema";

interface HomepageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onFirstImageLoaded?: () => void;
}

function CarouselSkeleton() {
  return (
    <section className="relative w-full">
      <div className="relative w-full overflow-hidden">
        <div className="hidden md:block">
          <Skeleton className="w-full h-[400px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        </div>
        <div className="block md:hidden">
          <Skeleton className="w-full h-[250px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export function HomepageCarousel({ autoPlay = true, autoPlayInterval = 5000, onFirstImageLoaded }: HomepageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const firstDesktopImgRef = useRef<HTMLImageElement>(null);
  const firstMobileImgRef = useRef<HTMLImageElement>(null);

  // FAST: Fetch only the first banner immediately for quick initial render
  const { data: firstBanner, isLoading: isFirstLoading } = useQuery({
    queryKey: ['/api/homepage-banners/first'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-banners/first');
      if (!response.ok) {
        throw new Error('Failed to fetch first banner');
      }
      return response.json();
    },
    retry: false,
    staleTime: 600000,
    gcTime: 900000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // DEFERRED: Fetch all banners after first image loads (or after timeout)
  const { data: allBanners = [] } = useQuery({
    queryKey: ['/api/homepage-banners'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-banners');
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      return response.json();
    },
    retry: false,
    staleTime: 600000,
    gcTime: 900000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: firstImageLoaded
  });

  // Merge banners: use first banner immediately, then full list when available
  const banners = useMemo(() => {
    const fullBanners = allBanners.filter((banner: HomepageBanner) => 
      banner.title !== "Who can use these plans"
    );
    
    if (fullBanners.length > 0) {
      return fullBanners;
    }
    
    if (firstBanner) {
      return [firstBanner];
    }
    
    return [];
  }, [firstBanner, allBanners]);

  useEffect(() => {
    if (firstDesktopImgRef.current) {
      firstDesktopImgRef.current.setAttribute('fetchpriority', 'high');
    }
    if (firstMobileImgRef.current) {
      firstMobileImgRef.current.setAttribute('fetchpriority', 'high');
    }
  }, [banners]);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1 || !firstImageLoaded) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, banners.length, firstImageLoaded]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner: HomepageBanner) => {
    if (banner.linkUrl) {
      window.location.href = banner.linkUrl;
    }
  };

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded(prev => ({ ...prev, [index]: true }));
    if (index === 0 && !firstImageLoaded) {
      setFirstImageLoaded(true);
      onFirstImageLoaded?.();
    }
  }, [firstImageLoaded, onFirstImageLoaded]);

  // Handle case when no banners exist
  useEffect(() => {
    if (!isFirstLoading && !firstBanner && !firstImageLoaded) {
      setFirstImageLoaded(true);
      onFirstImageLoaded?.();
    }
  }, [isFirstLoading, firstBanner, firstImageLoaded, onFirstImageLoaded]);

  // Show skeleton while API is loading OR while waiting for first image
  // This ensures skeleton appears immediately on page load
  if (isFirstLoading || (banners.length > 0 && !firstImageLoaded)) {
    return (
      <section className="relative w-full">
        <div className="relative w-full overflow-hidden">
          {/* Show skeleton as placeholder */}
          <div className="hidden md:block">
            <Skeleton className="w-full h-[400px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          </div>
          <div className="block md:hidden">
            <Skeleton className="w-full h-[250px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          </div>
          
          {/* Preload the first image in the background (hidden) */}
          {banners.length > 0 && (
            <>
              <img
                ref={firstDesktopImgRef}
                src={banners[0].desktopImageUrl}
                alt=""
                className="hidden"
                loading="eager"
                onLoad={() => handleImageLoad(0)}
                onError={() => handleImageLoad(0)}
              />
              <img
                ref={firstMobileImgRef}
                src={banners[0].mobileImageUrl}
                alt=""
                className="hidden"
                loading="eager"
                onLoad={() => handleImageLoad(0)}
                onError={() => handleImageLoad(0)}
              />
            </>
          )}
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
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
                className="hidden md:block relative w-full cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="w-full overflow-hidden">
                  {!imagesLoaded[index] && (
                    <Skeleton className="absolute inset-0 w-full h-[400px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  )}
                  <img
                    ref={index === 0 ? firstDesktopImgRef : undefined}
                    src={banner.desktopImageUrl}
                    alt="Banner Image"
                    className={`w-full h-auto transition-opacity duration-300 ${imagesLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                    style={{ imageRendering: 'crisp-edges' }}
                    loading={index === 0 ? "eager" : "lazy"}
                    onLoad={() => handleImageLoad(index)}
                    onError={(e) => {
                      console.error('Desktop image failed to load:', banner.desktopImageUrl);
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('/uploads/')) {
                        img.src = `/uploads/${banner.desktopImageUrl.split('/').pop()}`;
                      }
                      handleImageLoad(index);
                    }}
                  />
                </div>
              </div>

              <div 
                className="block md:hidden relative w-full cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="w-full overflow-hidden">
                  {!imagesLoaded[index] && (
                    <Skeleton className="absolute inset-0 w-full h-[250px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  )}
                  <img
                    ref={index === 0 ? firstMobileImgRef : undefined}
                    src={banner.mobileImageUrl}
                    alt="Banner Image"
                    className={`w-full h-auto transition-opacity duration-300 ${imagesLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                    style={{ imageRendering: 'crisp-edges' }}
                    loading={index === 0 ? "eager" : "lazy"}
                    onLoad={() => handleImageLoad(index)}
                    onError={(e) => {
                      console.error('Mobile image failed to load:', banner.mobileImageUrl);
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('/uploads/')) {
                        img.src = `/uploads/${banner.mobileImageUrl.split('/').pop()}`;
                      }
                      handleImageLoad(index);
                    }}
                  />
                </div>
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

export { CarouselSkeleton };
