// Componentes do domínio (replica/design/components.md, seção "Do domínio").

import { Pressable, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight, Star } from 'lucide-react-native';
import { BotaoIcone, Texto } from './ui';
import { espaco, fonte, layout, raio, useTema } from '../theme';
import {
  avaliar, formatarPercentual, formatarRazao, lrNegativa, lrPositiva, rotuloNivel,
  type NivelEvidencia, type Uso,
} from '../lib/evidencia';
import type { Propriedade, Referencia, Regiao } from '../data/types';

export function SeloEvidencia({ nivel, uso, curto }: { nivel: NivelEvidencia; uso: Uso | null; curto?: boolean }) {
  const { c } = useTema();
  const tom = nivel === 'forte' ? 'evidence-strong' : nivel === 'moderada' ? 'evidence-moderate' : 'evidence-weak';
  const rotulo = rotuloNivel(nivel, uso);
  const texto = curto ? rotuloNivel(nivel, null).replace('Evidência ', '').replace(/^./, (l) => l.toUpperCase()) : rotulo;
  return (
    <View style={{ alignSelf: 'flex-start', height: 24, paddingHorizontal: espaco(2) + 2, borderRadius: raio.pill, justifyContent: 'center', backgroundColor: c[`${tom}-soft`] }}>
      <Text style={[fonte('xs'), { color: c[tom], fontWeight: '600' }]}>{texto}</Text>
    </View>
  );
}

export function ItemTeste({ slug, nome, subtitulo, nivel, uso, favorito, aoFavoritar }: {
  slug: string; nome: string; subtitulo: string; nivel: NivelEvidencia; uso: Uso | null;
  favorito: boolean; aoFavoritar: () => void;
}) {
  const { c } = useTema();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 64, borderBottomWidth: 1, borderColor: c.border, paddingLeft: espaco(4), paddingRight: espaco(1) }}>
      <Link href={{ pathname: '/teste/[slug]', params: { slug } }} asChild>
        <Pressable accessibilityRole="link" style={{ flex: 1, paddingVertical: espaco(2), gap: 2 }}>
          <Texto style={{ fontWeight: '600' }} numberOfLines={2}>{nome}</Texto>
          <View style={{ flexDirection: 'row', gap: espaco(2), alignItems: 'center', flexWrap: 'wrap' }}>
            {subtitulo ? <Texto tipo="sm" mudo numberOfLines={1} style={{ flexShrink: 1 }}>{subtitulo}</Texto> : null}
            <SeloEvidencia nivel={nivel} uso={uso} curto />
          </View>
        </Pressable>
      </Link>
      <BotaoIcone
        Icone={Star}
        papel="switch"
        selecionado={favorito}
        rotulo={`Favorito: ${nome}`}
        cor={favorito ? c.favorite : c['text-muted']}
        preenchido={favorito}
        onPress={aoFavoritar}
      />
    </View>
  );
}

