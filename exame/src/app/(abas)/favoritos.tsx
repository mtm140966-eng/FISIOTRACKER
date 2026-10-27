// S10 Favoritos.
import { ScrollView } from 'react-native';
import { Star } from 'lucide-react-native';
import { ItemTeste } from '../../components/dominio';
import { ComEstados } from '../../components/Estados';
import { EstadoVazio } from '../../components/ui';
import { obterTestes } from '../../data/conteudo';
import { useFavoritos } from '../../data/favoritos';
import { useCarregar } from '../../hooks/useCarregar';
import { avaliarTeste } from '../../lib/evidencia';

export default function Favoritos() {
  const fav = useFavoritos();
  const estado = useCarregar(() => obterTestes(fav.slugs), [fav.slugs]);
  if (fav.slugs.length === 0) {
    return <EstadoVazio Icone={Star} titulo="Nenhum favorito ainda" frase="Toque na estrela de um teste para encontrá-lo aqui." />;
  }
  return (
    <ScrollView>
      <ComEstados estado={estado}>
        {(testes) => testes.map((t) => {
          const { nivel, uso } = avaliarTeste(t.propriedades);
          return (
            <ItemTeste key={t.slug} slug={t.slug} nome={t.nome} subtitulo={t.categorias[0] ?? ''} nivel={nivel} uso={uso}
              favorito aoFavoritar={() => fav.alternar(t.slug)} />
          );
        })}
      </ComEstados>
    </ScrollView>
  );
}
