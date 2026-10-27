import Tabs from 'expo-router/js-tabs';
import { Ellipsis, PersonStanding, Search, Star } from 'lucide-react-native';
import { fonte, layout, useTema } from '../../theme';

export default function LayoutAbas() {
  const { c } = useTema();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c['text-muted'],
        tabBarStyle: { backgroundColor: c.bg, borderTopColor: c.border, minHeight: layout['app-tabbar'] },
        tabBarLabelStyle: { ...fonte('xs') },
        headerStyle: { backgroundColor: c.bg },
        headerShadowVisible: false,
        headerTitleStyle: { ...fonte('xl'), color: c.text },
        headerTitleAlign: 'left',
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Regiões', tabBarIcon: ({ color }) => <PersonStanding color={color} size={24} /> }} />
      <Tabs.Screen name="buscar" options={{ title: 'Buscar', tabBarIcon: ({ color }) => <Search color={color} size={24} /> }} />
      <Tabs.Screen name="favoritos" options={{ title: 'Favoritos', tabBarIcon: ({ color }) => <Star color={color} size={24} /> }} />
      <Tabs.Screen name="mais" options={{ title: 'Mais', tabBarIcon: ({ color }) => <Ellipsis color={color} size={24} /> }} />
    </Tabs>
  );
}
