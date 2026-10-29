import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Modal, FlatList, Switch, Alert, Platform, ToastAndroid, KeyboardAvoidingView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme';
import { fmtDate, matches } from '../lib/utils';

export const Icon = Ionicons;

export function Screen({ children, scroll = true, padded = true, footer }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: padded ? 14 : 0, paddingBottom: 40 + (footer ? 70 : 0), gap: 12 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : <View style={{ flex: 1, backgroundColor: c.bg }}>{children}</View>;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {body}
      {footer && <View style={[s.footer, { backgroundColor: c.card, borderTopColor: c.line, paddingBottom: 10 + insets.bottom }]}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}

export function Card({ title, right, children, style }) {
  const c = useTheme();
  return (
    <View style={[s.card, { backgroundColor: c.card, borderColor: c.line }, style]}>
      {(title || right) && (
        <View style={s.cardHead}>
          {title ? <Text style={[s.cardTitle, { color: c.text }]}>{title}</Text> : <View />}
          {right}
        </View>
      )}
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

export function Label({ children }) {
  const c = useTheme();
  return <Text style={[s.label, { color: c.text2 }]}>{children}</Text>;
}

export function Field({ label, hint, children, style }) {
  const c = useTheme();
  return (
    <View style={[{ gap: 5, flex: 1 }, style]}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {hint ? <Text style={{ color: c.muted, fontSize: 12 }}>{hint}</Text> : null}
    </View>
  );
}

export const Row = ({ children, gap = 10, style }) => <View style={[{ flexDirection: 'row', gap, alignItems: 'flex-start' }, style]}>{children}</View>;

export function Input({ style, multiline, ...rest }) {
  const c = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      placeholderTextColor={c.muted}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={[s.input, { backgroundColor: c.input, color: c.text, borderColor: focus ? c.accent : c.line }, multiline && { minHeight: 90, paddingTop: 10 }, style]}
      {...rest}
    />
  );
}

export function NumInput({ value, onChange, ...rest }) {
  return <Input keyboardType="decimal-pad" value={value === undefined || value === null ? '' : String(value)} onChangeText={(t) => onChange(t.replace(/[^0-9.,-]/g, ''))} {...rest} />;
}

export function Btn({ title, icon, variant = 'default', onPress, small, disabled, style, flex }) {
  const c = useTheme();
  const v = {
    primary: { bg: c.accent, fg: '#fff', bd: c.accent },
    default: { bg: c.card2, fg: c.text, bd: c.line },
    ghost: { bg: 'transparent', fg: c.text2, bd: 'transparent' },
    danger: { bg: 'transparent', fg: c.danger, bd: c.danger },
    whatsapp: { bg: '#25D366', fg: '#fff', bd: '#25D366' },
  }[variant];
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={({ pressed }) => [s.btn, small && s.btnSm, { backgroundColor: v.bg, borderColor: v.bd, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }, flex && { flex: 1 }, style]}>
      {icon && <Ionicons name={icon} size={small ? 15 : 18} color={v.fg} />}
      {title ? <Text style={{ color: v.fg, fontWeight: '600', fontSize: small ? 13 : 15 }} numberOfLines={1}>{title}</Text> : null}
    </Pressable>
  );
}

export function IconBtn({ icon, onPress, color, size = 20, style }) {
  const c = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [{ padding: 6, borderRadius: 8, opacity: pressed ? 0.5 : 1 }, style]}>
      <Ionicons name={icon} size={size} color={color || c.text2} />
    </Pressable>
  );
}

export function Badge({ color, children }) {
  return (
    <View style={{ backgroundColor: color + '26', borderColor: color + '66', borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' }}>
      <Text style={{ color, fontSize: 11.5, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

export function ListItem({ title, subtitle, right, onPress, left, last }) {
  const c = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.item, { borderBottomColor: c.line, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, backgroundColor: pressed ? c.card2 : 'transparent' }]}>
      {left}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: c.text, fontSize: 15.5, fontWeight: '600' }} numberOfLines={1}>{title}</Text>
        {subtitle ? (typeof subtitle === 'string' ? <Text style={{ color: c.muted, fontSize: 13 }} numberOfLines={2}>{subtitle}</Text> : subtitle) : null}
      </View>
      {right}
      {onPress && <Ionicons name="chevron-forward" size={18} color={c.muted} />}
    </Pressable>
  );
}

export function Empty({ icon = 'document-text-outline', title, text, action }) {
  const c = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: 36, gap: 8 }}>
      <Ionicons name={icon} size={46} color={c.muted} />
      <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={{ color: c.muted, textAlign: 'center' }}>{text}</Text> : null}
      {action}
    </View>
  );
}

