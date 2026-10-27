// S03 Regiões: mapa do corpo e a mesma lista em texto.
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ItemRegiao, MapaCorpo } from '../../components/dominio';
import { ComEstados } from '../../components/Estados';
import { Rotulo, Texto } from '../../components/ui';
import { listarRegioes } from '../../data/conteudo';
import { useCarregar } from '../../hooks/useCarregar';
import { espaco } from '../../theme';

export default function Regioes() {
  const estado = useCarregar(listarRegioes, []);
  const abrir = (slug: string) => router.push({ pathname: '/regiao/[slug]', params: { slug } });
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: espaco(6) }}>
      <ComEstados estado={estado}>
        {(regioes) => (
          <>
            <MapaCorpo regioes={regioes} aoEscolher={abrir} />
            <Texto tipo="xs" mudo style={{ textAlign: 'center', marginHorizontal: espaco(4) }}>
              Toque numa região da figura ou escolha na lista.
            </Texto>
            <Rotulo>Todas as regiões</Rotulo>
            {regioes.map((r) => <ItemRegiao key={r.slug} regiao={r} total={r.totalTestes} />)}
          </>
        )}
      </ComEstados>
    </ScrollView>
  );
}
