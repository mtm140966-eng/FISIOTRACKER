import { useColorScheme } from 'react-native';
import { tokens } from './tokens';

export type Cores = (typeof tokens.color)['light'];
export type Tipo = keyof typeof tokens.type;

export function useTema() {
  const esquema = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { esquema, c: tokens.color[esquema] as Cores } as const;
}

export const espaco = (i: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) => tokens.space[i];
export const raio = tokens.radius;
export const layout = tokens.layout;

export function fonte(tipo: Tipo) {
  const t = tokens.type[tipo];
  return {
    fontSize: t.size,
    lineHeight: t.line,
    fontWeight: String(t.weight) as '400' | '500' | '600' | '700',
  };
}