export function Fab({ icon = 'add', onPress, label }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.fab, { backgroundColor: c.accent, bottom: 18 + insets.bottom * 0, opacity: pressed ? 0.85 : 1 }]}>
      <Ionicons name={icon} size={24} color="#fff" />
      {label && <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{label}</Text>}
    </Pressable>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Buscar…' }) {
  const c = useTheme();
  return (
    <View style={[s.search, { backgroundColor: c.input, borderColor: c.line }]}>
      <Ionicons name="search" size={17} color={c.muted} />
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={c.muted} style={{ flex: 1, color: c.text, fontSize: 15, paddingVertical: 9 }} />
      {value ? <IconBtn icon="close-circle" size={18} onPress={() => onChange('')} /> : null}
    </View>
  );
}

export function SwitchRow({ label, value, onChange, hint }) {
  const c = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 15 }}>{label}</Text>
        {hint ? <Text style={{ color: c.muted, fontSize: 12 }}>{hint}</Text> : null}
      </View>
      <Switch value={!!value} onValueChange={onChange} trackColor={{ true: c.accent, false: c.line }} thumbColor="#fff" activeThumbColor="#fff" />
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }) {
  const c = useTheme();
  return (
    <View style={[s.seg, { borderColor: c.line, backgroundColor: c.input }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.segItem, on && { backgroundColor: c.accent }]}>
            <Text style={{ color: on ? '#fff' : c.text2, fontWeight: '600', fontSize: 13 }} numberOfLines={1}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Sheet({ visible, onClose, title, children, full }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={[s.sheet, { backgroundColor: c.card, paddingBottom: 12 + insets.bottom }, full && { top: insets.top + 30 }]}>
        <View style={s.sheetHead}>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', flex: 1 }} numberOfLines={1}>{title}</Text>
          <IconBtn icon="close" onPress={onClose} />
        </View>
        {children}
      </View>
    </Modal>
  );
}

// Seletor em lista (com busca quando há muitas opções)
export function Select({ value, options, onChange, placeholder = 'Selecionar…', title, onCreate, createLabel = 'Cadastrar novo', allowClear }) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const sel = options.find((o) => o.value === value);
  const list = useMemo(() => options.filter((o) => matches(q, o.label, o.sub)), [options, q]);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[s.input, s.select, { backgroundColor: c.input, borderColor: c.line }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: sel ? c.text : c.muted, fontSize: 15 }} numberOfLines={1}>{sel ? sel.label : placeholder}</Text>
          {sel?.sub ? <Text style={{ color: c.muted, fontSize: 12 }} numberOfLines={1}>{sel.sub}</Text> : null}
        </View>
        <Ionicons name="chevron-down" size={18} color={c.muted} />
      </Pressable>
      <Sheet visible={open} onClose={() => { setOpen(false); setQ(''); }} title={title || placeholder} full={options.length > 8}>
        {options.length > 8 && <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}><SearchBar value={q} onChange={setQ} /></View>}
        {onCreate && (
          <Pressable onPress={() => { setOpen(false); onCreate(q); setQ(''); }} style={[s.createRow, { borderColor: c.accent }]}>
            <Ionicons name="add-circle" size={20} color={c.accent} />
            <Text style={{ color: c.accent, fontWeight: '700' }}>{createLabel}{q ? `: “${q}”` : ''}</Text>
          </Pressable>
        )}
        <FlatList
          data={allowClear && value ? [{ value: '', label: '— Nenhum —' }, ...list] : list}
          keyExtractor={(o) => String(o.value)}
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: options.length > 8 ? undefined : 420 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => { onChange(item.value, item); setOpen(false); setQ(''); }} style={({ pressed }) => [s.opt, { backgroundColor: pressed ? c.card2 : 'transparent', borderBottomColor: c.line }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 15.5 }}>{item.label}</Text>
                {item.sub ? <Text style={{ color: c.muted, fontSize: 12.5 }}>{item.sub}</Text> : null}
              </View>
              {item.value === value && <Ionicons name="checkmark" size={20} color={c.accent} />}
            </Pressable>
          )}
          ListEmptyComponent={<Text style={{ color: c.muted, padding: 16 }}>Nada encontrado</Text>}
        />
      </Sheet>
    </>
  );
}

