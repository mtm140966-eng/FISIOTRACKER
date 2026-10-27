import { Stack } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { EstadoVazio } from '../components/ui';

export default function NaoEncontrada() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <EstadoVazio Icone={SearchX} titulo="Página não encontrada" frase="Volte para Regiões e escolha de novo." />
    </>
  );
}
