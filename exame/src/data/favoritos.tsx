// Favoritos do aparelho. Por enquanto só na memória: somem ao fechar o app.
// A gravação no aparelho entra junto com o armazenamento do pacote
// (/replica-backend), e a sincronização com conta depois.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Favoritos = {
  slugs: string[];
  ehFavorito: (slug: string) => boolean;
  alternar: (slug: string) => void;
};

const Contexto = createContext<Favoritos | null>(null);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const ehFavorito = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const alternar = useCallback((slug: string) => {
    setSlugs((atual) => (atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug]));
  }, []);
  const valor = useMemo(() => ({ slugs, ehFavorito, alternar }), [slugs, ehFavorito, alternar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFavoritos(): Favoritos {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useFavoritos fora do FavoritosProvider');
  return valor;
}
