// Busca local, no aparelho. Tolera acento, apóstrofo, maiúsculas,
// "teste de", e um erro de digitação em palavras de 5 letras ou mais.

export type Buscavel = {
  slug: string;
  nome: string;
  nomeEn: string;
  sinonimos: string[];
  categorias: string[];
};

const PREFIXOS = /\b(teste|test|sinal|sign|manobra)\s+(de|do|da|of)?\s*/g;
const SUFIXOS = /\s+(teste|test|sinal|sign)$/;

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`´]s\b/g, '')
    .replace(/['’`´]/g, '')
    .replace(PREFIXOS, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(SUFIXOS, '');
}

function distancia(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const linha = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let anterior = linha[0];
    linha[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = linha[j];
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
      anterior = temp;
    }
  }
  return linha[b.length];
}

function pontuar(campo: string, consulta: string): number {
  if (!campo) return 0;
  if (campo === consulta) return 5;
  if (campo.startsWith(consulta)) return 4;
  const palavras = campo.split(' ');
  if (palavras.some((p) => p.startsWith(consulta))) return 3;
  if (campo.includes(consulta)) return 2;
  const termos = consulta.split(' ');
  const aproximado = termos.every(
    (t) => t.length >= 5 && palavras.some((p) => distancia(p, t) <= 1),
  );
  return aproximado ? 1 : 0;
}

export const MINIMO_BUSCA = 2;

export function buscar<T extends Buscavel>(itens: T[], texto: string): T[] {
  const consulta = normalizar(texto);
  if (consulta.length < MINIMO_BUSCA) return [];
  const resultados: { item: T; pontos: number }[] = [];
  for (const item of itens) {
    const campos = [item.nome, item.nomeEn, ...item.sinonimos].map(normalizar);
    const categorias = item.categorias.map(normalizar);
    const pontos = Math.max(
      ...campos.map((c) => pontuar(c, consulta) * 2),
      ...categorias.map((c) => pontuar(c, consulta)),
    );
    if (pontos > 0) resultados.push({ item, pontos });
  }
  return resultados
    .sort((a, b) => b.pontos - a.pontos || a.item.nome.localeCompare(b.item.nome, 'pt-BR'))
    .map((r) => r.item);
}
