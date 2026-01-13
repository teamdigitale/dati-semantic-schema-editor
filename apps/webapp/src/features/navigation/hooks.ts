import { useState, useEffect } from 'react';

export const useNavigation = () => {
  const [query, setQuery] = useState<URLSearchParams>(() => new URLSearchParams(window.location.search));
  const [hash, setHash] = useState<string>(() => window.location.hash.slice(1));

  useEffect(() => {
    const updateNavigation = () => {
      setQuery(new URLSearchParams(window.location.search));
      setHash(window.location.hash.slice(1));
    };

    window.addEventListener('popstate', updateNavigation);
    window.addEventListener('hashchange', updateNavigation);

    return () => {
      window.removeEventListener('popstate', updateNavigation);
      window.removeEventListener('hashchange', updateNavigation);
    };
  }, []);

  return { query, hash };
};
