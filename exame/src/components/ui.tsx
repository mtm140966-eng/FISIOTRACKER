// Componentes base (replica/design/components.md, seção "Base").

import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type TextProps } from 'react-native';
import { TriangleAlert, WifiOff, type LucideIcon } from 'lucide-react-native';
import { espaco, fonte, layout, raio, useTema, type Tipo } from '../theme';

export function Texto({ tipo = 'base', mudo, style, ...props }: TextProps & { tipo?: Tipo; mudo?: boolean }) {
  const { c } = useTema();
  return <Text {...props} style={[fonte(tipo), { color: mudo ? c['text-muted'] : c.text }, style]} />;
}

type VarianteBotao = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Botao({ rotulo, onPress, variante = 'primary', desabilitado, carregando }: {
  rotulo: string; onPress: () => void; variante?: VarianteBotao; desabilitado?: boolean; carregando?: boolean;
}) {
  const { c } = useTema();
  const fundo = { primary: c.accent, secondary: c['surface-raised'], ghost: 'transparent', danger: c.danger }[variante];
  const cor = { primary: c['on-accent'], secondary: c.text, ghost: c.accent, danger: c.bg }[variante];
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      aria-disabled={inativo}
      aria-busy={carregando}
      disabled={inativo}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => ({
        minHeight: layout['touch-min'],
        paddingHorizontal: espaco(5),
        borderRadius: raio.md,
        backgroundColor: pressed && variante === 'primary' ? c['accent-hover'] : fundo,
        borderWidth: variante === 'secondary' ? 1 : 0,
        borderColor: c['border-input'],
        alignItems: 'center',
        justifyContent: 'center',
        opacity: inativo ? 0.45 : 1,
        outlineColor: c.focus,
        outlineWidth: focused ? 2 : 0,
        outlineOffset: 2,
        outlineStyle: 'solid',
      })}
    >
      {carregando ? <ActivityIndicator color={cor} /> : <Text style={[fonte('base'), { color: cor, fontWeight: '600' }]}>{rotulo}</Text>}
    </Pressable>
  );
}

export function BotaoIcone({ Icone, rotulo, onPress, cor, preenchido, papel = 'button', selecionado }: {
  Icone: LucideIcon; rotulo: string; onPress: () => void; cor?: string; preenchido?: boolean;
  papel?: 'button' | 'switch'; selecionado?: boolean;
}) {
  const { c } = useTema();
  const corFinal = cor ?? c.text;
  return (
    <Pressable
      accessibilityRole={papel}
      accessibilityLabel={rotulo}
      aria-checked={papel === 'switch' ? !!selecionado : undefined}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => ({
        width: layout['touch-min'], height: layout['touch-min'], borderRadius: raio.md,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? c.surface : 'transparent',
      })}
    >
      <Icone size={24} color={corFinal} fill={preenchido ? corFinal : 'none'} />
    </Pressable>
  );
}

export function EstadoVazio({ Icone, titulo, frase, acao }: {
  Icone: LucideIcon; titulo: string; frase: string; acao?: ReactNode;
}) {
  const { c } = useTema();
  return (
    <View style={{ alignItems: 'center', paddingVertical: espaco(6), paddingHorizontal: espaco(4), gap: espaco(2) }}>
      <Icone size={40} color={c['text-muted']} />
      <Texto tipo="lg" style={{ textAlign: 'center' }}>{titulo}</Texto>
      <Texto mudo style={{ textAlign: 'center' }}>{frase}</Texto>
      {acao}
    </View>
  );
}

export function Aviso({ texto, Icone = TriangleAlert }: { texto: string; Icone?: LucideIcon }) {
  const { c } = useTema();
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: espaco(2), alignItems: 'center', padding: espaco(3), backgroundColor: c['warning-soft'], borderRadius: raio.md }}>
      <Icone size={20} color={c.warning} />
      <Text style={[fonte('sm'), { color: c.warning, fontWeight: '500', flex: 1 }]}>{texto}</Text>
    </View>
  );
}

export function AvisoOffline({ texto }: { texto: string }) {
  return <Aviso texto={texto} Icone={WifiOff} />;
}

export function Carregando() {
  const { c } = useTema();
  return (
    <View style={{ padding: espaco(6), alignItems: 'center' }}>
      <ActivityIndicator color={c.accent} accessibilityLabel="Carregando" />
    </View>
  );
}

export function Rotulo({ children }: { children: ReactNode }) {
  return (
    <Texto tipo="xs" mudo accessibilityRole="header" style={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600', marginTop: espaco(5), marginBottom: espaco(2), marginHorizontal: espaco(4) }}>
      {children}
    </Texto>
  );
}

export function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  const { c } = useTema();
  return (
    <View style={{ backgroundColor: c.surface, borderRadius: raio.md, paddingVertical: espaco(3), paddingHorizontal: espaco(4), marginBottom: espaco(2) }}>
      <Texto tipo="sm" mudo accessibilityRole="header" style={{ fontWeight: '600', marginBottom: espaco(1) }}>{titulo}</Texto>
      <Texto>{children}</Texto>
    </View>
  );
}
