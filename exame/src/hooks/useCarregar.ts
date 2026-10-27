import { useCallback, useEffect, useState, type DependencyList } from 'react';
import { useEstadoConteudo } from '../data/conteudo';

export type Estado<T> = { dados: T | undefined; erro: Error | null; carregando: boolean; recarregar: () => void };

// Carrega dados assíncronos da camada de dados, com estados de carregando e erro.
// Recarrega sozinho quando chega um pacote de conteúdo novo.
export function useCarregar<T>(carregar: () => Promise<T>, deps: DependencyList): Estado<T> {
  const [dados, setDados] = useState<T>();
  const [erro, setErro] = useState<Error | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const { pacote } = useEstadoConteudo();

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    carregar()
      .then((d) => ativo && setDados(d))
      .catch((e: unknown) => ativo && setErro(e instanceof Error ? e : new Error(String(e))))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tentativa, pacote]);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);
  return { dados, erro, carregando, recarregar };
}
