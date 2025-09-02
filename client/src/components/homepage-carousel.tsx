import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { HomepageBanner } from "@shared/schema";

interface HomepageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function HomepageCarousel({ autoPlay = true, autoPlayInterval = 5000 }: HomepageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch active homepage banners
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['/api/homepage-banners'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-banners', {
        cache: 'no-cache'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      return response.json();
    },
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

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
      window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render anything if loading or no banners
  if (isLoading) {
    return (
      <section className="w-full bg-gray-100 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading banners...</span>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Don't show anything if no banners
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
          {banners.map((banner: HomepageBanner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              {/* Desktop Image */}
              <div 
                className="hidden md:block relative w-full cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="w-full overflow-hidden">
                  <img
                    src={banner.desktopImageUrl}
                    alt="Banner Image"
                    className="w-full h-auto"
                    style={{ imageRendering: 'crisp-edges' }}
                    onError={(e) => {
                      console.error('Desktop image failed to load:', banner.desktopImageUrl);
                      // Try local uploads route if the original S3 URL fails
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('/uploads/')) {
                        img.src = `/uploads/${banner.desktopImageUrl.split('/').pop()}`;
                      }
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
                  <img
                    src={banner.mobileImageUrl}
                    alt="Banner Image"
                    className="w-full h-auto"
                    style={{ imageRendering: 'crisp-edges' }}
                    onError={(e) => {
                      console.error('Mobile image failed to load:', banner.mobileImageUrl);
                      // Try local uploads route if the original S3 URL fails
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('/uploads/')) {
                        img.src = `/uploads/${banner.mobileImageUrl.split('/').pop()}`;
                      }
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