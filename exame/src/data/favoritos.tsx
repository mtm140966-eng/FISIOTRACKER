// Favoritos do aparelho, gravados em favoritos.json. Sincronizar com conta
// fica para quando houver login no app (a tabela `favoritos` já existe).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { gravarTexto, lerTexto } from './armazenamento';

const ARQUIVO = 'favoritos.json';

type Favoritos = {
  slugs: string[];
  ehFavorito: (slug: string) => boolean;
  alternar: (slug: string) => void;
};

const Contexto = createContext<Favoritos | null>(null);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const carregou = useRef(false);

  useEffect(() => {
    lerTexto(ARQUIVO).then((texto) => {
      try {
        const lidos: unknown = texto ? JSON.parse(texto) : [];
        if (Array.isArray(lidos)) {
          const validos = lidos.filter((s): s is string => typeof s === 'string');
          // junta com o que foi marcado enquanto o arquivo carregava
          setSlugs((atual) => [...new Set([...validos, ...atual])]);
        }
      } catch {
        // arquivo ilegível: começa vazio
      }
      carregou.current = true;
    });
  }, []);

  useEffect(() => {
    if (carregou.current) gravarTexto(ARQUIVO, JSON.stringify(slugs));
  }, [slugs]);
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
