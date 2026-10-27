import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { FavoritosProvider } from '../data/favoritos';
import { fonte, useTema } from '../theme';

// Na web, o anel de foco do sistema visual vale para todo elemento focado pelo teclado.
function useAnelDeFocoNaWeb(cor: string) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const estilo = document.createElement('style');
    estilo.textContent = `:focus-visible:not(input):not(textarea) { outline: 2px solid ${cor} !important; outline-offset: 2px; } input:focus, textarea:focus { outline: none; }`;
    document.head.appendChild(estilo);
    return () => estilo.remove();
  }, [cor]);
}

export default function Raiz() {
  const { esquema, c } = useTema();
  useAnelDeFocoNaWeb(c.focus);
  const base = esquema === 'dark' ? DarkTheme : DefaultTheme;
  const tema = {
    ...base,
    colors: { ...base.colors, primary: c.accent, background: c.bg, card: c.bg, text: c.text, border: c.border, notification: c.danger },
  };
  return (
    <ThemeProvider value={tema}>
      <FavoritosProvider>
        <StatusBar style={esquema === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerTintColor: c.text,
            headerTitleStyle: { ...fonte('lg'), color: c.text },
            headerStyle: { backgroundColor: c.bg },
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: c.bg },
          }}
        >
          <Stack.Screen name="(abas)" options={{ headerShown: false, title: 'Início' }} />
          <Stack.Screen name="regiao/[slug]" options={{ title: '' }} />
          <Stack.Screen name="teste/[slug]" options={{ title: '' }} />
          <Stack.Screen name="downloads" options={{ title: 'Vídeos offline' }} />
        </Stack>
      </FavoritosProvider>
    </ThemeProvider>
  );
}
