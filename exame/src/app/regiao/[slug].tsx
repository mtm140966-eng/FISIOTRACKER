// S04 Lista de testes de uma região.
import { ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { ItemTeste } from '../../components/dominio';
import { ComEstados } from '../../components/Estados';
import { EstadoVazio } from '../../components/ui';
import { listarTestes, obterRegiao } from '../../data/conteudo';
import { useFavoritos } from '../../data/favoritos';
import { useCarregar } from '../../hooks/useCarregar';
import { avaliarTeste } from '../../lib/evidencia';

export default function TestesDaRegiao() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const fav = useFavoritos();
  const estado = useCarregar(async () => ({ regiao: await obterRegiao(slug), testes: await listarTestes(slug) }), [slug]);
  return (
    <ScrollView>
      <ComEstados estado={estado}>
        {({ regiao, testes }) => (
          <>
            <Stack.Screen options={{ title: regiao?.nome ?? 'Região' }} />
            {!regiao ? (
              <EstadoVazio Icone={ClipboardList} titulo="Região não encontrada" frase="Volte e escolha outra região." />
            ) : testes.length === 0 ? (
              <EstadoVazio Icone={ClipboardList} titulo="Nenhum teste ainda" frase={`Os testes de ${regiao.nome.toLowerCase()} ainda não foram publicados.`} />
            ) : (
              testes.map((t) => {
                const { nivel, uso } = avaliarTeste(t.propriedades);
                return (
                  <ItemTeste key={t.slug} slug={t.slug} nome={t.nome} subtitulo={t.categorias[0] ?? ''} nivel={nivel} uso={uso}
                    favorito={fav.ehFavorito(t.slug)} aoFavoritar={() => fav.alternar(t.slug)} />
                );
              })
            )}
          </>
        )}
      </ComEstados>
    </ScrollView>
  );
}
