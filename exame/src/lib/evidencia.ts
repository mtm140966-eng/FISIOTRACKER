// Regras de evidência diagnóstica (replica/design/components.md, EvidenceBadge).
// Funções puras: sem React, para poder testar com node --test.

export type NivelEvidencia = 'forte' | 'moderada' | 'fraca' | 'minima' | 'sem-dados';
export type Uso = 'confirmar' | 'descartar';

type ComLr = {
  sensibilidade: number | null;
  especificidade: number | null;
  lrPositiva: number | null;
  lrNegativa: number | null;
};

export type LrResolvida = { valor: number | null; calculada: boolean };

const ORDEM: NivelEvidencia[] = ['forte', 'moderada', 'fraca', 'minima', 'sem-dados'];

export function lrPositiva(p: ComLr): LrResolvida {
  if (p.lrPositiva != null) return { valor: p.lrPositiva, calculada: false };
  if (p.sensibilidade == null || p.especificidade == null || p.especificidade >= 1) {
    return { valor: null, calculada: false };
  }
  return { valor: p.sensibilidade / (1 - p.especificidade), calculada: true };
}

export function lrNegativa(p: ComLr): LrResolvida {
  if (p.lrNegativa != null) return { valor: p.lrNegativa, calculada: false };
  if (p.sensibilidade == null || p.especificidade == null || p.especificidade <= 0) {
    return { valor: null, calculada: false };
  }
  return { valor: (1 - p.sensibilidade) / p.especificidade, calculada: true };
}

export function nivelLrPositiva(lr: number | null): NivelEvidencia {
  if (lr == null) return 'sem-dados';
  if (lr >= 10) return 'forte';
  if (lr >= 5) return 'moderada';
  if (lr >= 2) return 'fraca';
  return 'minima';
}

export function nivelLrNegativa(lr: number | null): NivelEvidencia {
  if (lr == null) return 'sem-dados';
  if (lr <= 0.1) return 'forte';
  if (lr <= 0.2) return 'moderada';
  if (lr <= 0.5) return 'fraca';
  return 'minima';
}

const melhor = (a: NivelEvidencia, b: NivelEvidencia) =>
  ORDEM.indexOf(a) <= ORDEM.indexOf(b) ? a : b;

// O melhor uso de um estudo: confirmar (LR+) ou descartar (LR−).
export function avaliar(p: ComLr): { nivel: NivelEvidencia; uso: Uso | null } {
  const pos = nivelLrPositiva(lrPositiva(p).valor);
  const neg = nivelLrNegativa(lrNegativa(p).valor);
  const nivel = melhor(pos, neg);
  if (nivel === 'sem-dados') return { nivel, uso: null };
  return { nivel, uso: nivel === pos ? 'confirmar' : 'descartar' };
}

// O selo de um teste é o do seu melhor estudo.
export function avaliarTeste(props: ComLr[]): { nivel: NivelEvidencia; uso: Uso | null } {
  let atual: { nivel: NivelEvidencia; uso: Uso | null } = { nivel: 'sem-dados', uso: null };
  for (const p of props) {
    const a = avaliar(p);
    if (ORDEM.indexOf(a.nivel) < ORDEM.indexOf(atual.nivel)) atual = a;
  }
  return atual;
}

export function rotuloNivel(nivel: NivelEvidencia, uso: Uso | null): string {
  const base = {
    forte: 'Evidência forte',
    moderada: 'Evidência moderada',
    fraca: 'Evidência fraca',
    minima: 'Evidência mínima',
    'sem-dados': 'Sem dados',
  }[nivel];
  if (!uso || nivel === 'minima') return base;
  return `${base} para ${uso}`;
}

const LIMITE_DISCORDANCIA = 0.2;

// Estudos discordam quando Sens ou Esp variam mais de 20 pontos entre eles.
export function estudosDiscordam(props: ComLr[]): boolean {
  const amplitude = (vals: (number | null)[]) => {
    const v = vals.filter((x): x is number => x != null);
    return v.length < 2 ? 0 : Math.max(...v) - Math.min(...v);
  };
  return (
    amplitude(props.map((p) => p.sensibilidade)) > LIMITE_DISCORDANCIA ||
    amplitude(props.map((p) => p.especificidade)) > LIMITE_DISCORDANCIA
  );
}

// Probabilidade pós-teste pelo teorema de Bayes na forma de odds.
export function probabilidadePosTeste(preTeste: number, lr: number): number {
  if (preTeste <= 0) return 0;
  if (preTeste >= 1) return 1;
  const odds = (preTeste / (1 - preTeste)) * lr;
  return odds / (1 + odds);
}

// 0.725 -> "73%"; 4.57 -> "4,6"
export function formatarPercentual(v: number | null): string {
  return v == null ? '—' : `${Math.round(v * 100)}%`;
}

export function formatarRazao(v: number | null): string {
  if (v == null) return '—';
  return v.toFixed(v < 1 ? 2 : 1).replace('.', ',');
}
