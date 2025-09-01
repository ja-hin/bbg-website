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
                className="hidden md:block relative w-full cursor-pointer group"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="aspect-[16/5] w-full overflow-hidden">
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                
                {/* Banner Text Overlay - Desktop */}
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex items-center">
                    <div className="text-white p-8 md:p-12 lg:p-16 max-w-2xl">
                      {banner.title && (
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 leading-tight">
                          {banner.title}
                        </h2>
                      )}
                      {banner.description && (
                        <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                          {banner.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Image */}
              <div 
                className="block md:hidden relative w-full cursor-pointer group"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={banner.mobileImageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                
                {/* Banner Text Overlay - Mobile */}
                {(banner.title || banner.description) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="text-white p-4 w-full">
                      {banner.title && (
                        <h2 className="text-xl font-bold mb-1 leading-tight">
                          {banner.title}
                        </h2>
                      )}
                      {banner.description && (
                        <p className="text-sm text-white/90 leading-snug line-clamp-2">
                          {banner.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
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