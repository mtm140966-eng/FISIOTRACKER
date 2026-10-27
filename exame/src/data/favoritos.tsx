// Favoritos do aparelho, gravados em favoritos.json. Sincronizar com conta
// fica para quando houver login no app (a tabela `favoritos` já existe).
//
// Cada mudança lê o que está gravado, aplica e grava de novo, uma de cada vez.
// Assim duas abas abertas (na web) não apagam o favorito uma da outra.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { gravarTexto, lerTexto, observar } from './armazenamento';

const ARQUIVO = 'favoritos.json';

type Favoritos = {
  slugs: string[];
  ehFavorito: (slug: string) => boolean;
  alternar: (slug: string) => void;
};

const Contexto = createContext<Favoritos | null>(null);

function ler(texto: string | null): string[] | null {
  if (!texto) return null;
  try {
    const lidos: unknown = JSON.parse(texto);
    return Array.isArray(lidos) ? lidos.filter((s): s is string => typeof s === 'string') : null;
  } catch {
    return null;
  }
}

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const atuais = useRef<string[]>([]);
  const fila = useRef<Promise<void>>(Promise.resolve());

  const aplicar = useCallback((lista: string[]) => {
    atuais.current = lista;
    setSlugs(lista);
  }, []);

  useEffect(() => {
    fila.current = fila.current.then(async () => {
      const gravados = ler(await lerTexto(ARQUIVO));
      if (gravados) aplicar(gravados);
    });
    return observar(ARQUIVO, (texto) => aplicar(ler(texto) ?? []));
  }, [aplicar]);

  const alternar = useCallback((slug: string) => {
    fila.current = fila.current.then(async () => {
      // sem armazenamento, segue com a lista da memória
      const base = ler(await lerTexto(ARQUIVO)) ?? atuais.current;
      const nova = base.includes(slug) ? base.filter((s) => s !== slug) : [...base, slug];
      aplicar(nova);
      await gravarTexto(ARQUIVO, JSON.stringify(nova));
    });
  }, [aplicar]);

  const ehFavorito = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const valor = useMemo(() => ({ slugs, ehFavorito, alternar }), [slugs, ehFavorito, alternar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useFavoritos(): Favoritos {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useFavoritos fora do FavoritosProvider');
  return valor;
}
