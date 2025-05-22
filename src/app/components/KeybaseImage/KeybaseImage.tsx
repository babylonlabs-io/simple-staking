import { createContext, useContext, useEffect, useState } from "react";

import { fetchKeybaseImageUrl } from "@/utils/keybase";

let requestQueue: {
  identity: string;
  resolve: (url: string | null) => void;
}[] = [];
let isProcessingQueue = false;
const DELAY_BETWEEN_REQUESTS = 500;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;
  const { identity, resolve } = requestQueue.shift()!;

  try {
    const url = await fetchKeybaseImageUrl(identity);
    resolve(url);
  } catch (error) {
    resolve(null);
  }

  setTimeout(() => {
    isProcessingQueue = false;
    processQueue();
  }, DELAY_BETWEEN_REQUESTS);
};

const enqueueRequest = (identity: string): Promise<string | null> => {
  return new Promise((resolve) => {
    requestQueue.push({ identity, resolve });
    processQueue();
  });
};

type KeybaseCacheContextType = {
  cache: Map<string, string | null>;
  setCache: (identity: string, url: string | null) => void;
  getImage: (identity: string) => Promise<string | null>;
};

const KeybaseCacheContext = createContext<KeybaseCacheContextType>({
  cache: new Map(),
  setCache: () => {},
  getImage: () => Promise.resolve(null),
});

/**
 * Provider component that creates a cache for Keybase images
 */
export const KeybaseCacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cache, setKeybaseCache] = useState<Map<string, string | null>>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCache = localStorage.getItem("keybaseImageCache");
        if (savedCache) {
          return new Map(JSON.parse(savedCache));
        }
      } catch (error) {
        console.error("Error loading keybase cache from localStorage:", error);
      }
    }
    return new Map();
  });

  useEffect(() => {
    if (typeof window !== "undefined" && cache.size > 0) {
      try {
        localStorage.setItem(
          "keybaseImageCache",
          JSON.stringify(Array.from(cache.entries())),
        );
      } catch (error) {
        console.error("Error saving keybase cache to localStorage:", error);
      }
    }
  }, [cache]);

  const setCache = (identity: string, url: string | null) => {
    setKeybaseCache((prevCache) => {
      const newCache = new Map(prevCache);
      newCache.set(identity, url);
      return newCache;
    });
  };

  const getImage = async (identity: string): Promise<string | null> => {
    // Check cache first
    if (cache.has(identity)) {
      const cachedUrl = cache.get(identity);
      return cachedUrl || null;
    }

    // Not in cache, request it
    const url = await enqueueRequest(identity);

    // Only cache successful requests
    if (url) {
      setCache(identity, url);
    }

    return url;
  };

  return (
    <KeybaseCacheContext.Provider value={{ cache, setCache, getImage }}>
      {children}
    </KeybaseCacheContext.Provider>
  );
};

export const useKeybaseCache = () => {
  return useContext(KeybaseCacheContext);
};

interface KeybaseImageProps {
  identity?: string;
  moniker?: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

/**
 * Component to render a Keybase profile image with caching
 */
export const KeybaseImage: React.FC<KeybaseImageProps> = ({
  identity,
  moniker,
  size = "medium",
  className = "",
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getImage } = useKeybaseCache();

  const sizeClass = {
    small: "w-6 h-6 text-[0.6rem]",
    medium: "w-8 h-8 text-xs",
    large: "w-10 h-10 text-sm",
  }[size];

  useEffect(() => {
    const loadImage = async () => {
      if (!identity) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        const url = await getImage(identity);

        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading Keybase image:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [identity, getImage]);

  if (loading) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-[#e0e0e0] animate-pulse ${className}`}
      ></div>
    );
  }

  if (imageUrl && !error) {
    return (
      <img
        src={imageUrl}
        alt={moniker || "Finality Provider"}
        width={size === "large" ? 40 : size === "medium" ? 32 : 24}
        height={size === "large" ? 40 : size === "medium" ? 32 : 24}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-full bg-secondary-main text-accent-contrast ${className}`}
    >
      {moniker ? moniker[0].toUpperCase() : "?"}
    </div>
  );
};

export default KeybaseImage;
