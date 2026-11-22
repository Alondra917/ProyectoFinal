import { Pressable, StyleSheet, Text } from 'react-native';
import { colores, espacios, radios } from '../tema/tema';

type Props = { titulo: string; onPress: () => void; disabled?: boolean };

export default function BotonSecundario({ titulo, onPress, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[styles.boton, disabled && styles.deshabilitado]}
    >
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    borderRadius: radios.l,
    borderWidth: 1,
    borderColor: colores.bordeVidrio,
    paddingVertical: espacios.m,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  deshabilitado: { opacity: 0.5 },
  texto: { color: colores.texto, fontSize: 16, fontWeight: '600' },
});