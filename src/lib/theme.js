import { useColorScheme } from 'react-native';
import { useDB } from './store';

const light = {
  bg: '#f4efe8', card: '#fffdf9', card2: '#f6efe5', line: '#e3d8c9', text: '#2a2119', text2: '#4d4034', muted: '#8a7b6a',
  input: '#fbf7f1', danger: '#c4455b', ok: '#3c8a5c', warn: '#b7862a', dark: false,
};
const dark = {
  bg: '#15110d', card: '#221c16', card2: '#2a231b', line: '#3a3027', text: '#efe6da', text2: '#c9bcab', muted: '#958775',
  input: '#1c1712', danger: '#e0677a', ok: '#6cc08f', warn: '#e3b34f', dark: true,
};

export function useTheme() {
  const db = useDB();
  const sys = useColorScheme();
  const t = db.settings.aparencia.tema;
  const isDark = t === 'escuro' || (t === 'sistema' && sys === 'dark');
  return { ...(isDark ? dark : light), accent: db.settings.aparencia.corDestaque || '#c0773a' };
}
