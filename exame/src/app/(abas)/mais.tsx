// S12 Mais: downloads, versão do conteúdo, atualização e aviso clínico.
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight, Download } from 'lucide-react-native';
import { Botao, Rotulo, Texto } from '../../components/ui';
import { temServidor } from '../../data/config';
import { sincronizarAgora, useEstadoConteudo } from '../../data/conteudo';
import { espaco, useTema } from '../../theme';

const DESCRICAO = {
  'sem-servidor': 'Este app ainda não está ligado ao servidor.',
  atualizado: 'O conteúdo já está na versão mais recente.',
  novo: 'Conteúdo novo baixado.',
  erro: 'Não foi possível atualizar agora. O conteúdo do aparelho continua valendo.',
} as const;

export default function Mais() {
  const { c } = useTema();
  const { versaoInstalada, ultimaSincronia } = useEstadoConteudo();
  const [atualizando, setAtualizando] = useState(false);
  const atualizar = async () => {
    setAtualizando(true);
    await sincronizarAgora();
    setAtualizando(false);
  };
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: espaco(6) }}>
      <Link href="/downloads" asChild>
        <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: espaco(3), minHeight: 56, paddingHorizontal: espaco(4), borderBottomWidth: 1, borderColor: c.border }}>
          <Download size={22} color={c.text} />
          <Texto style={{ flex: 1, fontWeight: '600' }}>Vídeos offline</Texto>
          <ChevronRight size={20} color={c['text-muted']} />
        </Pressable>
      </Link>
      <Rotulo>Conteúdo</Rotulo>
      <View style={{ paddingHorizontal: espaco(4), gap: espaco(2) }}>
        <Texto>Cada teste traz como executar, vídeo e os números de acurácia com a referência do estudo de onde vieram.</Texto>
        <Texto mudo tipo="sm">
          {versaoInstalada === 0 ? 'Versão: a que veio com o app' : `Versão: ${versaoInstalada}`}
        </Texto>
        {ultimaSincronia ? (
          <Texto mudo tipo="sm" accessibilityLiveRegion="polite">{DESCRICAO[ultimaSincronia.resultado]}</Texto>
        ) : null}
        {temServidor() ? (
          <View style={{ alignSelf: 'flex-start' }}>
            <Botao rotulo="Procurar atualização" variante="secondary" carregando={atualizando} onPress={atualizar} />
          </View>
        ) : null}
      </View>
      <Rotulo>Aviso</Rotulo>
      <Texto tipo="sm" mudo style={{ paddingHorizontal: espaco(4) }}>
        Material de consulta para profissionais de saúde. Não substitui o julgamento clínico nem a avaliação completa do paciente.
      </Texto>
    </ScrollView>
  );
}