let DateTimePickerAndroid = null;
if (Platform.OS === 'android') {
  try { DateTimePickerAndroid = require('@react-native-community/datetimepicker').DateTimePickerAndroid; } catch {}
}

export function DateField({ value, onChange }) {
  const c = useTheme();
  if (!DateTimePickerAndroid) {
    return <Input value={value || ''} onChangeText={onChange} placeholder="AAAA-MM-DD" />;
  }
  const open = () => {
    const d = value ? new Date(value + 'T12:00:00') : new Date();
    DateTimePickerAndroid.open({
      value: d, mode: 'date',
      onChange: (ev, date) => {
        if (ev.type !== 'set' || !date) return;
        const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        onChange(iso);
      },
    });
  };
  return (
    <Pressable onPress={open} style={[s.input, s.select, { backgroundColor: c.input, borderColor: c.line }]}>
      <Text style={{ color: value ? c.text : c.muted, flex: 1, fontSize: 15 }}>{value ? fmtDate(value) : 'Selecionar data'}</Text>
      <Ionicons name="calendar-outline" size={18} color={c.muted} />
    </Pressable>
  );
}

export function toast(msg) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
  else if (Platform.OS === 'web') console.log('[toast]', msg);
  else Alert.alert(msg);
}

export function confirm(title, message, okText = 'Confirmar', destructive = false) {
  if (Platform.OS === 'web') return Promise.resolve(globalThis.confirm ? globalThis.confirm(`${title}\n${message || ''}`) : true);
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: okText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ], { cancelable: true, onDismiss: () => resolve(false) });
  });
}

export function Hint({ children }) {
  const c = useTheme();
  return <Text style={{ color: c.muted, fontSize: 12.5, lineHeight: 18 }}>{children}</Text>;
}

export function Divider() {
  const c = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginVertical: 4 }} />;
}

export function Chips({ options, value, onChange }) {
  const c = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 14 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={{ paddingHorizontal: 13, paddingVertical: 7, borderRadius: 99, borderWidth: 1, borderColor: on ? c.accent : c.line, backgroundColor: on ? c.accent : c.card }}>
            <Text style={{ color: on ? '#fff' : c.text2, fontWeight: '600', fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function StringList({ items, onChange, placeholder = 'Novo item' }) {
  const c = useTheme();
  const [novo, setNovo] = useState('');
  const move = (i, d) => { const a = [...items]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  const add = () => { if (!novo.trim()) return; onChange([...items, novo.trim()]); setNovo(''); };
  return (
    <View style={{ gap: 8 }}>
      {items.map((it, i) => (
        <Row key={i} gap={2} style={{ alignItems: 'center' }}>
          <Input style={{ flex: 1 }} value={it} onChangeText={(t) => { const a = [...items]; a[i] = t; onChange(a); }} />
          <IconBtn icon="arrow-up" onPress={() => move(i, -1)} />
          <IconBtn icon="arrow-down" onPress={() => move(i, 1)} />
          <IconBtn icon="trash-outline" color={c.danger} onPress={() => onChange(items.filter((_, k) => k !== i))} />
        </Row>
      ))}
      <Row style={{ alignItems: 'center' }}>
        <Input style={{ flex: 1 }} value={novo} placeholder={placeholder} onChangeText={setNovo} onSubmitEditing={add} returnKeyType="done" />
        <Btn icon="add" title="Adicionar" onPress={add} />
      </Row>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 12.5, fontWeight: '600', letterSpacing: 0.2 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, minHeight: 46 },
  select: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 11, paddingHorizontal: 16, minHeight: 46 },
  btnSm: { minHeight: 36, paddingHorizontal: 11, borderRadius: 9 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14 },
  fab: { position: 'absolute', right: 18, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, height: 56, borderRadius: 28, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 11, paddingHorizontal: 12 },
  seg: { flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 3, gap: 3 },
  segItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.45)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '88%' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  opt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginBottom: 8, padding: 11, borderWidth: 1, borderStyle: 'dashed', borderRadius: 10 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
});
