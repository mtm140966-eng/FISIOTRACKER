// S05 Busca por nome, epônimo, nome em inglês ou suspeita diagnóstica.
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Search, SearchX, X } from 'lucide-react-native';
import { ItemTeste } from '../../components/dominio';
import { ComEstados } from '../../components/Estados';
import { EstadoVazio, Texto } from '../../components/ui';
import { buscarTestes } from '../../data/conteudo';
import { useFavoritos } from '../../data/favoritos';
import { useCarregar } from '../../hooks/useCarregar';
import { avaliarTeste } from '../../lib/evidencia';
import { MINIMO_BUSCA, normalizar } from '../../lib/busca';
import { espaco, fonte, layout, raio, useTema } from '../../theme';

export default function Buscar() {
  const { c } = useTema();
  const fav = useFavoritos();
  const [texto, setTexto] = useState('');
  const [focado, setFocado] = useState(false);
  const curta = normalizar(texto).length < MINIMO_BUSCA;
  const estado = useCarregar(() => buscarTestes(texto), [texto]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: espaco(4), paddingBottom: espaco(2) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco(2), minHeight: layout['touch-min'], paddingLeft: espaco(3), borderWidth: focado ? 2 : 1, borderColor: focado ? c.focus : c['border-input'], borderRadius: raio.md, backgroundColor: c.bg }}>
          <Search size={20} color={c['text-muted']} />
          <TextInput
            value={texto}
            onChangeText={setTexto}
            onFocus={() => setFocado(true)}
            onBlur={() => setFocado(false)}
            placeholder="Nome, epônimo ou suspeita"
            placeholderTextColor={c['text-muted']}
            accessibilityLabel="Buscar teste"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            style={[fonte('base'), { flex: 1, color: c.text, minHeight: layout['touch-min'], outlineWidth: 0 }]}
          />
          {texto ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setTexto('')} style={{ width: layout['touch-min'], height: layout['touch-min'], alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color={c['text-muted']} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        {curta ? (
          <Texto mudo style={{ paddingHorizontal: espaco(4) }}>
            Busque pelo nome em português ou inglês (Neer, empty can) ou pela suspeita (instabilidade, LCA).
          </Texto>
        ) : (
          <ComEstados estado={estado}>
            {(testes) =>
              testes.length === 0 ? (
                <EstadoVazio Icone={SearchX} titulo="Nenhum teste encontrado" frase={`Nada para "${texto.trim()}". Tente outro nome ou a suspeita diagnóstica.`} />
              ) : (
                <>
                  <Texto tipo="xs" mudo accessibilityLiveRegion="polite" style={{ marginHorizontal: espaco(4), marginBottom: espaco(2) }}>
                    {testes.length === 1 ? '1 resultado' : `${testes.length} resultados`}
                  </Texto>
                  {testes.map((t) => {
                    const { nivel, uso } = avaliarTeste(t.propriedades);
                    return (
                      <ItemTeste key={t.slug} slug={t.slug} nome={t.nome} subtitulo={t.categorias[0] ?? ''} nivel={nivel} uso={uso}
                        favorito={fav.ehFavorito(t.slug)} aoFavoritar={() => fav.alternar(t.slug)} />
                    );
                  })}
                </>
              )
            }
          </ComEstados>
        )}
      </ScrollView>
    </View>
  );
}
