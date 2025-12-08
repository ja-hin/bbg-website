import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

// Prefetch critical data immediately for faster initial render
// This runs before the React tree mounts, so data is ready when components load
Promise.all([
  // Prefetch homepage banners for carousel
  queryClient.prefetchQuery({
    queryKey: ['/api/homepage-banners'],
    queryFn: async () => {
      const response = await fetch('/api/homepage-banners');
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    },
    staleTime: 600000,
  }),
  // Prefetch plans for dynamic pricing
  queryClient.prefetchQuery({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const response = await fetch('/api/plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
    staleTime: 600000,
  }),
]);

createRoot(document.getElementById("root")!).render(<App />);
