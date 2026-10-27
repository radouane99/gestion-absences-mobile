import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

export function Page({ children }: PropsWithChildren) {
  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.page}>
      {children}
    </ScrollView>
  );
}
export function Bouton({
  titre,
  onPress,
  disabled = false,
}: {
  titre: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [ui.bouton, (disabled || pressed) && { opacity: 0.5 }]}
    >
      <Text style={ui.boutonTexte}>{titre}</Text>
    </Pressable>
  );
}
export function Champ({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View>
      <Text style={ui.texte}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#657084"
        {...props}
        style={ui.champ}
      />
    </View>
  );
}
export function Etat({
  loading,
  erreur,
  recharger,
}: {
  loading: boolean;
  erreur: string;
  recharger: () => void;
}) {
  return loading ? (
    <ActivityIndicator accessibilityLabel="Chargement" />
  ) : erreur ? (
    <View style={ui.carte}>
      <Text style={ui.texte}>{erreur}</Text>
      <Bouton titre="Réessayer" onPress={recharger} />
    </View>
  ) : null;
}
export function Choix({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { id: string; nom: string }[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={ui.texte}>{label}</Text>
      {!options.length && <Text style={ui.discret}>Aucun choix disponible.</Text>}
      {options.map((o) => (
        <Pressable
          key={o.id}
          disabled={disabled}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === o.id, disabled }}
          onPress={() => onChange(o.id)}
          style={[
            ui.carte,
            value === o.id && { borderColor: '#2457C5', backgroundColor: '#EAF0FF' },
          ]}
        >
          <Text style={ui.texte}>
            {value === o.id ? '●' : '○'} {o.nom}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export const ui = StyleSheet.create({
  page: { flexGrow: 1, padding: 20, gap: 16, backgroundColor: '#F4F6FA' },
  titre: { fontSize: 24, fontWeight: 'bold', color: '#183153' },
  texte: { fontSize: 16, color: '#183153' },
  discret: { fontSize: 14, color: '#657084' },
  carte: {
    padding: 16,
    gap: 10,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D9DFE8',
  },
  bouton: { padding: 15, borderRadius: 10, backgroundColor: '#2457C5', alignItems: 'center' },
  boutonTexte: { color: 'white', fontSize: 16, fontWeight: '600' },
  champ: {
    borderWidth: 1,
    borderColor: '#D9DFE8',
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'white',
    color: '#183153',
    marginTop: 6,
    fontSize: 16,
  },
});
