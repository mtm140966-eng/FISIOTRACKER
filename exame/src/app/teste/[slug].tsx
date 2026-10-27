// S06–S09 Ficha do teste: Como fazer, Vídeo, Acurácia, Referências.
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { BookOpen, ChartNoAxesColumn, SearchX, Star, Video } from 'lucide-react-native';
import { Abas, CartaoEstudo, ItemReferencia } from '../../components/dominio';
import { ComEstados } from '../../components/Estados';
import { Aviso, Bloco, BotaoIcone, EstadoVazio, Texto } from '../../components/ui';
import { obterReferencias, obterTeste } from '../../data/conteudo';
import { useFavoritos } from '../../data/favoritos';
import { useCarregar } from '../../hooks/useCarregar';
import { estudosDiscordam } from '../../lib/evidencia';
import { espaco, useTema } from '../../theme';

// Em telas largas (tablet, web) o texto não passa desta largura.
const LARGURA_LEITURA = 720;

const ABAS = [
  { id: 'como', rotulo: 'Como fazer' },
  { id: 'video', rotulo: 'Vídeo' },
  { id: 'acuracia', rotulo: 'Acurácia' },
  { id: 'referencias', rotulo: 'Referências' },
];

export default function FichaDoTeste() {
  const { slug, aba: abaInicial } = useLocalSearchParams<{ slug: string; aba?: string }>();
  const [aba, setAba] = useState(ABAS.some((a) => a.id === abaInicial) ? (abaInicial as string) : 'como');
  const { c } = useTema();
  const fav = useFavoritos();
  const estado = useCarregar(async () => {
    const teste = await obterTeste(slug);
    const refs = teste ? await obterReferencias(teste.propriedades.map((p) => p.referenciaId)) : [];
    return { teste, refs };
  }, [slug]);

  return (
    <ComEstados estado={estado}>
      {({ teste, refs }) => {
        if (!teste) {
          return (
            <>
              <Stack.Screen options={{ title: 'Teste' }} />
              <EstadoVazio Icone={SearchX} titulo="Teste não encontrado" frase="Ele pode ter sido removido numa atualização do conteúdo." />
            </>
          );
        }
        const favorito = fav.ehFavorito(teste.slug);
        const numeroDaRef = (id: string) => refs.findIndex((r) => r.id === id) + 1;
        return (
          <View style={{ flex: 1 }}>
            <Stack.Screen
              options={{
                title: teste.nome,
                headerRight: () => (
                  <BotaoIcone Icone={Star} papel="switch" selecionado={favorito} rotulo="Favorito"
                    cor={favorito ? c.favorite : c.text} preenchido={favorito} onPress={() => fav.alternar(teste.slug)} />
                ),
              }}
            />
            <Abas abas={ABAS} ativa={aba} aoMudar={setAba} />
            <ScrollView contentContainerStyle={{ padding: espaco(4), paddingBottom: espaco(7), width: '100%', maxWidth: LARGURA_LEITURA, alignSelf: 'center' }}>
              {teste.demonstracao ? (
                <View style={{ marginBottom: espaco(3) }}>
                  <Aviso texto="Teste de demonstração: todos os números e referências são fictícios." />
                </View>
              ) : null}

              {aba === 'como' && (
                <>
                  {teste.nomeEn ? <Texto mudo style={{ marginBottom: espaco(3) }}>{teste.nomeEn}{teste.sinonimos.length ? ` · ${teste.sinonimos.join(' · ')}` : ''}</Texto> : null}
                  <Bloco titulo="Posição do paciente">{teste.posicaoPaciente || '—'}</Bloco>
                  <Bloco titulo="Execução">{teste.execucao || '—'}</Bloco>
                  <Bloco titulo="Positivo quando">{teste.resultadoPositivo || '—'}</Bloco>
                  {teste.observacoes ? <Texto tipo="sm" mudo style={{ marginTop: espaco(2) }}>{teste.observacoes}</Texto> : null}
                </>
              )}

              {aba === 'video' && (
                teste.video ? (
                  <Texto mudo>O player entra no próximo passo.</Texto>
                ) : (
                  <EstadoVazio Icone={Video} titulo="Vídeo ainda não gravado" frase="Quando o vídeo for publicado, ele aparece aqui. Enquanto isso, veja a aba Como fazer." />
                )
              )}

              {aba === 'acuracia' && (
                teste.propriedades.length === 0 ? (
                  <EstadoVazio Icone={ChartNoAxesColumn} titulo="Sem dados de acurácia" frase="Os estudos deste teste ainda não foram cadastrados." />
                ) : (
                  <>
                    {estudosDiscordam(teste.propriedades) ? (
                      <View style={{ marginBottom: espaco(3) }}>
                        <Aviso texto="Os estudos discordam: sensibilidade ou especificidade variam mais de 20 pontos entre eles." />
                      </View>
                    ) : null}
                    {teste.propriedades.map((p) => (
                      <CartaoEstudo key={p.id} p={p} titulo={`Estudo ${numeroDaRef(p.referenciaId)}`} />
                    ))}
                    <Texto tipo="xs" mudo style={{ marginTop: espaco(2) }}>
                      LR marcada como "calculada" foi obtida da sensibilidade e da especificidade, porque o estudo não a informou.
                    </Texto>
                  </>
                )
              )}

              {aba === 'referencias' && (
                refs.length === 0 ? (
                  <EstadoVazio Icone={BookOpen} titulo="Sem referências" frase="As referências aparecem junto com os dados de acurácia." />
                ) : (
                  refs.map((r) => <ItemReferencia key={r.id} r={r} numero={numeroDaRef(r.id)} />)
                )
              )}
            </ScrollView>
          </View>
        );
      }}
    </ComEstados>
  );
}
