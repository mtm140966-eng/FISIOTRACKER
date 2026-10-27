// S12 Mais: downloads, sobre o conteúdo e aviso clínico.
import { Pressable, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight, Download } from 'lucide-react-native';
import { Rotulo, Texto } from '../../components/ui';
import { versaoDoConteudo } from '../../data/conteudo';
import { useCarregar } from '../../hooks/useCarregar';
import { espaco, useTema } from '../../theme';

export default function Mais() {
  const { c } = useTema();
  const versao = useCarregar(versaoDoConteudo, []);
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: espaco(6) }}>
      <Link href="/downloads" asChild>
        <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: espaco(3), minHeight: 56, paddingHorizontal: espaco(4), borderBottomWidth: 1, borderColor: c.border }}>
          <Download size={22} color={c.text} />
          <Texto style={{ flex: 1, fontWeight: '600' }}>Vídeos offline</Texto>
          <ChevronRight size={20} color={c['text-muted']} />
        </Pressable>
      </Link>
      <Rotulo>Sobre o conteúdo</Rotulo>
      <View style={{ paddingHorizontal: espaco(4), gap: espaco(2) }}>
        <Texto>Cada teste traz como executar, vídeo e os números de acurácia com a referência do estudo de onde vieram.</Texto>
        <Texto mudo tipo="sm">Versão do conteúdo: {versao.dados ?? '—'}</Texto>
      </View>
      <Rotulo>Aviso</Rotulo>
      <Texto tipo="sm" mudo style={{ paddingHorizontal: espaco(4) }}>
        Material de consulta para profissionais de saúde. Não substitui o julgamento clínico nem a avaliação completa do paciente.
      </Texto>
    </ScrollView>
  );
}
