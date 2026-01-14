// app/hooks/useCachedQuery.ts
import { useState, useEffect, useRef } from "react";

/**
 * A hook that loads data from LocalStorage instantly, then syncs with the server.
 * @param key - Unique key for localStorage (e.g., 'user_rank_123')
 * @param fetcher - Async function to fetch fresh data (e.g., () => supabase.from...)
 * @param initialValue - Fallback value if nothing is cached
 * @param ttlMs - (Optional) Time-to-live in ms. Defaults to 0 (always revalidate).
 */
export function useCachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  initialValue: T | null = null,
  ttlMs: number = 0
) {
  // 1. Initialize State (Try Cache First)
  const [data, setData] = useState<T | null>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Optional: You could check timestamps here for TTL
        return parsed.data;
      }
    } catch (e) {
      console.warn("Cache parse error", e);
    }
    return initialValue;
  });

  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  // Ref to prevent race conditions or double-fetches on strict mode
  const hasFetched = useRef(false);
  const lastKey = useRef(key);

  useEffect(() => {
    let isMounted = true;

    // Reset fetch tracker if key changes
    if (lastKey.current !== key) {
      hasFetched.current = false;
      lastKey.current = key;
      setIsLoading(true); // Show loading only if we have NO cache for new key

      // Try to load cache for new key immediately
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          setData(JSON.parse(cached).data);
          setIsLoading(false);
        } catch (e) {}
      } else {
        setData(initialValue);
      }
    }

    const loadData = async () => {
      try {
        // Execute the fetcher
        const freshData = await fetcher();

        if (isMounted) {
          // Update State
          setData(freshData);
          setError(null);

          // Save to Cache with timestamp
          const cachePacket = {
            timestamp: Date.now(),
            data: freshData,
          };
          localStorage.setItem(key, JSON.stringify(cachePacket));
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(`Error fetching ${key}:`, err);
          setError(err);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Trigger fetch (Stale-While-Revalidate)
    loadData();

    return () => {
      isMounted = false;
    };
    // We strictly depend on 'key'. We assume 'fetcher' is stable or safe to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, isLoading, error };
}
