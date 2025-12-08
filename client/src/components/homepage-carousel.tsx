import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomepageBanner } from "@shared/schema";

interface HomepageCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const DEFAULT_FALLBACK_SLIDES = [
  {
    id: -1,
    title: "BuyBack Guarantee",
    subtitle: "Lock up to 70% resale value on your new device",
    description: "Activate BBG within 6 months of purchase",
    bgGradient: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #93C5FD 100%)",
  },
  {
    id: -2,
    title: "Extend+ Protection",
    subtitle: "Premium protection for your devices",
    description: "Get free repairs and auction support",
    bgGradient: "linear-gradient(135deg, #0F172A 0%, #1E40AF 50%, #60A5FA 100%)",
  }
];

export function HomepageCarousel({ autoPlay = true, autoPlayInterval = 15000 }: HomepageCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const { data: allBanners = [], isLoading, isError } = useQuery({
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
  const slideCount = hasBanners ? banners.length : DEFAULT_FALLBACK_SLIDES.length;

  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slideCount]);

  useEffect(() => {
    if (!hasBanners) return;
    
    banners.forEach((banner: HomepageBanner, index: number) => {
      if (index <= 1) {
        const desktopImg = new Image();
        desktopImg.src = banner.desktopImageUrl;
        
        const mobileImg = new Image();
        mobileImg.src = banner.mobileImageUrl;
      }
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

  const handleImageLoad = useCallback((index: number) => {
    setImagesLoaded(prev => new Set(prev).add(index));
  }, []);

  const handleImageError = useCallback((index: number, e: React.SyntheticEvent<HTMLImageElement>, fallbackUrl: string) => {
    const img = e.target as HTMLImageElement;
    if (!img.src.includes('/uploads/')) {
      img.src = `/uploads/${fallbackUrl.split('/').pop()}`;
    } else {
      setImageErrors(prev => new Set(prev).add(index));
    }
  }, []);

  if (isLoading) {
    return (
      <section className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] py-16 md:py-24">
        <div className="flex items-center justify-center min-h-[200px] md:min-h-[300px]">
          <div className="text-center text-white">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" />
            <span className="text-lg font-medium">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!hasBanners || isError) {
    return (
      <section className="relative w-full">
        <div className="relative w-full overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {DEFAULT_FALLBACK_SLIDES.map((slide) => (
              <div 
                key={slide.id} 
                className="w-full flex-shrink-0 min-h-[280px] md:min-h-[400px] flex items-center justify-center"
                style={{ background: slide.bgGradient }}
              >
                <div className="text-center text-white px-8 py-12 max-w-4xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.subtitle}</h2>
                  <p className="text-lg md:text-xl opacity-90 mb-6">{slide.description}</p>
                  <Button 
                    className="bg-white text-blue-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg"
                    onClick={() => {
                      const element = document.getElementById('find-plans-form');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Find Plans
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {DEFAULT_FALLBACK_SLIDES.length > 1 && (
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

          {DEFAULT_FALLBACK_SLIDES.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {DEFAULT_FALLBACK_SLIDES.map((_, index) => (
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

  return (
    <section className="relative w-full">
      <div className="relative w-full overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner: HomepageBanner, index: number) => (
            <div key={banner.id} className="w-full flex-shrink-0 relative">
              {!imagesLoaded.has(index) && !imageErrors.has(index) && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center min-h-[200px] md:min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}

              <div 
                className="hidden md:block relative w-full cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="w-full overflow-hidden">
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.title || "Banner Image"}
                    className={`w-full h-auto transition-opacity duration-300 ${
                      imagesLoaded.has(index) ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ imageRendering: 'crisp-edges' }}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding={index === 0 ? "sync" : "async"}
                    onLoad={() => handleImageLoad(index)}
                    onError={(e) => handleImageError(index, e, banner.desktopImageUrl)}
                  />
                </div>
              </div>

              <div 
                className="block md:hidden relative w-full cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <div className="w-full overflow-hidden">
                  <img
                    src={banner.mobileImageUrl}
                    alt={banner.title || "Banner Image"}
                    className={`w-full h-auto transition-opacity duration-300 ${
                      imagesLoaded.has(index) ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ imageRendering: 'crisp-edges' }}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding={index === 0 ? "sync" : "async"}
                    onLoad={() => handleImageLoad(index)}
                    onError={(e) => handleImageError(index, e, banner.mobileImageUrl)}
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
