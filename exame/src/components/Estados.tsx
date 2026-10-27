import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react-native';
import { Botao, Carregando, EstadoVazio } from './ui';
import type { Estado } from '../hooks/useCarregar';

// Mostra carregando ou erro; quando há dados, desenha os filhos.
export function ComEstados<T>({ estado, children }: { estado: Estado<T>; children: (dados: T) => ReactNode }) {
  if (estado.carregando && estado.dados === undefined) return <Carregando />;
  if (estado.erro || estado.dados === undefined) {
    return (
      <EstadoVazio
        Icone={CircleAlert}
        titulo="Não foi possível carregar"
        frase="O conteúdo do aparelho não abriu. Tente de novo."
        acao={<Botao rotulo="Tentar de novo" variante="secondary" onPress={estado.recarregar} />}
      />
    );
  }
  return <>{children(estado.dados)}</>;
}
