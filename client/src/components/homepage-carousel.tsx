import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomepageBanner } from "@shared/schema";

interface HomepageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HomepageCarousel({ autoPlay = true, autoPlayInterval = 15000 }: HomepageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  // Fetch active homepage banners (excluding special banners like "Who can use these plans")
  // Use browser cache and stale-while-revalidate pattern for faster loading
  const { data: allBanners = [], isLoading } = useQuery({
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
    refetchOnWindowFocus: false
  });

  // Filter out special banners that are displayed elsewhere
  const banners = allBanners.filter((banner: HomepageBanner) => 
    banner.title !== "Who can use these plans"
  );

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  // Handle banner click
  const handleBannerClick = (banner: HomepageBanner) => {
    if (banner.linkUrl) {
      window.location.href = banner.linkUrl;
    }
  };

  // Handle image load
  const handleImageLoad = (index: number) => {
    setImagesLoaded(prev => ({ ...prev, [index]: true }));
  };

  // Show loading skeleton while fetching banners
  if (isLoading) {
    return (
      <section className="relative w-full">
        <div className="relative w-full overflow-hidden">
          {/* Desktop Skeleton */}
          <div className="hidden md:block">
            <Skeleton className="w-full h-[400px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          </div>
          {/* Mobile Skeleton */}
          <div className="block md:hidden">
            <Skeleton className="w-full h-[250px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  // If no banners, don't render anything
  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full">
      {/* Main Carousel Container */}
      <div className="relative w-full overflow-hidden">
        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner: HomepageBanner, index: number) => (
            <div key={banner.id} className="w-full flex-shrink-0 relative">
              {/* Desktop Image */}
              <div 
                className="hidden md:block relative w-full cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="w-full overflow-hidden">
                  {!imagesLoaded[index] && (
                    <Skeleton className="absolute inset-0 w-full h-[400px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  )}
                  <img
                    src={banner.desktopImageUrl}
                    alt="Banner Image"
                    className={`w-full h-auto transition-opacity duration-300 ${imagesLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                    style={{ imageRendering: 'crisp-edges' }}
                    loading="eager"
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

              {/* Mobile Image */}
              <div 
                className="block md:hidden relative w-full cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="w-full overflow-hidden">
                  {!imagesLoaded[index] && (
                    <Skeleton className="absolute inset-0 w-full h-[250px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  )}
                  <img
                    src={banner.mobileImageUrl}
                    alt="Banner Image"
                    className={`w-full h-auto transition-opacity duration-300 ${imagesLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                    style={{ imageRendering: 'crisp-edges' }}
                    loading="eager"
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

        {/* Navigation Arrows - Only show if more than 1 banner */}
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

        {/* Dots Indicator - Only show if more than 1 banner */}
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