// S11 Vídeos offline. Esqueleto: o download por região entra com os vídeos.
import { Download } from 'lucide-react-native';
import { EstadoVazio } from '../components/ui';

export default function Downloads() {
  return (
    <EstadoVazio Icone={Download} titulo="Nenhum vídeo publicado ainda" frase="Quando houver vídeos, você poderá baixá-los por região para usar sem internet." />
  );
}
