import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { queryClient } from "./lib/queryClient";

// Prefetch homepage banners immediately for faster carousel loading
// This runs before the React tree mounts, so data is ready when carousel component loads
queryClient.prefetchQuery({
  queryKey: ['/api/homepage-banners'],
  queryFn: async () => {
    const response = await fetch('/api/homepage-banners');
    if (!response.ok) throw new Error('Failed to fetch banners');
    return response.json();
  },
  staleTime: 600000,
});

createRoot(document.getElementById("root")!).render(<App />);