export function ItemRegiao({ regiao, total }: { regiao: Regiao; total: number }) {
  const { c } = useTema();
  const sufixo = total === 1 ? '1 teste' : `${total} testes`;
  return (
    <Link href={{ pathname: '/regiao/[slug]', params: { slug: regiao.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        style={{ flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingHorizontal: espaco(4), borderBottomWidth: 1, borderColor: c.border }}
      >
        <Texto style={{ flex: 1, fontWeight: '600' }}>{regiao.nome}</Texto>
        <Texto tipo="sm" mudo style={{ marginRight: espaco(1) }}>{sufixo}</Texto>
        <ChevronRight size={20} color={c['text-muted']} />
      </Pressable>
    </Link>
  );
}

// Figura do corpo desenhada do zero, provisória até o /replica-brand.
// Cada área tem as coordenadas de um lado; regiões pares são espelhadas.
const AREAS: Record<string, { x: number; y: number; w: number; h: number; par?: boolean }[]> = {
  cervical: [{ x: 74, y: 42, w: 22, h: 18 }],
  ombro: [{ x: 38, y: 60, w: 30, h: 26, par: true }],
  cotovelo: [{ x: 30, y: 90, w: 18, h: 60, par: true }],
  punho: [{ x: 24, y: 154, w: 22, h: 24, par: true }],
  lombar: [{ x: 66, y: 60, w: 38, h: 70 }],
  quadril: [{ x: 64, y: 132, w: 42, h: 26 }],
  joelho: [{ x: 64, y: 160, w: 19, h: 44, par: true }],
  tornozelo: [{ x: 64, y: 206, w: 19, h: 40, par: true }],
};
// Desenho em 170 × 260 ampliado 1,4×: a menor área (pescoço, 22 × 18) vira 31 × 25 px,
// acima do mínimo de 24 px para toque (WCAG 2.5.8).
const ESCALA = 1.4;
const LARGURA_BASE = 170;
const LARGURA = LARGURA_BASE * ESCALA;
const ALTURA = 260 * ESCALA;

type AreaDesenhada = { r: Regiao; a: (typeof AREAS)[string][number]; x: number; lado: string };

export function MapaCorpo({ regioes, selecionada, aoEscolher }: {
  regioes: Regiao[]; selecionada?: string; aoEscolher: (slug: string) => void;
}) {
  const { c } = useTema();
  const areas: AreaDesenhada[] = regioes.flatMap((r) => (AREAS[r.areaFigura] ?? []).flatMap((a): AreaDesenhada[] => {
    const lados = a.par ? [a.x, LARGURA_BASE - a.x - a.w] : [a.x];
    return lados.map((x, i) => ({ r, a, x, lado: lados.length > 1 ? (i === 0 ? ' direito' : ' esquerdo') : '' }));
  }));
  // Formas simples desenhadas com caixas: cada área é o próprio botão.
  return (
    <View accessibilityLabel="Mapa do corpo, vista de frente. As mesmas regiões estão na lista abaixo." style={{ alignItems: 'center', paddingVertical: espaco(2) }}>
      <View style={{ width: LARGURA, height: ALTURA }}>
        <View accessible={false} style={{ position: 'absolute', left: 67 * ESCALA, top: 6 * ESCALA, width: 36 * ESCALA, height: 36 * ESCALA, borderRadius: 18 * ESCALA, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c['border-input'] }} />
        {areas.map(({ r, a, x, lado }) => {
          const ativa = r.slug === selecionada;
          return (
            <Pressable
              key={`${r.slug}-${x}`}
              accessibilityRole="button"
              accessibilityLabel={`${r.nome}${lado}`}
              onPress={() => aoEscolher(r.slug)}
              style={({ pressed }) => ({
                position: 'absolute', left: x * ESCALA, top: a.y * ESCALA, width: a.w * ESCALA, height: a.h * ESCALA, borderRadius: 8 * ESCALA,
                backgroundColor: ativa || pressed ? c['accent-soft'] : c.surface,
                borderWidth: ativa ? 2.5 : 1.5,
                borderColor: ativa || pressed ? c.accent : c['border-input'],
              })}
            />
          );
        })}
      </View>
    </View>
  );
}

export type Aba = { id: string; rotulo: string };

export function Abas({ abas, ativa, aoMudar }: { abas: Aba[]; ativa: string; aoMudar: (id: string) => void }) {
  const { c } = useTema();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" style={{ flexGrow: 0, borderBottomWidth: 1, borderColor: c.border }} contentContainerStyle={{ flexGrow: 1 }}>
      {abas.map((a) => {
        const sel = a.id === ativa;
        return (
          <Pressable key={a.id} accessibilityRole="tab" aria-selected={sel} onPress={() => aoMudar(a.id)}
            style={{ flexGrow: 1, minHeight: layout['touch-min'], paddingHorizontal: espaco(3), alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderColor: sel ? c.accent : 'transparent' }}>
            <Text style={[fonte('sm'), { fontWeight: '600', color: sel ? c.accent : c['text-muted'] }]}>{a.rotulo}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function Numero({ rotulo, valor, detalhe, falado }: { rotulo: string; valor: string; detalhe?: string; falado: string }) {
  return (
    <View accessible accessibilityLabel={falado} style={{ width: '50%', paddingVertical: espaco(1) }}>
      <Texto tipo="xs" mudo>{rotulo}</Texto>
      <Texto tipo="lg" style={{ fontVariant: ['tabular-nums'] }}>{valor}</Texto>
      {detalhe ? <Texto tipo="xs" mudo>{detalhe}</Texto> : null}
    </View>
  );
}

const ic = (v: [number, number] | null) => (v ? `IC 95% ${Math.round(v[0] * 100)}–${Math.round(v[1] * 100)}` : undefined);
const icFalado = (v: [number, number] | null) => (v ? `, intervalo de ${Math.round(v[0] * 100)} a ${Math.round(v[1] * 100)}` : '');
const pctFalado = (v: number | null) => (v == null ? 'sem dado' : `${Math.round(v * 100)} por cento`);

export function CartaoEstudo({ p, titulo }: { p: Propriedade; titulo: string }) {
  const { c } = useTema();
  const { nivel, uso } = avaliar(p);
  const pos = lrPositiva(p);
  const neg = lrNegativa(p);
  return (
    <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: raio.md, padding: espaco(4), marginBottom: espaco(2), gap: espaco(1) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: espaco(2), flexWrap: 'wrap' }}>
        <Texto style={{ fontWeight: '600', flexShrink: 1 }}>{titulo}{p.n ? ` · n=${p.n}` : ''}</Texto>
        <SeloEvidencia nivel={nivel} uso={uso} curto />
      </View>
      <Texto tipo="sm" mudo>{[p.condicaoAlvo, p.padraoOuro && `padrão-ouro: ${p.padraoOuro}`, p.populacao].filter(Boolean).join(' · ')}</Texto>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: espaco(1) }}>
        <Numero rotulo="Sensibilidade" valor={formatarPercentual(p.sensibilidade)} detalhe={ic(p.sensIc)} falado={`Sensibilidade ${pctFalado(p.sensibilidade)}${icFalado(p.sensIc)}`} />
        <Numero rotulo="Especificidade" valor={formatarPercentual(p.especificidade)} detalhe={ic(p.espIc)} falado={`Especificidade ${pctFalado(p.especificidade)}${icFalado(p.espIc)}`} />
        <Numero rotulo="LR+" valor={formatarRazao(pos.valor)} detalhe={pos.calculada ? 'calculada' : undefined} falado={`Razão de verossimilhança positiva ${formatarRazao(pos.valor)}${pos.calculada ? ', calculada' : ''}`} />
        <Numero rotulo="LR−" valor={formatarRazao(neg.valor)} detalhe={neg.calculada ? 'calculada' : undefined} falado={`Razão de verossimilhança negativa ${formatarRazao(neg.valor)}${neg.calculada ? ', calculada' : ''}`} />
        {p.confiabilidade != null ? (
          <Numero rotulo={p.confiabilidadeTipo === 'icc' ? 'Confiabilidade (ICC)' : 'Confiabilidade (κ)'} valor={formatarRazao(p.confiabilidade)} falado={`Confiabilidade ${formatarRazao(p.confiabilidade)}`} />
        ) : null}
      </View>
    </View>
  );
}

export function ItemReferencia({ r, numero }: { r: Referencia; numero: number }) {
  const { c } = useTema();
  return (
    <View style={{ paddingVertical: espaco(3), borderBottomWidth: 1, borderColor: c.border, gap: espaco(1) }}>
      <Texto tipo="sm">{numero}. {r.citacao}</Texto>
      <View style={{ flexDirection: 'row', gap: espaco(4) }}>
        {r.pmid ? <Link href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} style={[fonte('sm'), { color: c.accent, fontWeight: '600' }]}>PubMed</Link> : null}
        {r.doi ? <Link href={`https://doi.org/${r.doi}`} style={[fonte('sm'), { color: c.accent, fontWeight: '600' }]}>DOI</Link> : null}
        {!r.pmid && !r.doi ? <Texto tipo="xs" mudo>Sem link</Texto> : null}
      </View>
    </View>
  );
}
